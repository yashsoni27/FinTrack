import express from "express";
import {
  generateResponse,
  startNewSession,
  initializeSession,
} from "../controllers/llm.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "Hello from LLM",
  });
});

router.post("/generateResponse", generateResponse);
router.post("/initializeSession", initializeSession);
router.post("/newSession", startNewSession);

export default router;
