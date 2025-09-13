import express from "express";
import { generateQR, verifyQR } from "../controllers/qr.controller.js";

const router = express.Router();

router.get("/generate", generateQR);   // GET /api/qr/generate?sessionId=123
router.post("/verify", verifyQR);      // POST /api/qr/verify

export default router;
