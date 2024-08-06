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

export const getTransactionsDb = async (userId, count) => {
  try {
    const response = await axios.post(`${BASE_URL}/db/transactions/get`, { userId, count });
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
