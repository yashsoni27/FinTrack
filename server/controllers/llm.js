import dotenv from "dotenv";
dotenv.config();
import Transaction from "../models/transaction.js";
import Session from "../models/session.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    candidateCount: 1,
    maxOutputTokens: 4098,
    temperature: 1.0,
  },
});

export const initializeSession = async (request, response) => {
  try {
    const { userId } = request.body;
    const existingSession = await Session.findOne({ userId: userId }).sort({
      date: -1,
    });

    if (existingSession) {
      const sessionId = existingSession.sessionId;
      console.log("existing session hit: ", sessionId);
      // console.log(existingSession);
      return response.json(existingSession);
    } else {
      const sessionId = Date.now().toString();
      const newSession = new Session({
        userId: userId,
        sessionId: sessionId,
        contextSequence: [],
      });

      await newSession.save();
      console.log("start new session hit: ", sessionId);

      return response.json(newSession);
    }
  } catch (error) {
    console.error("Error initilizing session: ", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
};

export const startNewSession = async (request, response) => {
  try {
    const { userId } = request.body;

    const sessionId = Date.now().toString();
    const newSession = new Session({
      userId: userId,
      sessionId: sessionId,
    });

    await newSession.save();
    console.log("start new session hit: ", sessionId);

    return response.json(newSession);
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

    let formattedPrompt = `Classify the following prompt as either "general" or "specific" only:\n\n${prompt}`;

    // Step 1: Classify the question
    const classificationResult = await model.generateContent(formattedPrompt);

    if (
      classificationResult &&
      classificationResult.response &&
      classificationResult.response.candidates &&
      classificationResult.response.candidates.length > 0
    ) {
      const classification =
        classificationResult.response.candidates[0].content.parts[0].text
          .trim()
          .toLowerCase();
      console.log("Classification:", classification);

      if (classification === "specific") {
        // Step 2: Generate a MongoDB query for specific questions
        const queryPrompt = `Generate a MongoDB query code only without any explaination which is to be queried using mongoose node package 
        to fetch financial data based on the following prompt: ${prompt}\n\n
        This is the transaction schema:\n
        const transactionSchema = mongoose.Schema({
          userId: String,
          transactionId: {
            type: String,
            required: true,
            unique: true,
          },
          accountId: String,
          amount: Number,
          date: Date,
          name: String,
          merchantName: String,
          logoUrl: String,
          personalFinanceCategoryIconUrl: String,
          category: [String],
          personalFinanceCategory: {
            // primary: { type: String, required: true },
            primary: String,
            detailed: String,
            confidenceLevel: String,
          },
          description: String,
          excludeFromAnalytics: { type: Boolean, default: false },
        });\n\n
        I want you to specifically provide the query by replacing the word 'query' in the below excerpt. DO NOT WRITE the await Transactiona and user part again: 
        "const transactions = await Transaction.find({
          userId: userId,
          query // Only provide this logic only!!!
        });"
        Provide the query snippet as a valid JavaScript object withoubt any dounble quotes for use and without any explanations.!
        `;

        const queryResult = await model.generateContent(queryPrompt);

        if (
          queryResult &&
          queryResult.response &&
          queryResult.response.candidates &&
          queryResult.response.candidates.length > 0
        ) {
          const queryText =
            queryResult.response.candidates[0].content.parts[0].text;
          console.log("Generated Query:", queryText);

          const cleanedString = queryText.replace(/```javascript\n|```/g, "");

          console.log("Cleaned Query: ", cleanedString);
          // const queryObject = JSON.parse(cleanedString);

          let queryObject;
          try {
            // Use Function constructor to safely evaluate the string as a JavaScript object
            queryObject = new Function(`return ${cleanedString}`)();
          } catch (error) {
            console.error("Error parsing query:", error);
            queryObject = {};
          }

          // Now use the parsed object in your query
          const fullQuery = {
            userId: sessionData.userId,
            ...queryObject,
          };

          console.log("Full query:", JSON.stringify(fullQuery, null, 2));

          const transactions = await Transaction.find(fullQuery);
          console.log("transactions: ", transactions);

          // Format the financial data to be included in the prompt
          // const transactionDetails = transactions
          //   .map((transaction) => {
          //     return `Date: ${
          //       transaction.date.toISOString().split("T")[0]
          //     }, Amount: ${transaction.amount}, Category: ${
          //       transaction.category
          //     }, Description: ${transaction.description || "N/A"}`;
          //   })
          //   .join("\n");

          const insightPrompt = `You are a helpful and financial AI assistant. Here is the user's recent transaction data:\n${transactions}\n\nGenerate insights based on this data and the original user prompt:\n${prompt}. Also keep in mind we are in UK so the currency symbol to be used is £`;

          // Call the LLM again with the transaction data to generate insights
          const insightResult = await model.generateContent(insightPrompt);

          if (
            insightResult &&
            insightResult.response &&
            insightResult.response.candidates &&
            insightResult.response.candidates.length > 0
          ) {
            const aiResponse =
              insightResult.response.candidates[0].content.parts[0].text;

            // Update the session context sequence and save it back to the database
            sessionData.contextSequence.push(prompt + "@#", aiResponse + "@#");
            await sessionData.save();

            return response.json({ response: aiResponse });
          } else {
            return response
              .status(500)
              .json({ error: "Failed to generate insights" });
          }
        } else {
          return response
            .status(500)
            .json({ error: "Failed to generate query" });
        }
      } else {
        // Step 3: Handle general questions directly
        formattedPrompt = `You are a helpful and financial AI assistant. ${prompt}`;

        if (sessionData.contextSequence.length > 0) {
          let context = sessionData.contextSequence.join("@#");
          formattedPrompt = `Context:\n${context}\n\nUser Prompt:\n${prompt}`;
        }

        console.log("Prompt\n\n" + formattedPrompt);

        // Calling the Gemini API to generate a response for general questions
        const generalResult = await model.generateContent(formattedPrompt);

        if (
          generalResult &&
          generalResult.response &&
          generalResult.response.candidates &&
          generalResult.response.candidates.length > 0
        ) {
          const aiResponse =
            generalResult.response.candidates[0].content.parts[0].text;

          // Update the session context sequence and save it back to the database
          sessionData.contextSequence.push(prompt + "@#", aiResponse + "@#");
          await sessionData.save();

          return response.json({ response: aiResponse });
        } else {
          return response
            .status(500)
            .json({ error: "Failed to generate response" });
        }
      }
    } else {
      return response
        .status(500)
        .json({ error: "Failed to classify question" });
    }
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};
