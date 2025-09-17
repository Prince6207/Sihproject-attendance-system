import express from "express";
import { generateQR, verifyQR } from "../controllers/qrcode.controller.js";

const router = express.Router();
console.log("qr creation error2") ;
router.get("/generate", generateQR);   // GET /api/qr/generate?sessionId=123
console.log("qr creation error3") ;
router.post("/verify", verifyQR);      // POST /api/qr/verify

export default router;
