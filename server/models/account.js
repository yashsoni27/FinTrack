import mongoose from "mongoose";

const accountSchema = mongoose.Schema({
  account_id: {
    type: String,
    required: true,
  },
  balances: {
    available: Number,
    current: Number,
    iso_currency_code: String,
    limit: Number,
    unofficial_currency_code: String,
  },
  mask: String,
  name: {
    type: String,
    required: true,
  },
  type: String,
  subType: String,
  persistent_account_id: String,
  userId: String,
});

export default mongoose.model("Account", accountSchema);