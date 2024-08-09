import express from "express";
import { getBalanceDb, getRecurringDb, getTransactionsDb, saveTransactionDb } from "../controllers/db.js";

const router = express.Router();

router.get("/db", (req, res) => {
  return res.json({
    data: "Hello from Plaid API",
  });
});

router.post("/balance/get", getBalanceDb);
router.post("/transactions/get", getTransactionsDb);
router.post("/transactions/recurring/get", getRecurringDb);

router.post("/transactions/save", saveTransactionDb);

export default router;
