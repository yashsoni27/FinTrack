import express from "express";
import { getDbBalance } from "../controllers/db";

const router = express.Router();

router.get("/db", (req, res) => {
  return res.json({
    data: "Hello from Plaid API",
  });
});

router.post("/balance/get", getDbBalance);
router.post("/transactions/get", getTransactions);

export default router;
