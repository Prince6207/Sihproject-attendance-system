import express from "express";
import mongoose from "mongoose";
import qrRoutes from "./routes/qr.routes.js";

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/attendance", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api/qr", qrRoutes);

app.listen(5000, () => console.log(" Server running on port 5000"));