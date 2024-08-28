import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
  userId: String,
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  accountId: String,
  amount: Number,
  date: Date,
  name: String,
  merchantName: String,
  logoUrl: String,
  personalFinanceCategoryIconUrl: String,
  category: [String],
  personalFinanceCategory: {
    // primary: { type: String, required: true },
    primary: String,
    detailed: String,
    confidenceLevel: String,
  },
  description: String,
  excludeFromAnalytics: { type: Boolean, default: false },
});

export default mongoose.model("Transaction", transactionSchema);
