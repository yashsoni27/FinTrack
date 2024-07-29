import express from "express";
import { scanReceipt } from "../controllers/ocr.js";

const router = express.Router();

router.get("/ocr", (req, res) => {
  return res.json({
    data: "Hello from OCR API",
  });
});

router.post("/scan-receipt", scanReceipt);

export default router;