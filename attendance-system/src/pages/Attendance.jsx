import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import * as QRCode from "qrcode";
// import QRCode from "qrcode";
import "./Attend.css";

function Attend() {
  const [qrData, setQrData] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [scannedResult, setScannedResult] = useState("");

  // Fetch QR from backend
  const fetchQR = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/qr/generate?sessionId=123`);
      const data = await res.json();
      const qrString = JSON.stringify(data.qrData);
      setQrData(qrString);

      // Generate QR image
      const qrUrl = await QRCode.toDataURL(qrString);
      setQrImageUrl(qrUrl);
    } catch (err) {
      console.error("QR Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 60 * 1000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  // Setup scanner
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
  const faceRes = await fetch(`http://localhost:8001/api/face/login/${username}`, {
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
  // useEffect(() => {
  //   if (!document.getElementById("reader")) return;

  //   const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

  //   scanner.render(
  //     async (decodedText) => {
  //       let parsed;
  //       try {
  //         parsed = JSON.parse(decodedText);
  //       } catch {
  //         alert("Invalid QR format");
  //         return;
  //       }

  //       try {
  //         const res = await fetch("http://localhost:8000/api/qr/verify", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             sessionId: parsed.sessionId,
  //             nonce: parsed.nonce,
  //           }),
  //         });
  //         const verifyData = await res.json();

  //         if (verifyData.status === "success") {
  //           setScannedResult("QR verified ✅ Starting Face 2 auth...");

  //           // Call Face 2 authentication endpoint in backend
  //           const faceRes = await fetch("http://localhost:8000/face/login", {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ sessionId: parsed.sessionId }),
  //           });
  //           const faceData = await faceRes.json();

  //           if (faceData.status === "success") {
  //             setScannedResult("Face 2 Auth Successful 🎉");
  //           } else {
  //             setScannedResult("Face 2 Auth Failed ❌");
  //           }

  //         } else {
  //           alert("QR verification failed: " + verifyData.reason);
  //         }
  //       } catch (err) {
  //         console.error(err);
  //         alert("Verification failed due to error");
  //       }
  //     },
  //     () => {}
  //   );

  //   return () => scanner.clear().catch(console.error);
  // }, []);

  return (
    <div className="App">
      <h1>QR Code Attendance Test</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2>Teacher View (QR Generator)</h2>
        {qrImageUrl ? (
          <img src={qrImageUrl} alt="QR Code" width="200" />
        ) : (
          <p>Loading QR...</p>
        )}
      </div>

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

// import { useState ,useEffect} from 'react'
// import { useDispatch } from 'react-redux'
// import { Outlet } from 'react-router-dom'
// import {Header}  from './components/Header/Header.jsx'
// import {Footer}  from './components/Footer/Footer.jsx'
// import './App.css'

// function App() {
//     const [loading,setLoading]=useState(true) ;
//     setLoading(false) ;

//     return(
//         loading ? (
//   <div>Loading...</div>
// ) : (
//   <div className='min-h-screen flex flex-wrap content-between bg-grey-400'>
//     <div className='w-full block'>
//         <Header/>
//         <main>
//           <Outlet />
//         </main>
//         <Footer/>
//     </div>
//   </div>
// )
//     )
// }

// export default App ;
