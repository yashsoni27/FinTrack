import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
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
  category: [String],
  description: String,
  institutionId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution"
  }]
});

export default mongoose.model("Transaction", transactionSchema);
