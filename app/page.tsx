"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  QrCode,
  Users,
  Clock,
  CheckCircle,
  Camera,
  UserCheck,
  Settings,
  Wifi,
  WifiOff,
  Download,
  Plus,
  Eye,
} from "lucide-react"
import { FirebaseWebSocketManager } from "@/lib/firebase-websocket"
import { QRScanner } from "@/lib/qr-scanner"

export default function QRAttendanceSystem() {
  const [currentRole, setCurrentRole] = useState<"teacher" | "student" | "admin">("teacher")
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [qrToken, setQrToken] = useState("")
  const [countdown, setCountdown] = useState(2)
  const [attendanceCount, setAttendanceCount] = useState({ present: 0, total: 45 })
  const [recentScans, setRecentScans] = useState<Array<{ name: string; rollNo: string; time: string }>>([])
  const [scannerActive, setScannerActive] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const firebaseManagerRef = useRef<FirebaseWebSocketManager | null>(null)

  const [teacherName, setTeacherName] = useState("")
  const [className, setClassName] = useState("")
  const [subjectCode, setSubjectCode] = useState("")

  const [studentName, setStudentName] = useState("")
  const [studentRollNo, setStudentRollNo] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrScannerRef = useRef<QRScanner | null>(null)

  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([])
  const [sessions, setSessions] = useState<Array<{ id: string; class: string; date: string; attendance: number }>>([])
  const [systemLogs, setSystemLogs] = useState<Array<{ time: string; event: string; status: string }>>([])
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Student" })

  const handleWebSocketMessage = (data: any) => {
    console.log("[v0] Received Firebase message:", data)

    switch (data.type) {
      case "token_update":
        setQrToken(data.token)
        setCountdown(2)
        break
      case "attendance_update":
        setRecentScans((prev) => [
          {
            name: data.studentName,
            rollNo: data.rollNo,
            time: new Date(data.timestamp).toLocaleTimeString(),
          },
          ...prev.slice(0, 4),
        ])
        setAttendanceCount((prev) => ({ ...prev, present: prev.present + 1 }))
        setSystemLogs((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            event: `Attendance marked: ${data.studentName} (${data.rollNo})`,
            status: "success",
          },
          ...prev.slice(0, 9),
        ])
        break
      case "session_update":
        setAttendanceCount((prev) => ({
          ...prev,
          present: data.sessionData.attendanceCount || 0,
        }))
        break
    }
  }

  const startSession = async () => {
    if (!teacherName.trim() || !className.trim() || !subjectCode.trim()) {
      setSystemLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          event: "Failed to start session: Missing teacher details",
          status: "error",
        },
        ...prev.slice(0, 9),
      ])
      return
    }

    try {
      console.log("[v0] Starting session...")
      const response = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: subjectCode,
          teacherId: `teacher_${teacherName.replace(/\s+/g, "_").toLowerCase()}`,
          teacherName: teacherName,
          className: className,
          subjectCode: subjectCode,
        }),
      })

      const session = await response.json()
      console.log("[v0] Session created:", session)

      setSessionId(session.sessionId)
      setSessionActive(true)

      firebaseManagerRef.current = new FirebaseWebSocketManager(
        handleWebSocketMessage,
        (error) => {
          console.error("[v0] Firebase error:", error)
          setWsConnected(false)
          setSystemLogs((prev) => [
            {
              time: new Date().toLocaleTimeString(),
              event: `WebSocket error: ${error.message}`,
              status: "error",
            },
            ...prev.slice(0, 9),
          ])
        },
        (connected) => {
          setWsConnected(connected)
          setSystemLogs((prev) => [
            {
              time: new Date().toLocaleTimeString(),
              event: `WebSocket ${connected ? "connected" : "disconnected"}`,
              status: connected ? "success" : "error",
            },
            ...prev.slice(0, 9),
          ])
        },
      )

      firebaseManagerRef.current.subscribeToSession(session.sessionId)
      firebaseManagerRef.current.subscribeToAttendance(session.sessionId)

      setSystemLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          event: `Session started: ${session.sessionId}`,
          status: "success",
        },
        ...prev.slice(0, 9),
      ])

      startTokenRotation(session.sessionId)
    } catch (error) {
      console.error("[v0] Failed to start session:", error)
      setWsConnected(false)
      setSystemLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          event: `Failed to start session: ${error}`,
          status: "error",
        },
        ...prev.slice(0, 9),
      ])
    }
  }

  const startTokenRotation = (sessionId: string) => {
    const rotateToken = async () => {
      const newToken = `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      if (firebaseManagerRef.current) {
        await firebaseManagerRef.current.updateSessionToken(sessionId, newToken)
      }
    }

    rotateToken()

    const interval = setInterval(rotateToken, 2000)
    ;(firebaseManagerRef.current as any).tokenInterval = interval
  }

  const endSession = async () => {
    try {
      console.log("[v0] Ending session...")
      const response = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const result = await response.json()
      console.log("[v0] Session ended:", result)

      setSessionActive(false)
      setQrToken("")
      setSessionId("")

      firebaseManagerRef.current?.disconnect()
      if ((firebaseManagerRef.current as any)?.tokenInterval) {
        clearInterval((firebaseManagerRef.current as any).tokenInterval)
      }
      setWsConnected(false)

      setSystemLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          event: `Session ended: ${sessionId}`,
          status: "success",
        },
        ...prev.slice(0, 9),
      ])
    } catch (error) {
      console.error("[v0] Failed to end session:", error)
    }
  }

  const startCamera = async () => {
    if (!studentName.trim() || !studentRollNo.trim()) {
      setScanResult({ success: false, message: "Please enter your name and roll number first" })
      return
    }

    const waitForElements = async (maxRetries = 10, delay = 100) => {
      for (let i = 0; i < maxRetries; i++) {
        if (
          videoRef.current &&
          canvasRef.current &&
          document.contains(videoRef.current) &&
          document.contains(canvasRef.current)
        ) {
          return true
        }
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      return false
    }

    try {
      console.log("[v0] Initializing camera scanner...")
      setScannerActive(true)
      setScanResult(null)

      const elementsReady = await waitForElements()

      if (!elementsReady) {
        throw new Error("Camera interface elements are not ready. Please try again.")
      }

      console.log("[v0] DOM elements confirmed ready")

      qrScannerRef.current = new QRScanner(
  videoRef.current!,
  canvasRef.current!,
  (qrData: string) => {
    console.log("[v0] QR Code detected:", qrData)
    let parsed
    try {
      parsed = JSON.parse(qrData)
    } catch {
      setScanResult({ success: false, message: "Invalid QR code format" })
      stopCamera()
      return
    }
    if (!parsed.sessionId || !parsed.token) {
      setScanResult({ success: false, message: "QR code missing session info" })
      stopCamera()
      return
    }
    // Use parsed.sessionId directly for attendance
    markAttendance(parsed.token, parsed.sessionId)
  },
  (error: string) => {
    console.error("[v0] QR Scanner error:", error)
    setScanResult({ success: false, message: error })
    setScannerActive(false)
  },
)

      await qrScannerRef.current.startScanning()
      console.log("[v0] Camera scanner started successfully")
    } catch (error) {
      console.error("[v0] Failed to start camera:", error)
      setScanResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to access camera. Please check permissions and try again.",
      })
      setScannerActive(false)
    }
  }

const markAttendance = async (detectedToken: string, scannedSessionId?: string) => {
  if (!studentName.trim() || !studentRollNo.trim()) {
    setScanResult({ success: false, message: "Please enter your name and roll number" })
    stopCamera()
    return
  }

  const activeSessionId = scannedSessionId || sessionId
  if (!activeSessionId) {
    setScanResult({ success: false, message: "No active session. Please ask your teacher to start the session." })
    stopCamera()
    return
  }

  try {
    console.log("[v0] Marking attendance with token:", detectedToken)
    const response = await fetch("/api/attendance/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: detectedToken.trim(),
        sessionId: activeSessionId,
        studentId: `student_${studentRollNo.trim()}`,
        studentName: studentName.trim(),
        rollNo: studentRollNo.trim(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`Server error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("[v0] Attendance result:", result)

    if (result.success) {
      setScanResult({ success: true, message: `Attendance marked for ${studentName}` })
    } else {
      setScanResult({ success: false, message: result.error || "Failed to mark attendance" })
    }
  } catch (error) {
    console.error("[v0] Scan error:", error)
    setScanResult({
      success: false,
      message: error instanceof Error ? error.message : "Network error occurred",
    })
  } finally {
    stopCamera()
  }
}

  const stopCamera = () => {
    console.log("[v0] Stopping camera scanner...")
    if (qrScannerRef.current) {
      qrScannerRef.current.stopScanning()
      qrScannerRef.current = null
    }
    setScannerActive(false)
  }

  const addUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return

    const user = {
      id: `user_${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }

    setUsers((prev) => [...prev, user])
    setNewUser({ name: "", email: "", role: "Student" })

    setSystemLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        event: `User added: ${user.name} (${user.role})`,
        status: "success",
      },
      ...prev.slice(0, 9),
    ])
  }

  const exportCSV = () => {
    const csvContent = [["Name", "Roll No", "Time"], ...recentScans.map((scan) => [scan.name, scan.rollNo, scan.time])]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_${sessionId || "session"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // Initialize with empty arrays - no mock data
    setUsers([])
    setSessions([])
    setSystemLogs([{ time: new Date().toLocaleTimeString(), event: "System initialized", status: "success" }])
  }, [])

  useEffect(() => {
    if (sessionActive && qrToken) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 2
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [sessionActive, qrToken])

  useEffect(() => {
    return () => {
      firebaseManagerRef.current?.disconnect()
      if ((firebaseManagerRef.current as any)?.tokenInterval) {
        clearInterval((firebaseManagerRef.current as any).tokenInterval)
      }
      stopCamera()
    }
  }, [])

  const generateQRUrl = () => {
  if (!sessionId || !qrToken) return "/placeholder.svg"
  const qrData = JSON.stringify({ sessionId, token: qrToken })
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200&format=png&margin=10`
}

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">QR Attendance System</h1>
              <p className="text-muted-foreground">Modern attendance tracking with real-time WebSocket updates</p>
            </div>
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <Badge className="bg-green-500 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as any)}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Teacher
              </TabsTrigger>
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {currentRole === "teacher" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {!sessionActive && (
              <div className="lg:col-span-3 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Teacher Details
                    </CardTitle>
                    <CardDescription>Enter your details before starting the session</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacherName">Teacher Name</Label>
                        <Input
                          id="teacherName"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="className">Class Name</Label>
                        <Input
                          id="className"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          placeholder="e.g., Computer Science A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subjectCode">Subject Code</Label>
                        <Input
                          id="subjectCode"
                          value={subjectCode}
                          onChange={(e) => setSubjectCode(e.target.value)}
                          placeholder="e.g., CS101"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Attendance QR Code
                    {sessionId && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {sessionId.slice(-8)}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {sessionActive
                      ? `${className} - ${subjectCode} | ${teacherName}`
                      : "Students scan this rotating QR code to mark attendance"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {sessionActive ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={generateQRUrl() || "/placeholder.svg"}
                          alt="Attendance QR Code"
                          className="mx-auto rounded-lg shadow-lg transition-opacity duration-300"
                          style={{ opacity: countdown > 0.5 ? 1 : 0.7 }}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {countdown}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                        Token: {qrToken.slice(-12)}...
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={endSession} variant="destructive" className="flex-1">
                          End Session
                        </Button>
                        <Button onClick={exportCSV} variant="outline" className="flex-1 bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <Button
                        onClick={startSession}
                        className="w-full"
                        disabled={!teacherName.trim() || !className.trim() || !subjectCode.trim()}
                      >
                        Start Attendance Session
                      </Button>
                      {(!teacherName.trim() || !className.trim() || !subjectCode.trim()) && (
                        <p className="text-sm text-muted-foreground mt-2">Please fill in all teacher details above</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Live Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Present</span>
                      <Badge variant="default" className="bg-primary">
                        {attendanceCount.present}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Absent</span>
                      <Badge variant="secondary">{attendanceCount.total - attendanceCount.present}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <Badge variant="outline">{attendanceCount.total}</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(attendanceCount.present / attendanceCount.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Scans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentScans.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent scans</p>
                    ) : (
                      recentScans.map((scan, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg animate-in slide-in-from-top-2 duration-300"
                        >
                          <div>
                            <p className="text-sm font-medium">{scan.name}</p>
                            <p className="text-xs text-muted-foreground">Roll: {scan.rollNo}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">{scan.time}</div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentRole === "student" && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Scan Attendance QR
                </CardTitle>
                <CardDescription>Enter your details and scan the teacher's QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={scannerActive}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentRollNo">Roll Number</Label>
                    <Input
                      id="studentRollNo"
                      value={studentRollNo}
                      onChange={(e) => setStudentRollNo(e.target.value)}
                      placeholder="Enter your roll number"
                      disabled={scannerActive}
                    />
                  </div>
                </div>

                <div className="text-center">
                  {scannerActive ? (
                    <div className="space-y-4">
                      <div className="relative w-64 h-64 mx-auto bg-muted rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                          style={{ transform: "scaleX(-1)" }}
                        />
                        <canvas ref={canvasRef} className="hidden" width="640" height="480" />
                        <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary animate-pulse"></div>
                          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary animate-pulse"></div>
                          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary animate-pulse"></div>
                          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary animate-pulse"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 border-2 border-primary/70 rounded-lg animate-pulse"></div>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-2 rounded">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Scanning for QR code...
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Point your camera at the teacher's QR code</p>
                      <Button onClick={stopCamera} variant="outline" className="w-full bg-transparent">
                        Stop Scanner
                      </Button>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} className="hidden" autoPlay playsInline muted />
                      <canvas ref={canvasRef} className="hidden" width="640" height="480" />
                      {scanResult ? (
                        <div className="space-y-4">
                          <div
                            className={`w-64 h-64 mx-auto rounded-lg flex items-center justify-center ${
                              scanResult.success ? "bg-primary/10" : "bg-destructive/10"
                            }`}
                          >
                            <CheckCircle
                              className={`w-16 h-16 ${scanResult.success ? "text-primary" : "text-destructive"}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <p className={`font-medium ${scanResult.success ? "text-primary" : "text-destructive"}`}>
                              {scanResult.message}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {scanResult.success ? `Marked at ${new Date().toLocaleTimeString()}` : "Please try again"}
                            </p>
                          </div>
                          <Button onClick={() => setScanResult(null)} variant="outline" className="w-full">
                            Scan Again
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-64 h-64 mx-auto bg-muted rounded-lg flex items-center justify-center">
                            <Camera className="w-16 h-16 text-muted-foreground" />
                          </div>
                          <Button
                            onClick={startCamera}
                            className="w-full"
                            disabled={!studentName.trim() || !studentRollNo.trim()}
                          >
                            Start Camera Scanner
                          </Button>
                          {(!studentName.trim() || !studentRollNo.trim()) && (
                            <p className="text-sm text-muted-foreground">
                              Please enter your name and roll number first
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Make sure to allow camera access when prompted
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentRole === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>Add and manage users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name</Label>
                  <Input
                    id="userName"
                    value={newUser.name}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">Role</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newUser.role}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option>Student</option>
                    <option>Teacher</option>
                  </select>
                </div>
                <Button onClick={addUser} className="w-full">
                  Add User
                </Button>

                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  <h4 className="text-sm font-medium">Current Users ({users.length})</h4>
                  {users.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-xs">{user.email}</p>
                      </div>
                      <Badge variant={user.role === "Teacher" ? "default" : "secondary"}>{user.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Session Reports
                </CardTitle>
                <CardDescription>View detailed analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Today's Sessions</span>
                    <Badge>{sessions.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Attendance</span>
                    <Badge variant="secondary">
                      {sessions.length > 0
                        ? Math.round(sessions.reduce((acc, s) => acc + s.attendance, 0) / sessions.length)
                        : 0}
                      %
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <Badge variant="outline">{sessionActive ? 1 : 0}</Badge>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <h4 className="text-sm font-medium">Recent Sessions</h4>
                    {sessions.map((session) => (
                      <div key={session.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                        <div>
                          <p className="font-medium">{session.class}</p>
                          <p className="text-muted-foreground text-xs">{session.date}</p>
                        </div>
                        <Badge variant="outline">{session.attendance}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Monitor system health and logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Server Status</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-500">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WebSocket</span>
                    <Badge className={wsConnected ? "bg-green-500" : "bg-red-500"}>
                      {wsConnected ? "Active" : "Disconnected"}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <h4 className="text-sm font-medium">System Logs</h4>
                    {systemLogs.map((log, index) => (
                      <div key={index} className="p-2 bg-muted rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono">{log.time}</span>
                          <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-xs">
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{log.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
