# Fixed Setup Instructions for Attendance System

## Issues Fixed:
1. ✅ **Port Mismatch**: Frontend was connecting to port 8000, but Express runs on port 5000
2. ✅ **Express-FastAPI Communication**: Fixed routing and response handling
3. ✅ **QR to Face Auth Flow**: Fixed the complete authentication pipeline
4. ✅ **Environment Configuration**: Added proper debugging and logging

## Quick Start:

### 1. Start Both Backends
```bash
# Option 1: Use the fixed batch script
start_servers_fixed.bat

# Option 2: Manual start
# Terminal 1 - Express Backend
cd Backend
npm start

# Terminal 2 - FastAPI Backend  
cd FaceAuth
python main.py
```

### 2. Start Frontend
```bash
cd attendance-system
npm run dev
```

### 3. Test Communication
```bash
node test_communication.js
```

## Port Configuration:
- **Express Backend**: `http://localhost:5000`
- **FastAPI Backend**: `http://localhost:8001` 
- **React Frontend**: `http://localhost:5173`

## API Endpoints:

### Express Backend (Port 5000):
- `GET /` - Health check
- `GET /api/qr/generate?sessionId=123` - Generate QR code
- `POST /api/qr/verify` - Verify QR code
- `POST /api/face/login/:username` - Face login (calls FastAPI)
- `POST /api/face/signup/:username` - Face signup (calls FastAPI)

### FastAPI Backend (Port 8001):
- `GET /` - Health check
- `POST /api/face/login/:username` - Face authentication
- `POST /api/face/signup/:username` - Face registration

## Flow:
1. **QR Generation**: Teacher generates QR → Express backend creates QR with sessionId + nonce
2. **QR Scanning**: Student scans QR → Frontend sends to Express for verification
3. **Face Auth**: After QR verification → Express calls FastAPI for face authentication
4. **Result**: Success/failure returned to frontend

## Troubleshooting:

### If Express backend not starting:
```bash
cd Backend
npm install
npm start
```

### If FastAPI backend not starting:
```bash
cd FaceAuth
pip install -r requirements.txt
python main.py
```

### If face authentication fails:
1. Make sure camera is connected
2. Check if user "trace" is registered (run signup first)
3. Ensure good lighting for face detection

### Test individual components:
```bash
# Test Express only
curl http://localhost:5000/

# Test FastAPI only  
curl http://localhost:8001/

# Test QR generation
curl http://localhost:5000/api/qr/generate?sessionId=123

# Test face auth (requires camera)
curl -X POST http://localhost:5000/api/face/login/trace
```

## Expected Console Output:

### Express Backend:
```
🚀 Express server running on http://localhost:5000
📱 Frontend should connect to: http://localhost:5000
🔗 FastAPI should be running on: http://localhost:8001
```

### FastAPI Backend:
```
🚀 Starting FastAPI server on http://localhost:8001
INFO:     Uvicorn running on http://0.0.0.0:8001
```

## Next Steps:
1. Start both backends using `start_servers_fixed.bat`
2. Start frontend with `npm run dev` in attendance-system folder
3. Navigate to attendance page
4. Test QR generation and scanning
5. Test face authentication flow
