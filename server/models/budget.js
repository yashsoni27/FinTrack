import mongoose from "mongoose";

const budgetSchema = mongoose.Schema({
  userId: String,
  month: String,
  year: String,
  amount: Number, 
  categorization: Object,
});

export default mongoose.model("Budget", budgetSchema);
