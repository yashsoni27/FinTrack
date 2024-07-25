import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
  userId: String,
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  accountId: String,
  amount: Number,
  date: Date,
  name: String,
  merchantName: String,
  logo_url: String,
  category: [String],
  description: String,  
});

export default mongoose.model("Transaction", transactionSchema);
