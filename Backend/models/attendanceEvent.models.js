import mongoose from "mongoose";

const attendanceEventSchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    timestamp: { type: Date, default: Date.now },
    method: { type: String, enum: ["qr", "face", "hybrid"], required: true },
    confidence: { type: Number, min: 0, max: 1 },
    livenessScore: { type: Number, min: 0, max: 1 },
    status: { type: String, enum: ["present", "absent", "suspicious"], default: "present" }
});

const AttendanceEvent = mongoose.model("AttendanceEvent", attendanceEventSchema);
export default AttendanceEvent;
