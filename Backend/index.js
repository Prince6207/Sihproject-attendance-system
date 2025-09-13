import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import qrRoutes from "./routes/qr.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/qr", qrRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
