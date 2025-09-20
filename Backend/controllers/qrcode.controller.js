
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
    const qrData = { sessionId, nonce ,exp};
    const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));
    console.log("qr creation error") ;
    return res.json({ qrImage, qrData });
  } catch (err) {
    console.error("QR Generation Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// --- Verify QR ---
// export const verifyQR = async (req, res) => {
//   try {
//     const { sessionId, nonce } = req.body;

//     if (!sessionId || !nonce) {
//       return res.status(400).json({ status: "failure", reason: "Missing sessionId or nonce" });
//     }

//     const record = await Qr.findOne({ sessionId, nonce });
//     if (!record) {
//       return res.status(400).json({ status: "failure", reason: "Invalid QR" });
//     }

//     if (record.exp < new Date()) {
//       return res.status(400).json({ status: "failure", reason: "QR expired" });
//     }

//     // ✅ QR valid → now redirect to Face Authentication
//     // res.json({ status: "success" });
//     console.log("✅ QR verified, redirecting to Face Auth...");
//     // For demo, hardcoding username
//     // const username = "trace"; 
//     // return res.redirect(`/face/login/${username}?sessionId=${sessionId}&nonce=${nonce}`);
//     const username = "trace"; 
//     return res.json({
//       status: "success",
//       message: "QR verified",
//       next: `/face/login/${username}`
//     });
//   } catch (err) {
//     console.error("❌ QR Verification Error:", err.message);
//     return res.status(500).json({ error: err.message });
//   }
// };
export const verifyQR = async (req, res) => {
  try {
    const { sessionId, nonce } = req.body;
    const record = await Qr.findOne({ sessionId, nonce ,exp});
    if (!record) return res.status(400).json({ status: "failure", reason: "Invalid QR" });

    if (record.exp < new Date()) {
      return res.status(400).json({ status: "failure", reason: "QR expired" });
    }

    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
