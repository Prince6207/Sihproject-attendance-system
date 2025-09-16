// import QRCode from "qrcode";
// import crypto from "crypto";
// import Qr from "../models/qr.models.js";

// export const generateQR = async (req, res) => {
//   try {
//     const { sessionId } = req.query;
//     if (!sessionId) return res.status(400).json({ error: "sessionId required" });

//     const nonce = crypto.randomBytes(8).toString("hex");
//     const exp = new Date(Date.now() + 60 * 1000); 

//     await Qr.create({ sessionId, nonce, exp });
//     const qrData = { sessionId, nonce, exp };
//     const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

//     res.json({ qrImage, qrData });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const verifyQR = async (req, res) => {
//   try {
//     const { sessionId, nonce } = req.body;
//     const record = await Qr.findOne({ sessionId, nonce });
//     if (!record) return res.status(400).json({ status: "failure", reason: "Invalid QR" });

//     if (record.exp < new Date()) {
//       return res.status(400).json({ status: "failure", reason: "QR expired" });
//     }

//     res.json({ status: "success" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import QRCode from "qrcode";
import crypto from "crypto";
import Qr from "../models/qr.models.js";

// --- Generate QR ---
export const generateQR = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }

    // generate unique nonce
    const nonce = crypto.randomBytes(8).toString("hex");
    const exp = new Date(Date.now() + 60 * 1000); // expires in 1 min

    // store in DB
    await Qr.create({ sessionId, nonce, exp });

    // encode QR data (sessionId + nonce)
    const qrData = { sessionId, nonce };
    const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

    return res.json({ qrImage, qrData });
  } catch (err) {
    console.error("❌ QR Generation Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// --- Verify QR ---
export const verifyQR = async (req, res) => {
  try {
    const { sessionId, nonce } = req.body;

    if (!sessionId || !nonce) {
      return res.status(400).json({ status: "failure", reason: "Missing sessionId or nonce" });
    }

    const record = await Qr.findOne({ sessionId, nonce });
    if (!record) {
      return res.status(400).json({ status: "failure", reason: "Invalid QR" });
    }

    if (record.exp < new Date()) {
      return res.status(400).json({ status: "failure", reason: "QR expired" });
    }

    // ✅ QR valid → now redirect to Face Authentication
    // res.json({ status: "success" });
    return res.redirect(`/face/authenticate?sessionId=${sessionId}&nonce=${nonce}`);
  } catch (err) {
    console.error("❌ QR Verification Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
