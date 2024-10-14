import { spawn } from "child_process";
import dotenv from "dotenv";
dotenv.config();
import { getLlama, LlamaChatSession } from "node-llama-cpp";

const llama = await getLlama();
const model = await llama.loadModel({
  modelPath: "C:/Users/ybond/Downloads/llama-2-7b.Q5_K_M.gguf",
});
const context = await model.createContext();
const session = new LlamaChatSession({
  contextSequence: context.getSequence(),
});

// Store sessions in memory (you can replace this with a persistent store)
const sessions = {};

const createNewSession = async () => {
  const context = await model.createContext();
  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });
  return session;
};

export const startNewSession = async (request, response) => {
  try {
    const sessionId = Date.now().toString(); // Simple session ID generation
    const session = await createNewSession();
    sessions[sessionId] = session;
    return response.json({ sessionId });
  } catch (error) {
    console.error("Error starting new session:", error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};


export const generateResponse = async (request, response) => {
  try {
    const { prompt } = request.body;
    console.log("User: " + prompt);

    const res = await session.prompt(prompt);
    console.log("AI: " + res);

    return response.json({ output: res });
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};