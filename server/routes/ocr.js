import express from "express";
import { scanInvoice, scanReceipt } from "../controllers/ocr.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/ocr", (req, res) => {
  return res.json({
    data: "Hello from OCR API",
  });
});

router.post("/scan-receipt", scanReceipt);
router.post("/scan-invoice", upload.single("file"), scanInvoice);

export default router;
