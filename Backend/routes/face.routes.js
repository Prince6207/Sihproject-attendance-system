import express from "express";
import { authenticateFace } from "../controllers/face.controller.js";

const router = express.Router();

// Example: GET /face/authenticate?sessionId=123&nonce=abc
router.get("/authenticate", authenticateFace);

export default router;