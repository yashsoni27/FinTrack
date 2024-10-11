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

export const generateResponse = async (request, response) => {
  try {
    // Ensure the correct method is used to generate the response
    const { prompt } = request.body;
    console.log("User: " + prompt);

    const res = await session.prompt(prompt);
    console.log("AI: " + res);

    // const q2 = "Summarize what you said";
    // console.log("User: " + q2);

    // const a2 = await session.prompt(q2);
    // console.log("AI: " + a2);
    return response.json({ output: res });
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};

export const generate = async (request, response) => {
  const { prompt } = request.body;
  console.log("Received prompt: ", prompt);

  // const generate = spawn('python', ['./generate.py', prompt]);
  const generate = spawn("python", ["./generateLangchain.py", prompt]);

  let output = "";
  let errorOutput = "";

  generate.stdout.on("data", (data) => {
    output += data.toString();
  });

  generate.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  generate.on("close", (code) => {
    if (code === 0) {
      console.log("Generated output: ", output);
      response.send({ output: output.trim() });
    } else {
      console.error(`Error: ${errorOutput}`);
      response.status(500).send(`Error generating text: ${errorOutput}`);
    }
  });
};
