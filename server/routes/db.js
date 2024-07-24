import express from "express";

const router = express.Router();

router.get("/db", (req, res) => {
  return res.json({
    data: "Hello from Plaid API",
  });
});

router.post("/balance/get", getBalance);
router.post("/transactions/get", getTransactions);

export default router;
