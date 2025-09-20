import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import qrRoutes from "./routes/qr.routes.js";
import cors from "cors";
import faceRoutes from "./routes/face.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import studentRoutes from "./routes/student.routes.js";


dotenv.config();

const app = express();

// Parse JSON bodies first with error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('JSON Parse Error:', e.message);
      console.error('Raw body:', buf.toString());
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format',
        error: e.message
      });
      return;
    }
  }
}));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle raw text/plain content
app.use(express.text({ type: 'text/plain' }));

// Debug middleware to log request details (after parsing)
app.use((req, res, next) => {
  console.log(`\n=== Request Debug ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Content-Type: ${req.get('Content-Type')}`);
  console.log(`Body:`, req.body);
  console.log(`========================\n`);
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.emit("welcome", "Welcome to the attendance dashboard!");
});

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
app.use("/api/student",studentRoutes)

app.get("/dashboard", (req, res) => {
  res.send("✅ Attendance marked and dashboard accessed!");
});
// console.log("qr creation error4") ;

const PORT = process.env.PORT || 5000;
app.listen(() => {
  console.log(`Server running on port ${PORT}`);
});
