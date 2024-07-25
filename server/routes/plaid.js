import express from "express";
import {
    auth,
    createLinkToken,
    exchangePublicToken,
    getBalance,
    getTransactions,
    institutionLogo,
    syncTransactions,
} from "../controllers/plaid.js";

const router = express.Router();

router.get("/api", (req, res) => {
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

router.post("/institution/logo", institutionLogo);

export default router;
