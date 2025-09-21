import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import * as QRCode from "qrcode";
// import QRCode from "qrcode";
import "./Attend.css";

function Attend() {
  const [qrData, setQrData] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [scannedResult, setScannedResult] = useState("");
  useEffect(() => {
    if (!document.getElementById("reader")) return;

    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(
      async (decodedText) => {
        setScannedResult(decodedText);
        try {
          const parsed = JSON.parse(decodedText);
          const res = await fetch(`http://localhost:5000/api/qr/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: parsed.sessionId,
              nonce: parsed.nonce,
            }),
          });
          const verifyData = await res.json();
if (verifyData.status === "success") {
  // window.location.href = `http://localhost:8001/face/login/trace}`;'
  // window.location.href = `http://localhost:8000/face/login/trace`;
  const username = "trace" ;
  const faceRes = await fetch(`http://localhost:5000/api/face/login/${username}`, {
    method: "POST"
  });

  const faceData = await faceRes.json();
  console.log("Decoded QR:", decodedText);
console.log("Verify response:", verifyData);
console.log("Face response:", faceData);

  if (faceData.status === "success") {
    setScannedResult("Face Auth Successful 🎉");
  } else {
    setScannedResult("Face Auth Failed ❌ " + faceData.message);
  }
} else {
  alert("QR verification failed: " + verifyData.reason);
}
        } catch (err) {
          console.error("Verify error:", err);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(console.error);
    };

    
  }, []);
  return (
    <div className="App">
      <h1>QR Code Attendance Test</h1>

      
      <div>
        <h2 >Student View (QR Scanner)</h2>
        <div id="reader" style={{width: "800px",height :"500px"}}></div>
        <p>Scanned Data: {scannedResult}</p>
      </div>

       {/* <div>
      <h1>QR + Face 2 Auth</h1>
      <div id="read" style={{ width: "300px" }}></div>
      <p>{scannedResult}</p>
    </div> */}
    </div>
  );
}

export default Attend;
