import express from "express";
import { getBalanceDb, getTransactionsDb } from "../controllers/db.js";

const router = express.Router();

router.get("/db", (req, res) => {
  return res.json({
    data: "Hello from Plaid API",
  });
});

router.post("/balance/get", getBalanceDb);
router.post("/transactions/get", getTransactionsDb);

export default router;
