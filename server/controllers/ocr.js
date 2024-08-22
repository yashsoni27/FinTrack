import mindee from "mindee";
import Tesseract from "tesseract.js";
// import Tesseract from "node-tesseract-ocr";
import { Buffer } from "buffer";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../')


import dotenv from "dotenv";
dotenv.config();

const mindeeClient = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY });

export const scanReceipt = async (request, response) => {
  try {
    const { image } = request.body;

    if (!image) {
      return response.status(400).json({ error: "No image data provided" });
    }

    const inputSource = mindeeClient.docFromBase64(image, "document.jpg");

    const apiResponse = mindeeClient.parse(
      mindee.product.ReceiptV5,
      inputSource
    );

    let processedData = {
      amount: 0,
      merchantName: "",
      date: "",
      category: "",
    };

    apiResponse.then((resp) => {
      const data = resp.document.inference.prediction;
      processedData.amount = data.totalAmount.value;
      processedData.merchantName = data.supplierName.value;
      processedData.date = data.date.dateObject;
      processedData.category = data.category.value;

      response.json({ receiptData: processedData });
    });
  } catch (e) {
    console.log("error: ", e);
    response.status(500).send(e);
  }
};
