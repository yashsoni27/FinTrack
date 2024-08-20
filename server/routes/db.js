import express from "express";
import {
  getBalanceDb,
  getBudget,
  getChartData,
  getRecurringDb,
  getTransactionsDb,
  saveTransactionDb,
  setBudget,
} from "../controllers/db.js";

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
router.post("/chartData/get", getChartData);
router.post("/budget/get", getBudget);
router.post("/budget/set", setBudget);

export default router;
