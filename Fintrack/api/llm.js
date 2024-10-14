import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const generateResponse = async (prompt, sessionId) => {
  try {
    const response = await axios.post(`${BASE_URL}/llm/generateResponse`, {
      prompt,
      sessionId,
    });
    return response.data.response;
  } catch (error) {
    console.error("Error generating output from LLM: ", error);
    throw error;
  }
};

export const startNewSession = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/llm/start-session`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error starting AI session: ", error);
    throw error;
  }
};
