import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import plaidRoutes from "./routes/plaid.js";
import dbRoutes from "./routes/db.js";
import ocrRoutes from "./routes/ocr.js";

const app = express();

mongoose
  .connect(process.env.MONGO_DB_CONN_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(8000, () => {
      console.log("server has started on port 8000");
    });
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

// routes
app.use("/api", authRoutes);
app.use("/api", plaidRoutes);
app.use("/db", dbRoutes);
app.use("/ocr", ocrRoutes);

