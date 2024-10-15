import { spawn } from "child_process";
import dotenv from "dotenv";
dotenv.config();
import { getLlama, LlamaChatSession } from "node-llama-cpp";
// import { GenerativeLanguageClient } from "@google-ai/generativelanguage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Session from "../models/session.js";
import session from "../models/session.js";

// const apiKey = process.env.GEMINI_API; // Get your API key from environment variables
// const client = new GenerativeLanguageClient({
//   apiKey: apiKey,
// });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const llama = await getLlama();
// const model = await llama.loadModel({
//   modelPath: "C:/Users/ybond/Downloads/llama-2-7b.Q5_K_M.gguf",
// });

// const createNewSession = async () => {
//   const context = await model.createContext();
//   const session = new LlamaChatSession({
//     contextSequence: context.getSequence(),
//   });
//   return session;
// };

export const startNewSession = async (request, response) => {
  try {
    const { userId } = request.body;
    const sessionId = Date.now().toString(); // Simple session ID generation
    // const session = await createNewSession();
    // sessions[sessionId] = session;
    const newSession = new Session({
      userId: userId,
      sessionId: sessionId,
      // contextSequence: session.contextSequence,
    });

    await newSession.save();
    console.log("start new session hit: ", sessionId);

    return response.json({ sessionId });
  } catch (error) {
    console.error("Error starting new session:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
};

export const generateResponse = async (request, response) => {
  try {
    const { prompt, sessionId } = request.body;
    console.log("sessionID: ", sessionId);

    const sessionData = await Session.findOne({
      sessionId: sessionId.toString(),
    });
    if (!sessionData) {
      return response.status(404).json({ error: "Session not found" });
    }

    let formattedPrompt = `You are a helpful and financial AI assistant. ${prompt}`;

    if (sessionData.contextSequence.length > 0) {
      let context = sessionData.contextSequence.join("@#");
      formattedPrompt = `Context:\n${context}\n\nUser Prompt:\n${prompt}`;
    }

    console.log("Prompt\n\n" + formattedPrompt);

    // Calling the Gemini API
    const result = await model.generateContent(formattedPrompt);

    if (result && result.response && result.response.candidates && result.response.candidates.length > 0) {
      const aiResponse = result.response.candidates[0].content.parts[0].text;

      // Update the session context sequence and save it back to the database
      sessionData.contextSequence.push(prompt + "@#", aiResponse + "@#");
      await sessionData.save();

      return response.json(result);
    } else {
      return response.status(500).json({ error: "Failed to generate response" });
    }
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};
