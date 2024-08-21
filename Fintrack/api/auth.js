import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

// console.log("BASE_URL", BASE_URL);

export const userSignIn = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/signin`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const userSignUp = async (name, email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/signup`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/forgot-password`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const resetPassword = async (email, resetCode, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/reset-password`, {
      email,
      resetCode,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const deleteAccount = async (userId, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/delete-account`, {
      userId,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
