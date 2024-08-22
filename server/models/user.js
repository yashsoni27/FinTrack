import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const InstitutionSchema = mongoose.Schema({
  institutionId: {
    type: String,
    required: true,    
  },
  name: {
    type: String,
    required: true,
  },
  accessToken: String,  
  plaidCursor: String, 
});

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
  institutions: [InstitutionSchema],
  resetCode: String,
  onBoarded: {
    type: Boolean,
    default: false,
  },
  fingerprintEnabled: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Users", userSchema);
