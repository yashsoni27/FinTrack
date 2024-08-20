import { v4 as uuidv4 } from "uuid";
import { callController } from "../helpers/callController.js";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";
import Account from "../models/account.js";
import Transaction from "../models/transaction.js";
import Recurring from "../models/recurring.js";
import Budget from "../models/budget.js";

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
    // console.log("count, month: ", count, month);
    // console.log("userId: ", userId);

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

export const saveTransactionDb = async (request, response) => {
  try {
    const { data } = request.body;
    console.log("data: ", data);

    await Transaction.create({
      userId: data.userId,
      transactionId: uuidv4().replace(/-/g, ""),
      accountId: "offline",
      amount: data.amount,
      date: new Date(data.date),
      name: data.merchantName,
      merchantName: data.merchantName,
      // logoUrl: transaction.logo_url,
      // category: data.category,
      description: data.description,
    });

    response.json({
      message: "Transaction saved successfully",
    });
  } catch (e) {
    console.log("saveTransaction error: ", e);
    response.status(500).send(e);
  }
};

export const getChartData = async (request, response) => {
  try {
    const { userId, count, month } = request.body;
    // console.log("userId: ", userId);

    const prevMonth = month - 1;
    // console.log(month);
    // console.log(prevMonth);

    const currMonthResponse = await callController(getTransactionsDb, {
      userId: userId,
      count: count,
      month: month,
    });
    const prevMonthResponse = await callController(getTransactionsDb, {
      userId: userId,
      count: count,
      month: prevMonth,
    });

    const processData = (response, selectedMonth) => {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDate = today.getDate();

      const lastDay = selectedMonth === currentMonth ? currentDate : 31;

      const income = Array(lastDay)
        .fill()
        .map((_, index) => ({ value: 0, dataPointText: `${index + 1}` }));
      const expense = Array(lastDay)
        .fill()
        .map((_, index) => ({ value: 0, dataPointText: `${index + 1}` }));

      const transactions = response.transactions;
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

      let cumulativeIncome = 0;
      let cumulativeExpense = 0;

      transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const day = date.getDate() - 1; // Adjusting for 0-based index

        if (transaction.amount < 0) {
          // income[day].value += Math.abs(transaction.amount);
          cumulativeIncome += Math.abs(transaction.amount);
          income[day].value = Number(cumulativeIncome.toFixed(2));
        } else {
          // expense[day].value += transaction.amount;
          cumulativeExpense += transaction.amount;
          expense[day].value = Number(cumulativeExpense.toFixed(2));
        }
      });

      // Fill in cumulative values for days without transactions
      for (let i = 1; i < lastDay; i++) {
        if (income[i].value === 0) income[i].value = income[i - 1].value;
        if (expense[i].value === 0) expense[i].value = expense[i - 1].value;
      }

      return { income, expense };
    };

    const currMonthData = processData(currMonthResponse, month);
    const prevMonthData = processData(prevMonthResponse, prevMonth);

    response.json({ currMonthData, prevMonthData });
  } catch (error) {
    console.error("Error fetching chartData: ", error);
    response.status(500).send(error);
  }
};

export const getBudget = async (request, response) => {
  try {
    const { userId, month } = request.body;

    const today = new Date();
    const currentMonth = month || today.getMonth() + 1;
    const currentYear = today.getFullYear();
    console.log("month: ", currentMonth);
    console.log("year: ", currentYear);

    // const budgetResponse = await Budget.find({ userId: userId.month, year });

    // response.json({ budgetResponse: budgetResponse });
  } catch (error) {
    console.error("Error fetching budget: ", error);
    response.status(500).send(error);
  }
};

export const setBudget = async (request, response) => {
  try {
    const { userId, month, amount } = request.body;

    await Budget.create({
      userId: userId,
    });
  } catch (error) {
    console.error("Error setting budget: ", error);
    response.status(500).send(error);
  }
};
