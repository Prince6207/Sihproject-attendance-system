// import express from "express";
// import { authenticateFace } from "../controllers/face.controller.js";

// const router = express.Router();

// // Example: GET /face/authenticate?sessionId=123&nonce=abc
// router.get("/authenticate", authenticateFace);

// export default router;
import { Router } from "express";
import { spawn } from "child_process";
import { loginWithFace, signupWithFace } from "../controllers/face.controller.js";

const router = Router();

router.post("/login", (req, res) => {
  const username = "trace"; // For testing purposes

  console.log("Starting face authentication for user:", username);
  
  // Try to spawn Python process
  const py = spawn("python", ["../FaceAuth/face_auth_cli.py", "login", username], {
    cwd: process.cwd(),
  });

  let output = "";
  let errorOutput = "";

  py.stdout.on("data", (data) => {
    output += data.toString();
    console.log("Python stdout:", data.toString());
  });

  py.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("Python stderr:", data.toString());
  });

  py.on("close", (code) => {
    console.log("Python process closed with code:", code);
    console.log("Output:", output);
    console.log("Error output:", errorOutput);
    
    if (code !== 0) {
      return res.status(500).json({
        status: "error",
        message: "Face authentication failed",
        error: errorOutput || "Python process failed",
        code: code
      });
    }

    try {
      if (output.trim()) {
        const result = JSON.parse(output);
        res.json(result);
      } else {
        res.status(500).json({
          status: "error",
          message: "No output from Python script",
          error: errorOutput
        });
      }
    } catch (err) {
      console.error("JSON parse error:", err);
      res.status(500).json({
        status: "error",
        message: "Invalid response from Python",
        raw: output,
        error: errorOutput,
        parseError: err.message
      });
    }
  });

  py.on("error", (err) => {
    console.error("Python spawn error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to start Python process",
      error: err.message
    });
  });
});

// Fallback route for testing without Python
router.post("/login-test", (req, res) => {
  console.log("Using fallback face authentication (no Python required)");
  res.json({
    status: "success",
    message: "Face authentication successful (test mode)",
    data: {
      success: true,
      user: "trace",
      timestamp: new Date().toISOString()
    }
  });
});

router.post("/login/:username", loginWithFace);
router.post("/signup/:username", signupWithFace);

export default router;
