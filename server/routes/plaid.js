import express from "express";
import {
    auth,
    createLinkToken,
    exchangePublicToken,
    getBalance,
    getTransactions,
    syncTransactions,
} from "../controllers/plaid.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "Hello from Plaid API",
  });
});

router.post("/create_link_token", createLinkToken);
router.post("/exchange_public_token", exchangePublicToken);

router.post("/auth", auth);
router.post("/balance/get", getBalance);
router.post("/transactions/sync", syncTransactions);
router.post("/transactions/get", getTransactions);

export default router;
