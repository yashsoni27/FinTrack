import express from "express";
import {
  getAccountsDb,
  getBalanceDb,
  getBudget,
  getChartData,
  getRecurringDb,
  getTransactionsDb,
  saveTransactionDb,
  setBudget,
  updateTransactionDb,
} from "../controllers/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "Hello from DB",
  });
});

router.post("/balance/get", getBalanceDb);
router.post("/accounts/get", getAccountsDb);
router.post("/transactions/get", getTransactionsDb);
router.post("/transactions/recurring/get", getRecurringDb);

router.post("/transactions/save", saveTransactionDb);
router.post("/chartData/get", getChartData);
router.post("/budget/get", getBudget);
router.post("/budget/set", setBudget);
router.post("/transactions/update", updateTransactionDb);
export default router;
