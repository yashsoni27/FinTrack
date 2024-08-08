import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";
import Account from "../models/account.js";
import Transaction from "../models/transaction.js";
import Recurring from "../models/recurring.js";

export const getAccountsDb = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found");
    }

    const accounts = await Account.find({ userId: userId });

    response.json({ accounts: accounts });
  } catch (e) {
    response.status(500).send(e);
  }
};

export const getBalanceDb = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found");
    }

    const netBalance = await Account.find({ userId: userId });

    response.json({ netBalance: netBalance });
  } catch (e) {
    response.status(500).send(e);
  }
};

export const getTransactionsDb = async (request, response) => {
  try {
    const { userId, count, month } = request.body;
    console.log("userId: ", userId);

    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found or access token not set");
    }

    const currDate = new Date();
    const currMonth = month || currDate.getMonth() + 1;
    const currYear = currDate.getFullYear();

    // Calculate the start and end dates for the query
    const startDate = new Date(currYear, currMonth - 1, 1); // first day of the month
    const endDate = new Date(currYear, currMonth, 0, 23, 59, 59);

    let query = Transaction.find({
      userId: userId,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });

    if (count || count != 0) {
      query = query.limit(count);
    } else if (count == null) {
      query = query.limit(10);
    }

    const transactions = await query.exec();

    // const transactions = await Transaction.find({ userId: userId })
    //   .sort({ date: -1 })
    //   .limit(count);

    // console.log("transactions: ", transactions);
    response.json({ transactions: transactions });
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    response.status(500).send(error);
  }
};

export const getRecurringDb = async (request, response) => {
  try {
    const { userId } = request.body;
    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new error("User not found or access token not set");
    }

    const recurringTransactions = await Recurring.find({
      userId: userId,
      isActive: true,
    });

    response.json({
      inflowStreams: recurringTransactions.filter(
        (stream) => stream.stream === "Inflow"
      ),
      outflowStreams: recurringTransactions.filter(
        (stream) => stream.stream === "Outflow"
      ),
    });
  } catch (e) {
    console.log("recurringTransactions error: ", e);
    response.status(500).send(e);
  }
};
