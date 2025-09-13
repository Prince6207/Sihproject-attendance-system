import mongoose from "mongoose";

const attendanceSummarySchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    finalStatus: { type: String, enum: ["present", "absent", "excused"], required: true },
    totalDuration: { type: Number }, // in minutes
    engagementScore: { type: Number, min: 0, max: 1 }
});

const AttendanceSummary = mongoose.model("AttendanceSummary", attendanceSummarySchema);
export default AttendanceSummary;
