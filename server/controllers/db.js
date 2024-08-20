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
    console.log(userId);

    const today = new Date();
    const currentMonth = month || today.getMonth() + 1;
    const currentYear = today.getFullYear();
    console.log("month: ", currentMonth);
    console.log("year: ", currentYear);

    const startDate = new Date(currentYear, currentMonth - 1, 1); // first day of the month
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const pipeline = [
      {
        $match: {
          userId,
          date: { $gte: startDate, $lt: endDate },
          excludeFromAnalytics: { $ne: true }
        },
      },
      {
        $group: {
          _id: null, // Set to null as we want overall summary
          totalSpent: { $sum: "$amount" },
          shoppingSpent: {
            $sum: {
              $cond: {
                if: { $eq: ["$personalFinanceCategory.primary", "GENERAL_MERCHANDISE"] },
                then: "$amount",
                else: 0,
              },
            },
          },
          entertainmentSpent: {
            $sum: {
              $cond: {
                if: { $eq: ["$personalFinanceCategory.primary", "ENTERTAINMENT"] },
                then: "$amount",
                else: 0,
              },
            },
          },
          foodAndDrinkSpent: {
            $sum: {
              $cond: {
                if: { $eq: ["$personalFinanceCategory.primary", "FOOD_AND_DRINK"] },
                then: "$amount",
                else: 0,
              },
            },
          },
          transportationSpent: {
            $sum: {
              $cond: {
                if: { $eq: ["$personalFinanceCategory.primary", "TRANSPORTATION"] },
                then: "$amount",
                else: 0,
              },
            },
          },
          otherSpent: {
            $sum: {
              $cond: [
                {
                  $not: [
                    {
                      $in: [
                        "$personalFinanceCategory.primary",
                        ["GENERAL_MERCHANDISE", "ENTERTAINMENT", "FOOD_AND_DRINK", "TRANSPORTATION"]
                      ]
                    }
                  ]
                },
                "$amount",
                0
              ]
            }
          }
        },
      },
      // {
      //   $project: {
      //     _id: 0,
      //     totalSpent: { $ifNull: ["$totalSpent", 0] },
      //     shoppingSpent: { $ifNull: ["$shoppingSpent", 0] },
      //     entertainmentSpent: { $ifNull: ["$entertainmentSpent", 0] },
      //     foodAndDrinkSpent: { $ifNull: ["$foodAndDrinkSpent", 0] },
      //     transportationSpent: { $ifNull: ["$transportationSpent", 0] },
      //     // otherSpent: { $ifNull: ["$otherSpent", 0] },
      //   }
      // },
    ];

    const transactionResponse = await Transaction.aggregate(pipeline);
    // console.log("response: ", transactionResponse);

    const budgetResponse = await Budget.find({
      userId: userId.month,
      month: currentMonth,
      year: currentYear,
    });

    response.json({ budgetResponse: budgetResponse });
  } catch (error) {
    console.error("Error fetching budget: ", error);
    response.status(500).send(error);
  }
};

export const setBudget = async (request, response) => {
  try {
    const { userId, month, data } = request.body;

    // Shopping: GENERAL_MERCHANDISE
    // Entertainment: ENTERTAINMENT
    // FoodAndDrink: FOOD_AND_DRINK
    // Transportation: TRANSPORTATION
    // Home: HOME_IMPROVEMENT
    // Other: RENT

    // { _id: 'GENERAL_MERCHANDISE', count: 89 },
    // { _id: 'ENTERTAINMENT', count: 58 },
    // { _id: 'FOOD_AND_DRINK', count: 47 },
    // { _id: 'LOAN_PAYMENTS', count: 35 },
    // { _id: 'BANK_FEES', count: 24 },
    // { _id: 'GENERAL_SERVICES', count: 21 },
    // { _id: 'TRANSPORTATION', count: 20 },
    // { _id: 'TRANSFER_OUT', count: 19 },
    // { _id: 'PERSONAL_CARE', count: 19 },
    // { _id: 'HOME_IMPROVEMENT', count: 16 },
    // { _id: 'RENT_AND_UTILITIES', count: 15 },
    // { _id: 'GOVERNMENT_AND_NON_PROFIT', count: 10 },
    // { _id: 'MEDICAL', count: 10 }

    await Budget.create({
      userId: userId,
      month: month || new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      budget: data.budget,
      spent: data.spent,
      category: {
        shopping: { budget: data.category.shopping.budget },
        entertainment: { budget: data.category.entertainment.budget },
        foodAndDrink: { budget: data.category.foodAndDrink.budget },
        transportation: { budget: data.category.transportation.budget },
        home: { budget: data.category.home.budget },
        other: { budget: data.category.other.budget },
      },
    });

    return response.json({ message: "Budget set successfully" });
  } catch (error) {
    console.error("Error setting budget: ", error);
    response.status(500).send(error);
  }
};
