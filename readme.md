# QR Attendance System

A modern real-time attendance tracking system using QR codes, Firebase, and WebSocket connections.

## Features

- **Real-time QR Code Generation**: Rotating QR codes every 2 seconds for security
- **Live Attendance Tracking**: Real-time updates using Firebase Firestore
- **Multi-role Interface**: Teacher, Student, and Admin dashboards
- **Secure Token Validation**: Time-based token expiration and validation
- **Live Statistics**: Real-time attendance counters and recent scans

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore Database
4. Get your Firebase configuration from Project Settings

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 3. Firestore Security Rules

Add these security rules to your Firestore:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions collection
    match /sessions/{sessionId} {
      allow read, write: if true; // Adjust based on your auth requirements
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read, write: if true; // Adjust based on your auth requirements
    }
  }
}
\`\`\`

### 4. Run the Application

\`\`\`bash
npm install
npm run dev
\`\`\`

## How It Works

### Teacher Flow
1. Click "Start Attendance Session" to create a new session
2. QR code rotates every 2 seconds with new secure tokens
3. View live attendance count and recent scans
4. End session when complete

### Student Flow
1. Click "Start Scanner" to simulate QR scanning
2. System validates token and marks attendance
3. Real-time feedback on success/failure

### Technical Architecture
- **Frontend**: Next.js with React hooks for real-time updates
- **Backend**: Firebase Firestore for data persistence
- **Real-time**: Firebase listeners for live updates
- **QR Generation**: External QR API service
- **Security**: Time-based token validation with 2-second expiry

## API Endpoints

- `POST /api/session/create` - Create new attendance session
- `POST /api/session/end` - End active session
- `POST /api/attendance/mark` - Mark student attendance

## Database Schema

### Sessions Collection
\`\`\`javascript
{
  classId: string,
  teacherId: string,
  status: 'active' | 'ended',
  createdAt: timestamp,
  currentToken: string,
  tokenExpiresAt: timestamp,
  attendanceCount: number,
  totalStudents: number
}
\`\`\`

### Attendance Collection
\`\`\`javascript
{
  sessionId: string,
  studentId: string,
  studentName: string,
  rollNo: string,
  timestamp: timestamp,
  token: string
}
