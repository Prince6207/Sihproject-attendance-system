// import axios from "axios";

// // Replace with your FastAPI base URL (e.g. http://localhost:5000)
// const FACE_API_URL = "http://127.0.0.1:8001";

// export const authenticateFace = async (req, res) => {
//   try {
//     const { sessionId, nonce } = req.query;

//     if (!sessionId || !nonce) {
//       return res.status(400).json({ error: "sessionId and nonce are required" });
//     }

//     // Call FastAPI endpoint
//     const response = await axios.post(`${FACE_API_URL}/authenticate`, {
//       sessionId,
//       nonce
//     });

//     if (response.data.status === "success") {
//       return res.json({ status: "success", message: "Face verified successfully" });
//     } else {
//       return res.status(401).json({ status: "failure", message: "Face verification failed" });
//     }
//   } catch (err) {
//     console.error("❌ Face Auth Error:", err.message);
//     return res.status(500).json({ error: err.message });
//   }
// };

import axios from "axios";

const FACE_API_URL = "http://127.0.0.1:8001";

export const authenticateFace = async (req, res) => {
  try {
    const { sessionId, nonce } = req.query;

    if (!sessionId || !nonce) {
      return res.status(400).json({ error: "sessionId and nonce are required" });
    }

    // Call FastAPI endpoint
    const response = await axios.post(`${FACE_API_URL}/authenticate`, {
      sessionId,
      nonce
    });

    if (response.data.status === "success") {
      return res.json({ status: "success", message: "Face verified successfully" });
    } else {
      return res.status(401).json({ status: "failure", message: "Face verification failed" });
    }
  } catch (err) {
    console.error("❌ Face Auth Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
