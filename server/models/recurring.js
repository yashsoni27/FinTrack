import mongoose from "mongoose";

const recurringSchema = mongoose.Schema({
  userId: String,
  // lastSynced: Date,
  stream: { type: String, enum: ["Inflow", "Outflow"]},
  streamId: {type: String, required: true},
  name: String,
  accountId: String,
  averageAmount: {
    amount: Number,
  },
  category: [String],
  description: String,
  firstDate: Date,
  frequency: String,
  isActive: Boolean,
  isUserModified: Boolean,
  lastUserModifiedDatetime: Date,
  lastAmount: {
    amount: Number,
  },
  lastDate: Date,
  merchantName: String,
  status: String,
  transactionIds: [String],  
});

export default mongoose.model("Recurring", recurringSchema);
