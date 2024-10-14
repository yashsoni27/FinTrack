import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const getAIResponse = async (prompt) => {
  try {
    const response = await axios.post(`${BASE_URL}/llm/generateResponse`, {
      prompt,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating output fro LLM: ", error);
    throw error;
  }
};

export const startAISession = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/llm/start-session`);
    return response.data;
  } catch (error) {
    console.error("Error starting AI session: ", error);
    throw error;
  }
};
