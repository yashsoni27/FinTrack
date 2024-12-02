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
      throw new Error("User not found");
    }

    const accounts = await Account.find({ userId: userId, isDeleted: false });

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
      throw new Error("User not found");
    }

    const netBalance = await Account.find({ userId: userId, isDeleted: false });

    response.json({ netBalance: netBalance });
  } catch (e) {
    console.log("balance error", e);
    response.status(500).send(e);
  }
};

export const getTransactionsDb = async (request, response) => {
  try {
    const { userId, count, month } = request.body;
    console.log(userId, count, month);

    const user = await User.findOne({ userId });
    if (!user || !user.institutions || user.institutions.length == 0) {
      throw new Error("User not found or access token not set");
    }

    let query = Transaction.find({
      userId: userId,
    });

    if (count > 0) {      
      query = query.limit(count);
    } else if (count == null || count == 0) {      
      const currDate = new Date();
      const currMonth = month || currDate.getMonth() + 1;
      const currYear = currDate.getFullYear();

      // Calculate the start and end dates for the query
      const startDate = new Date(currYear, currMonth - 1, 1); // first day of the month
      const endDate = new Date(currYear, currMonth, 0, 23, 59, 59);
      query = query.find({
        date: { $gte: startDate, $lt: endDate },
      });
    }

    query = query.sort({ date: -1 });

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
      throw new Error("User not found or access token not set");
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

export const updateTransactionDb = async (request, response) => {
  try {
    const { data } = request.body;
    console.log("data: ", data);

    await Transaction.findOneAndUpdate(
      { transactionId: data.transactionId },
      {
        excludeFromAnalytics: data.excludeFromAnalytics
      }
    );

    response.json({
      message: "Transaction updated successfully"
    });
  } catch (e) {
    console.log("updateTransaction error: ", e);
    response.status(500).send(e);
  }
};

export const getChartData = async (request, response) => {
  try {
    const { userId, count, month } = request.body;

    const prevMonth = month - 1;

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
      const date = new Date();
      const currentMonth = date.getMonth() + 1;
      const currentDate = date.getDate();

      // const lastDay = selectedMonth === currentMonth ? currentDate : 31;
      const lastDay = currentDate;
      const filteredDate = new Date(
        date.getFullYear(),
        selectedMonth - 1,
        currentDate
      );

      const income = Array(lastDay)
        .fill()
        .map((_, index) => ({ value: 0, dataPointText: `${index + 1}` }));
      const expense = Array(lastDay)
        .fill()
        .map((_, index) => ({ value: 0, dataPointText: `${index + 1}` }));

      const transactions = response.transactions;
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate <= filteredDate;
      });

      let cumulativeIncome = 0;
      let cumulativeExpense = 0;

      filteredTransactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const day = date.getDate() - 1; // Adjusting for 0-based index

        if (transaction.amount < 0) {
          cumulativeIncome += Math.abs(transaction.amount);
          income[day].value = Number(cumulativeIncome.toFixed(2));
        } else {
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
    // console.log("month: ", currentMonth);
    // console.log("year: ", currentYear);

    const startDate = new Date(currentYear, currentMonth - 1, 1); // first day of the month
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const pipeline = [
      {
        $match: {
          userId,
          date: { $gte: startDate, $lt: endDate },
          excludeFromAnalytics: { $ne: true },
          amount: {$gte: 0}
        },
      },
      {
        $group: {
          _id: null, // Set to null as we want overall summary
          totalSpent: { $sum: "$amount" },
          shopping: {
            $sum: {
              $cond: {
                if: {
                  $eq: [
                    "$personalFinanceCategory.primary",
                    "GENERAL_MERCHANDISE",
                  ],
                },
                then: "$amount",
                else: 0,
              },
            },
          },
          entertainment: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$personalFinanceCategory.primary", "ENTERTAINMENT"],
                },
                then: "$amount",
                else: 0,
              },
            },
          },
          foodAndDrink: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$personalFinanceCategory.primary", "FOOD_AND_DRINK"],
                },
                then: "$amount",
                else: 0,
              },
            },
          },
          transportation: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$personalFinanceCategory.primary", "TRANSPORTATION"],
                },
                then: "$amount",
                else: 0,
              },
            },
          },
          home: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$personalFinanceCategory.primary", "HOME_IMPROVEMENT"],
                },
                then: "$amount",
                else: 0,
              },
            },
          },
          other: {
            $sum: {
              $cond: [
                {
                  $not: [
                    {
                      $in: [
                        "$personalFinanceCategory.primary",
                        [
                          "GENERAL_MERCHANDISE",
                          "ENTERTAINMENT",
                          "FOOD_AND_DRINK",
                          "TRANSPORTATION",
                          "HOME_IMPROVEMENT",
                        ],
                      ],
                    },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: { $ifNull: ["$totalSpent", 0] },
          shopping: { $ifNull: ["$shopping", 0] },
          entertainment: { $ifNull: ["$entertainment", 0] },
          foodAndDrink: { $ifNull: ["$foodAndDrink", 0] },
          transportation: { $ifNull: ["$transportation", 0] },
          home: { $ifNull: ["$home", 0] },
          other: { $ifNull: ["$other", 0] },
        },
      },
    ];

    const transactionResponse = await Transaction.aggregate(pipeline);
    console.log("transaction response: ", transactionResponse);

    const budgetResponse = await Budget.find({
      userId: userId,
      month: currentMonth,
      year: currentYear,
    });
    console.log("budget response: ", budgetResponse);


    if (budgetResponse.length > 0) {
      console.log("1");
      if (transactionResponse.length > 0) {
        console.log("2");
        budgetResponse[0].spent = transactionResponse[0].total;

        budgetResponse[0].category.shopping.spent =
          transactionResponse[0].shopping;
        budgetResponse[0].category.entertainment.spent =
          transactionResponse[0].entertainment;
        budgetResponse[0].category.foodAndDrink.spent =
          transactionResponse[0].foodAndDrink;
        budgetResponse[0].category.transportation.spent =
          transactionResponse[0].transportation;
        budgetResponse[0].category.home.spent = transactionResponse[0].home;
        budgetResponse[0].category.other.spent = transactionResponse[0].other;

        await Budget.findOneAndUpdate(
          { userId: userId, month: currentMonth, year: currentYear },
          { spent: transactionResponse[0].total }
        );
      } else {
        console.log("3");
        budgetResponse[0].spent = 0;
        budgetResponse[0].category.shopping.spent =
          0;
        budgetResponse[0].category.entertainment.spent =
          0;
        budgetResponse[0].category.foodAndDrink.spent =
          0;
        budgetResponse[0].category.transportation.spent =
          0;
        budgetResponse[0].category.home.spent = 0;
        budgetResponse[0].category.other.spent = 0;

        await Budget.findOneAndUpdate(
          { userId: userId, month: currentMonth, year: currentYear },
          { spent: 0 }
        );
      }
    } else {
      console.log("4");
      const prevBudgetResponse = await Budget.find({
        userId: userId,
        month: currentMonth - 1,
        year: currentYear,
      });

      let data = {};
      if (prevBudgetResponse.length > 0) {
      data = {
        totalSpending: prevBudgetResponse[0].budget,
        shopping: prevBudgetResponse[0].category.shopping.budget,
        entertainment: prevBudgetResponse[0].category.entertainment.budget,
        foodAndDrink: prevBudgetResponse[0].category.foodAndDrink.budget,
        transportation: prevBudgetResponse[0].category.transportation.budget,
        home: prevBudgetResponse[0].category.home.budget,
        other: prevBudgetResponse[0].category.other.budget,
        };
      }

      const currMonthResponse = await callController(setBudget, {
        userId: userId,
        data: data,
      });
      console.log(currMonthResponse);
    }

    response.json(budgetResponse);
  } catch (error) {
    console.error("Error fetching budget: ", error);
    response.status(500).send(error);
  }
};

export const setBudget = async (request, response) => {
  try {
    const { userId, data } = request.body;

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

    const budgetResponse = await Budget.find({
      userId: userId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    if (budgetResponse.length > 0) {
      await Budget.findOneAndUpdate(
        {
          userId: userId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
        {
          budget: data.totalSpending,
          category: {
            shopping: { budget: data.shopping },
            entertainment: { budget: data.entertainment },
            foodAndDrink: { budget: data.foodAndDrink },
            transportation: { budget: data.transportation },
            home: { budget: data.home },
            other: { budget: data.other },
          },
        }
      );
    } else {
      await Budget.create({
        userId: userId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        budget: data.totalSpending,
        // spent: data.spent,
        category: {
          shopping: { budget: data.shopping },
          entertainment: { budget: data.entertainment },
          foodAndDrink: { budget: data.foodAndDrink },
          transportation: { budget: data.transportation },
          home: { budget: data.home },
          other: { budget: data.other },
        },
      });
    }

    return response.json({ message: "Budget set successfully" });
  } catch (error) {
    console.error("Error setting budget: ", error);
    response.status(500).send(error);
  }
};
