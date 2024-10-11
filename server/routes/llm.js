import express from "express";
import { generate, generateResponse } from "../controllers/llm.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "Hello from LLM",
  });
});

router.post("/generate", generate);
router.post("/generateResponse", generateResponse);

export default router;
