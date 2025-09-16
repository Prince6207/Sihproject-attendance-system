import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import qrRoutes from "./routes/qr.routes.js";
import cors from "cors";
import faceRoutes from "./routes/face.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173"  // allow only your frontend
}));

// Connect DB
connectDB();

// Routes
app.use("/api/qr", qrRoutes);
app.use("/face", faceRoutes);

app.get("/dashboard", (req, res) => {
  res.send("✅ Attendance marked and dashboard accessed!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
