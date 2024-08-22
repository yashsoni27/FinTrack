import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const userSignIn = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/signin`, {
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
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
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
    const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
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
    const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
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

export const deleteAccount = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/delete-account`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
