import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";
import Account from "../models/account.js";
import Transaction from "../models/transaction.js";

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
  const user = await User.findOne({ userId });
  const plaidRequest = {
    user: {
      // client_user_id: "user",
      client_user_id: user.userId,
    },
    client_name: "Plaid Test App",
    // products: process.env.PLAID_PRODUCTS.split(","),
    products: ["auth"],
    required_if_supported_products: ["transactions"],
    language: "en",
    // webhook: 'https://webhook.example.com',
    // redirect_uri: 'http://localhost:8081/',
    android_package_name: "com.yashso.fintrack",
    country_codes: process.env.PLAID_COUNTRY_CODES.split(","),
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
    response.json(createTokenResponse.data);
  } catch (error) {
    // console.log(response.json);
    response.status(500).json({ error: error.message });
  }
};

// For exchanging public token   --- NEED TO BE REFACTORED A BIT
export const exchangePublicToken = async (request, response) => {
  const { userId, public_token } = request.body;
  console.log(userId, public_token);
  const user = await User.findOne({ userId });
  var accessToken;
  try {
    // Only exchange token if the user doesn't have access token
    if (user.accessToken == "" || user.accessToken == null) {
      const plaidResponse = await plaidClient.itemPublicTokenExchange({
        public_token: public_token,
      });

      user.accessToken = plaidResponse.data.access_token;
      const itemID = plaidResponse.data.item_id;

      // const user = await User.findOneAndUpdate({userId}, {accessToken}, {new: true})
      // console.log(plaidResponse.data);

      user.save();
      console.log("user data saved");
    } else {
      accessToken = user.accessToken;
    }

    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });
    // console.log(balanceResponse.data);

    for (const accountData in balanceResponse.data.accounts) {
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
            subType: accountData.subType,
            persistent_account_id: accountData.persistent_account_id,
          });
          await newAccount.save();
          console.log("Bank account saved: ", accountData.account_id);
        } else {
          console.log("Bank account already exists: ", accountData.account_id);
        }
      } catch (error) {
        console.log(error);
      }
    }

    response.json({
      balance: balanceResponse.data,
    });
  } catch (error) {
    // handle error
    console.log("ERROR: ", error);
    response.send(error);
  }
};

// Getting balance
export const getBalance = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.accessToken) {
      throw new error("User not found or access token not set");
    }

    const accessToken = user.accessToken;
    const res = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });
    console.log("******  ", res.data.accounts);

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
            subType: accountData.subType,
            persistent_account_id: accountData.persistent_account_id,
          });
          await newAccount.save();
          console.log("Bank account saved: ", accountData.account_id);
        } else {
          console.log("Bank account already exists: ", accountData.account_id);
        }
      } catch (error) {
        console.log(error);
      }
    }

    response.json("Balance data saved to DB");
  } catch (e) {
    response.status(500).send(e);
  }
};

// Getting transactions data
export const getTransactions = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.accessToken) {
      throw new error("User not found or access token not set");
    }

    const accessToken = user.accessToken;
    const plaidRequest = {
      access_token: accessToken,
      start_date: "2024-04-19",
      end_date: "2024-07-19",
    };
    const res = await plaidClient.transactionsGet(plaidRequest);
    // console.log("transactions-  ", res.data);
    response.json(res.data);
  } catch (e) {
    response.status(500).send(e);
  }
};

export const syncTransactions = async (request, response) => {
  const { userId } = request.body;
  const user = await User.findOne({ userId });
  if (!user || !user.accessToken) {
    throw new error("User not found or access token not set");
  }

  let accessToken = user.accessToken;
  let cursor = user.plaidCursor;
  let hasMore = true;
  let addedTransactions = [];
  let modifiedTransactions = [];
  let removedTransactions = [];

  while (hasMore) {
    try {
      const syncResponse = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor,
        count: 500,
      });

      addedTransactions = addedTransactions.concat(syncResponse.data.added);
      modifiedTransactions = modifiedTransactions.concat(syncResponse.data.modified);
      removedTransactions = removedTransactions.concat(syncResponse.data.removed);

      cursor = syncResponse.data.next_cursor;
      hasMore = syncResponse.data.has_more;

      // Update user's cursor
      user.plaidCursor = cursor;
      await user.save();

    } catch (e) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  // Processing the transactions
  for (const transaction of addedTransactions) {
    await Transaction.create({
      userId: user._id,
      transactionId: transaction.transaction_id,
      accountId: transaction.account_id,
      amount: transaction.amount,
      date: new Date(transaction.date),
      name: transaction.name,
      merchantName: transaction.merchant_name,
      category: transaction.category[0],      
    });
  }

  for (const transaction of modifiedTransactions) {
    await Transaction.findOneAndUpdate(
      { transactionId: transaction.transaction_id },
      {
        amount: transaction.amount,
        date: new Date(transaction.date),
        name: transaction.name,
        merchantName: transaction.merchant_name,
        category: transaction.category[0],        
      }
    );
  }

  for (const transactionId of removedTransactions) {
    await Transaction.deleteOne({ transactionId: transactionId });
  }

  response.json({
    added: addedTransactions.length,
    modified: modifiedTransactions.length,
    removed: removedTransactions.length,
  });

};

// Getting proper auth info from plaid with access_token
export const auth = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    const accessToken = user.accessToken;
    // const access_token = request.body.access_token; // NEED TO CHANGE THIS - grab accessToken from DB instead from clients
    const plaidRequest = {
      access_token: accessToken,
    };
    const plaidResponse = await plaidClient.authGet(plaidRequest);
    // console.log("plaidResponse: ", plaidResponse.data);
    response.json(plaidResponse.data);
  } catch (e) {
    response.status(500).send("failed");
  }
};
