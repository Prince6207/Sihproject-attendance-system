import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import qrRoutes from "./routes/qr.routes.js";
import cors from "cors";
import faceRoutes from "./routes/face.routes.js";
// import { createServer } from "http";
// import { Server } from "socket.io";
import studentRoutes from "./routes/student.routes.js";
// import teacherRoutes from "./routes/teacher.routes.js";


dotenv.config();

const app = express();
app.use(express.json());

// const httpServer = createServer(app);
// const io = new Server(httpServer, { cors: { origin: "*" } });
// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);

//   socket.emit("welcome", "Welcome to the attendance dashboard!");
// });

app.use(cors({
  origin: "*"
}));

// Connect DB
connectDB();

// app.post("/api/verify", async (req, res) => {
//   try {
//     // Forward the QR data to FastAPI
//     const response = await fetch("http://localhost:8001/face/login/trace", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(req.body), // sessionId + nonce
//     });
//     const data = await response.json();

//     // Return FastAPI response back to React
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ status: "error", reason: err.message });
//   }
// });
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Routes
app.use("/api/qr", qrRoutes);
// app.use("/face", faceRoutes);
app.use("/api/face", faceRoutes);
app.use("/api/student",studentRoutes);
// app.use("/api/teacher",teacherRoutes);

app.get("/dashboard", (req, res) => {
  res.send("✅ Attendance marked and dashboard accessed!");
});
// console.log("qr creation error4") ;

const PORT = process.env.PORT || 5000;
app.listen(PORT,() => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🔗 FastAPI should be running on: http://localhost:8001`);
});
