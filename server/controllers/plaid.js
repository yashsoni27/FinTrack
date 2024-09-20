import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";
import Account from "../models/account.js";
import Transaction from "../models/transaction.js";
import Recurring from "../models/recurring.js";
import { getBalanceDb, getRecurringDb } from "./db.js";
import { callController } from "../helpers/callController.js";

// Plaid common configuration
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-VERSION": "2020-09-14",
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(configuration);

// Plaid API starts
// Creating a temporary link token for bank connect
export const createLinkToken = async (request, response) => {
  const { userId } = request.body;
  console.log(userId);
  const user = await User.findOne({ userId });
  const plaidRequest = {
    user: {
      client_user_id: user.userId,
    },
    client_name: "Fintracker",
    products: ["auth"],
    required_if_supported_products: ["transactions"],
    language: "en",
    android_package_name: "com.yashso.fintrack",
    country_codes: process.env.PLAID_COUNTRY_CODES.split(","),
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
    response.json(createTokenResponse.data);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// For exchanging public token with permanent access token
export const exchangePublicToken = async (request, response) => {
  const { userId, public_token, metadata } = request.body;
  const user = await User.findOne({ userId });
  // console.log(user);
  var accessToken;
  try {
    // Only exchange token if the user doesn't have access token
    // if (!user.institutions || user.institutions.length == 0) {
    const plaidResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const institution = {
      institutionId: metadata.institution.id,
      name: metadata.institution.name,
      accessToken: plaidResponse.data.access_token,
      plaidCursor: null,
    };

    // Initialize institutions if undefined
    if (!user.institutions) {
      user.institutions = [];
    }

    user.institutions.push(institution);
    user.onBoarded = true;
    user.save();

    accessToken = plaidResponse.data.access_token;
    console.log("user data saved");
    // } else {
    //   accessToken = user.institutions[0].accessToken;
    // }

    const authData = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    response.json({
      auth: authData.data,
    });
  } catch (error) {
    console.log("ERROR: ", error);
    response.send(error);
  }
};

// Getting balance
export const getBalance = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new Error("User not found or access token not set");
    }

    for (const institution of user.institutions) {
      // Grabbing account info and saving to DB
      const res = await plaidClient.accountsBalanceGet({
        access_token: institution.accessToken,
      });

      // console.log("res:  ", res.data.accounts);
      for (const accountData of res.data.accounts) {
        try {
          const existingAccount = await Account.findOne({
            account_id: accountData.account_id,
          });

          if (!existingAccount) {
            const newAccount = new Account({
              account_id: accountData.account_id,
              balances: {
                available: accountData.balances.available,
                current: accountData.balances.current,
                iso_currency_code: accountData.balances.iso_currency_code,
                limit: accountData.balances.limit,
                unofficial_currency_code:
                  accountData.balances.unofficial_currency_code,
              },
              mask: accountData.mask,
              name: accountData.name,
              type: accountData.type,
              subType: accountData.subtype,
              persistent_account_id: accountData.persistent_account_id,
              userId: userId,
            });
            await newAccount.save();
            console.log("Bank account saved: ", accountData.account_id);
            console.log("Name: ", accountData.name);
          } else {
            console.log("Bank account updated: ", accountData.account_id);
            console.log("Name: ", accountData.name);
            existingAccount.balances.available = accountData.balances.available;
            existingAccount.balances.current = accountData.balances.current;
            existingAccount.balances.limit = accountData.balances.limit;
            existingAccount.save();
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    const balanceResponse = await callController(getBalanceDb, { userId });

    response.json(balanceResponse);
    // response.json({ netBalance: netBalance });
  } catch (e) {
    response.status(500).send(e);
  }
};

// Getting transactions data -- Could be removed as syncTransactions is used
export const getTransactions = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found or access token not set");
    }

    // const accessToken = user.institutions[0].accessToken;
    const plaidRequest = {
      access_token: user.institutions[0].accessToken,
      start_date: "2024-04-19",
      end_date: "2024-07-19",
    };
    const res = await plaidClient.transactionsGet(plaidRequest);
    // console.log("transactions-  ", res.data);
    response.json(res.data);
    // response.json("testing");
  } catch (e) {
    response.status(500).send(e);
  }
};

