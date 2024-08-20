import mongoose from "mongoose";

const budgetSchema = mongoose.Schema({
  userId: String,
  month: String,
  year: String,
  budget: Number,
  spent: Number,
  categories: {
    Shopping: { spent: Number, budget: Number },
    Entertainment: { spent: Number, budget: Number },
    FoodAndDrink: { spent: Number, budget: Number },
    Transportation: { spent: Number, budget: Number },
    Home: { spent: Number, budget: Number },
    Other: { spent: Number, budget: Number },
  },
});

export default mongoose.model("Budget", budgetSchema);
