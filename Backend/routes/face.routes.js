// import express from "express";
// import { authenticateFace } from "../controllers/face.controller.js";

// const router = express.Router();

// // Example: GET /face/authenticate?sessionId=123&nonce=abc
// router.get("/authenticate", authenticateFace);

// export default router;
import { Router } from "express";
import { loginWithFace, signupWithFace } from "../controllers/face.controller.js";

const router = Router();

router.post("/login", (req, res) => {
//   const { username } = req.body;
//   if (!username) {
//     return res.status(400).json({ status: "error", message: "Username required" });
//   }
    const username = "trace"; // For testing purposes

  const py = spawn("python", ["main.py", "login", username], {
    cwd: process.cwd(), // make sure it's running from project root
  });

  let output = "";
  py.stdout.on("data", (data) => {
    output += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });

  py.on("close", (code) => {
    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Invalid response from Python",
        raw: output,
      });
    }
  });
});

router.post("/face/login/:username", loginWithFace);
router.post("/face/signup/:username", signupWithFace);

export default router;