// Fetching transactions and updates
export const syncTransactions = async (request, response) => {
  const { userId } = request.body;
  const user = await User.findOne({ userId });
  if (!user || !user.institutions || user.institutions.length == 0) {
    throw new error("User not found or access token not set");
  }

  try {
    let allInstitutions = [];
    user.institutions.forEach((institution) => {
      allInstitutions.push({
        accessToken: institution.accessToken,
        plaidCursor: institution.plaidCursor,
      });
    });

    let allAddedTransactions = [];
    let allModifiedTransactions = [];
    let allRemovedTransactions = [];

    for (let i = 0; i < allInstitutions.length; i++) {
      const institution = allInstitutions[i];

      // let accessToken = user.institutions[0].accessToken;
      // let cursor = user.institutions[0].plaidCursor;
      let hasMore = true;
      let addedTransactions = [];
      let modifiedTransactions = [];
      let removedTransactions = [];

      while (hasMore) {
        try {
          const syncResponse = await plaidClient.transactionsSync({
            access_token: institution.accessToken,
            cursor: institution.plaidCursor,
            // count: 10,
          });

          addedTransactions = addedTransactions.concat(syncResponse.data.added);
          modifiedTransactions = modifiedTransactions.concat(
            syncResponse.data.modified
          );
          removedTransactions = removedTransactions.concat(
            syncResponse.data.removed
          );

          institution.plaidCursor = syncResponse.data.next_cursor;
          hasMore = syncResponse.data.has_more;
        } catch (e) {
          console.error("Error syncing transactions:", e);
          throw e;
        }
      }

      allAddedTransactions = allAddedTransactions.concat(addedTransactions);
      allModifiedTransactions = allModifiedTransactions.concat(modifiedTransactions);
      allRemovedTransactions = allRemovedTransactions.concat(removedTransactions);

      // Update user's cursor
      user.institutions[i].plaidCursor = institution.plaidCursor;
      // await user.institutions[i].save();
    }
    await user.save();

    // Processing the transactions
    for (const transaction of allAddedTransactions) {
      await Transaction.create({
        userId: user.userId,
        transactionId: transaction.transaction_id,
        accountId: transaction.account_id,
        amount: transaction.amount,
        date: new Date(transaction.date),
        name: transaction.name,
        merchantName: transaction.merchant_name,
        logoUrl: transaction.logo_url,
        personalFinanceCategoryIconUrl:
          transaction.personal_finance_category_icon_url,
        category: transaction.category,
        personalFinanceCategory: transaction.personal_finance_category,
        // description: transaction.description, -- Not for plaid response
      });
    }

    for (const transaction of allModifiedTransactions) {
      await Transaction.findOneAndUpdate(
        { transactionId: transaction.transaction_id },
        {
          amount: transaction.amount,
          date: new Date(transaction.date),
          name: transaction.name,
          merchantName: transaction.merchant_name,
          category: transaction.category[0],
          personalFinanceCategory: transaction.personal_finance_category,
        }
      );
    }

    for (const transaction of allRemovedTransactions) {
      await Transaction.deleteOne({
        transactionId: transaction.transaction_id,
      });
    }

    response.json({
      added: allAddedTransactions.length,
      modified: allModifiedTransactions.length,
      removed: allRemovedTransactions.length,
    });
  } catch (e) {
    console.log("Sync transaction error: ", e);
    response.status(500).send("sync error");
  }
};

// Fetching the recurring transactions
export const recurringTransactions = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found or access token not set");
    }
    const accessToken = user.institutions[0].accessToken;

    const accountIds = await Account.find(
      { userId: userId },
      { account_id: 1 }
    );
    const accountIdArray = accountIds.map((account) => account.account_id);

    const plaidRequest = {
      access_token: accessToken,
      account_ids: accountIdArray,
    };
    const plaidResponse = await plaidClient.transactionsRecurringGet(
      plaidRequest
    );
    let inflowStreams = plaidResponse.data.inflow_streams;
    let outflowStreams = plaidResponse.data.outflow_streams;

    const saveOrUpdateStream = async (stream, streamType) => {
      for (const streamItem of stream) {
        const updateData = {
          userId: userId,
          stream: streamType,
          name: streamItem.name,
          accountId: streamItem.account_id,
          averageAmount: streamItem.average_amount,
          category: streamItem.category,
          description: streamItem.description,
          firstDate: streamItem.first_date,
          frequency: streamItem.frequency,
          isActive: streamItem.is_active,
          isUserModified: streamItem.is_user_modified,
          lastAmount: streamItem.last_amount,
          lastDate: streamItem.last_date,
          merchantName: streamItem.merchant_name,
          status: streamItem.status,
          transactionIds: streamItem.transaction_ids,
        };

        await Recurring.updateOne(
          { userId, streamId: streamItem.stream_id },
          { $set: updateData },
          { upsert: true }
        );
      }
    };

    await saveOrUpdateStream(inflowStreams, "Inflow");
    await saveOrUpdateStream(outflowStreams, "Outflow");

    // Fetch all recurring transactions from DB
    const recurringResponse = await callController(getRecurringDb, { userId });
    // console.log("recurringResponse: ", recurringResponse);

    response.json(recurringResponse);
  } catch (e) {
    console.log("recurringTransactions error: ", e);
    response.status(500).send(e);
  }
};

// Getting proper auth info from plaid with access_token -- PROBABLY NO USE AS OF NOW
export const auth = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found or access token not set");
    }
    // const accessToken = user.institutions[0].accessToken;
    const plaidRequest = {
      access_token: user.institutions[0].accessToken,
    };
    const plaidResponse = await plaidClient.authGet(plaidRequest);
    console.log("plaidResponse: ", plaidResponse.data);
    response.json(plaidResponse.data);
  } catch (e) {
    response.status(500).send(e);
  }
};

// Getting the institution logo -- PROBABLY NO USE AS OF NOW
export const institutionLogo = async (request, response) => {
  try {
    const { userId } = request.body;
    console.log(userId);
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found or access token not set");
    }

    const insId = {
      institution_id: user.institutions[0].institutionId,
      country_codes: ["GB"],
    };
    const options = {
      include_optional_metadata: true,
      include_status: true,
    };

    const res = await plaidClient.institutionsGetById(insId, options);

    console.log(res.data);
    response.json(res.data);
  } catch (error) {
    console.log("institutionLogo error: ", error);
    response.status(500).send(error);
  }
};

// Getting the categories -- PRBABLY NO USE AS OF NOW
export const getCategories = async (request, response) => {
  try {
    const res = await plaidClient.categoriesGet({});
    response.json(res.data.categories);
  } catch (e) {
    response.status(500).send(e);
  }
};
