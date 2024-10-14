import express from "express";
import { generateResponse, startNewSession } from "../controllers/llm.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "Hello from LLM",
  });
});

router.post("/generateResponse", generateResponse);
router.post("/start-session", startNewSession);

export default router;
