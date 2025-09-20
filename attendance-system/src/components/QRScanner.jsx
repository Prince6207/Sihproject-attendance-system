import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import QRCode from 'qrcode';

const QRScanner = () => {
  const [qrData, setQrData] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [scannedResult, setScannedResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  // Fetch QR from backend
  const fetchQR = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/qr/generate?sessionId=123');
      const data = await res.json();
      const qrString = JSON.stringify(data.qrData);
      setQrData(qrString);

      // Generate QR image
      const qrUrl = await QRCode.toDataURL(qrString);
      setQrImageUrl(qrUrl);
    } catch (err) {
      console.error("QR Fetch error:", err);
      setScannedResult("❌ Error fetching QR code. Make sure the backend is running on port 5000.");
    }
  };

  // Initialize QR code fetching
  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 60 * 1000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  // Setup scanner only once
  useEffect(() => {
    const initializeScanner = () => {
      const readerElement = document.getElementById("reader");
      if (!readerElement || isScanning) return;

      try {
        const scanner = new Html5QrcodeScanner("reader", { 
          fps: 10, 
          qrbox: 250 
        });
        
        scannerRef.current = scanner;
        setIsScanning(true);
        
        scanner.render(
          async (decodedText) => {
            setScannedResult("Processing QR code...");
            try {
              const parsed = JSON.parse(decodedText);
              
              // Verify QR code
              const verifyRes = await fetch('http://localhost:5000/api/qr/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: parsed.sessionId,
                  nonce: parsed.nonce,
                }),
              });
              
              const verifyData = await verifyRes.json();
              
              if (verifyData.status === "success") {
                setScannedResult("QR verified! Starting face authentication...");
                
                // Call face authentication
                const faceRes = await fetch('http://localhost:5000/api/face/login-test', {
                  method: 'POST'
                });
                
                const faceData = await faceRes.json();
                
                if (faceData.status === "success") {
                  setScannedResult("✅ Face Authentication Successful! Login completed.");
                } else {
                  setScannedResult("❌ Face Authentication Failed: " + faceData.message);
                }
              } else {
                setScannedResult("❌ QR verification failed: " + verifyData.reason);
              }
            } catch (err) {
              console.error("Verify error:", err);
              setScannedResult("❌ Error processing QR code: " + err.message);
            }
          },
          (error) => {
            // console.log("QR Scanner error:", error);
          }
        );
      } catch (error) {
        console.error("Scanner initialization error:", error);
        setScannedResult("❌ Error initializing QR scanner");
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeScanner, 100);
    
    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        setIsScanning(false);
      }
    };
  }, []); // Empty dependency array - run only once

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>QR Code Attendance System</h1>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2>Teacher View (QR Generator)</h2>
        {qrImageUrl ? (
          <div>
            <img src={qrImageUrl} alt="QR Code" width="200" style={{ border: '1px solid #ccc' }} />
            <p>Session ID: 123</p>
          </div>
        ) : (
          <p>Loading QR...</p>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2>Student View (QR Scanner)</h2>
        <div 
          id="reader" 
          style={{ 
            width: "100%", 
            maxWidth: "500px", 
            height: "400px",
            margin: "0 auto",
            border: "2px solid #ccc"
          }}
        ></div>
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          minHeight: '50px'
        }}>
          <strong>Status:</strong> {scannedResult || "Ready to scan QR code"}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
