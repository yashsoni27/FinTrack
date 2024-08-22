import express from "express";
import { scanReceipt } from "../controllers/ocr.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "Hello from OCR API",
  });
});

router.post("/scan-receipt", scanReceipt);

export default router;
