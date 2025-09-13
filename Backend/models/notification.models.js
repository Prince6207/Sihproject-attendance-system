import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    message: { type: String, required: true },
    type: { type: String, enum: ["alert", "reminder", "info"], default: "info" },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
