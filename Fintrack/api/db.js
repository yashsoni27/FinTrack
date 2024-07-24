import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const getCurrentBalance = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/balance/get`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error fetching balance: ", error);
    throw error;
  }
};

export const getTransactions = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/transactions/get`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    throw error;
  }
};
