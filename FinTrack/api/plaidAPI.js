import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const createLinkToken = async (userId, isUpdate = false, accountNo = null) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/create_link_token`, {
      userId,
      isUpdate,
      accountNo,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating link token:", error);
    throw error;
  }
};

export const exchangePublicToken = async (userId, public_token, metadata) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/exchange_public_token`, {
      userId,
      public_token,
      metadata,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
};

export const getAccounts = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accounts: ", error);
    throw error;
  }
}

export const getBalance = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/balance/get`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching balance: ", error);
    throw error;
  }
};

export const syncTransactions = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/transactions/sync`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error syncing transactions: ", error);
    throw error;
  }
};

export const getRecurringTransactions = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/transactions/recurring/get`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recurring transactions: ", error);
    throw error;
  }
}
