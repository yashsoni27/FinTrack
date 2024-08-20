import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const getAccountsDb = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/accounts/get`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error fetching accounts: ", error);
    throw error;
  }
}

export const getBalanceDb = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/balance/get`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error fetching balance: ", error);
    throw error;
  }
};

export const getTransactionsDb = async (userId, count = 0, month = null) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/transactions/get`, { userId, count, month });
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    throw error;
  }
};

export const getRecurringTransactionsDb = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/transactions/recurring/get`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error fetching recurring transactions: ", error);
    throw error;
  }
}

export const saveTransactionDb = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/transactions/save`, {data});
    return response.data;
  } catch (error) {
    console.error("Error saving transaction: ", error);
    throw error;
  }
}

export const getChartData = async (userId, count = 0, month = null) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/chartData/get`, { userId, count, month });
    return response.data;
  } catch (error) {
    console.error("Error fetching chartData: ", error);
    throw error;
  }
}

export const getBudget = async (userId, month = null) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/budget/get`, { userId, month });
    return response.data;
  } catch (error) {
    console.error("Error fetching budget: ", error);
    throw error;
  }
}

export const setBudget = async (userId, data) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/budget/set`, { userId, data });
    return response.data;
  } catch (error) {
    console.error("Error setting budget: ", error);
    throw error;
  }
}
