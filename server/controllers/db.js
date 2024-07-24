import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";
import Account from "../models/account.js";
import Transaction from "../models/transaction.js";

export const getDbBalance = async (request, response) => {
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
        console.log(accountData);

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

    // response.json("Balance data saved to DB");
  } catch (e) {
    response.status(500).send(e);
  }
};
