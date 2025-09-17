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
  origin: "*"
}));

// Connect DB
connectDB();

app.post("/api/verify", async (req, res) => {
  try {
    // Forward the QR data to FastAPI
    const response = await fetch("http://localhost:8001/face/login/trace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body), // sessionId + nonce
    });
    const data = await response.json();

    // Return FastAPI response back to React
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: "error", reason: err.message });
  }
});
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

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
