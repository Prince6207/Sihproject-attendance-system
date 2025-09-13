
import mongoose from "mongoose";

const qrSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  nonce: { type: String, required: true },
  exp: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model("Qr", qrSchema);
