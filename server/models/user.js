import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 32,
  },
  mobile: String,  // Not used uptil now
  institutions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution"
  }],
  resetCode: String,      
  accessToken: String,   
  plaidCursor: String, 
});

export default mongoose.model("Users", userSchema);
