"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Users, Clock, CheckCircle, Camera, UserCheck, Settings } from "lucide-react"

export default function QRAttendanceSystem() {
  const [currentRole, setCurrentRole] = useState<"teacher" | "student" | "admin">("teacher")
  const [sessionActive, setSessionActive] = useState(false)
  const [qrToken, setQrToken] = useState("")
  const [countdown, setCountdown] = useState(2)
  const [attendanceCount, setAttendanceCount] = useState({ present: 0, total: 45 })
  const [recentScans, setRecentScans] = useState<Array<{ name: string; rollNo: string; time: string }>>([])
  const [scannerActive, setScannerActive] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)

  // Simulate QR token rotation every 2 seconds
  useEffect(() => {
    if (sessionActive) {
      const interval = setInterval(() => {
        const newToken = `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setQrToken(newToken)
        setCountdown(2)

        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              return 2
            }
            return prev - 1
          })
        }, 1000)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [sessionActive])

  const startSession = () => {
    setSessionActive(true)
    const initialToken = `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setQrToken(initialToken)
  }

  const endSession = () => {
    setSessionActive(false)
    setQrToken("")
  }

  const simulateAttendance = () => {
    const names = ["Priyanshu Kumar", "Ananya Sharma", "Rohit Patel", "Sneha Gupta", "Arjun Singh"]
    const name = names[Math.floor(Math.random() * names.length)]
    const rollNo = `2024${Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0")}`
    const time = new Date().toLocaleTimeString()

    setRecentScans((prev) => [{ name, rollNo, time }, ...prev.slice(0, 4)])
    setAttendanceCount((prev) => ({ ...prev, present: prev.present + 1 }))
  }

  const simulateStudentScan = () => {
    setScannerActive(true)
    setTimeout(() => {
      setScanResult({ success: true, message: "Attendance marked successfully!" })
      setScannerActive(false)
    }, 2000)
  }

  const generateQRUrl = (data: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=200x200&format=png&margin=10`
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">QR Attendance System</h1>
          <p className="text-muted-foreground">Modern attendance tracking for educational institutions</p>
        </div>

        {/* Role Selector */}
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

        {/* Teacher Dashboard */}
        {currentRole === "teacher" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* QR Code Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Attendance QR Code
                  </CardTitle>
                  <CardDescription>Students scan this rotating QR code to mark attendance</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {sessionActive ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={generateQRUrl(qrToken) || "/placeholder.svg"}
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
                      <Button onClick={endSession} variant="destructive">
                        End Session
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <Button onClick={startSession} className="w-full">
                        Start Attendance Session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Live Dashboard */}
            <div className="space-y-6">
              {/* Attendance Counter */}
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

              {/* Recent Scans */}
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
                  {sessionActive && (
                    <Button
                      onClick={simulateAttendance}
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 bg-transparent"
                    >
                      Simulate Scan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Student Scanner */}
        {currentRole === "student" && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Scan Attendance QR
                </CardTitle>
                <CardDescription>Point your camera at the teacher's QR code to mark attendance</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {scannerActive ? (
                  <div className="space-y-4">
                    <div className="w-64 h-64 mx-auto bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
                      <Camera className="w-16 h-16 text-muted-foreground animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground">Scanning for QR code...</p>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-4">
                    <div className="w-64 h-64 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-16 h-16 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-primary">{scanResult.message}</p>
                      <p className="text-sm text-muted-foreground">Marked at {new Date().toLocaleTimeString()}</p>
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
                    <Button onClick={simulateStudentScan} className="w-full">
                      Start Scanner
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Panel */}
        {currentRole === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage teachers and students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select className="w-full p-2 border rounded-md bg-background">
                    <option>Student</option>
                    <option>Teacher</option>
                  </select>
                </div>
                <Button className="w-full">Add User</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Reports</CardTitle>
                <CardDescription>View attendance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Today's Sessions</span>
                    <Badge>12</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Attendance</span>
                    <Badge variant="secondary">89%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Classes</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Monitor system health</CardDescription>
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
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
