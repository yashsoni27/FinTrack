// models/Session.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  contextSequence: { type: Array, required: true },
  dateTime: {type: Date, default: Date.now()}
});
export default mongoose.model('Session', sessionSchema);


