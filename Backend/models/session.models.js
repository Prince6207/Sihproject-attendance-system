import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    subject: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    mode: { type: String, enum: ["offline", "online", "hybrid"], required: true },
    qrNonce: { type: String },
    status: { type: String, enum: ["scheduled", "ongoing", "completed"], default: "scheduled" }
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
