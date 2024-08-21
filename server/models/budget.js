import mongoose from "mongoose";

const budgetSchema = mongoose.Schema({
  userId: String,
  month: String,
  year: String,
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  category: {
    shopping: { spent: Number, budget: Number },
    entertainment: { spent: Number, budget: Number },
    foodAndDrink: { spent: Number, budget: Number },
    transportation: { spent: Number, budget: Number },
    home: { spent: Number, budget: Number },
    other: { spent: Number, budget: Number },
  },
});

export default mongoose.model("Budget", budgetSchema);
