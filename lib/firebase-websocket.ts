import { db } from "./firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  getDocs,
} from "firebase/firestore"

export class FirebaseWebSocketManager {
  private unsubscribes: (() => void)[] = []
  private connected = false
  private onConnectionChange?: (connected: boolean) => void

  constructor(
    private onMessage: (data: any) => void,
    private onError?: (error: Error) => void,
    onConnectionChange?: (connected: boolean) => void,
  ) {
    this.onConnectionChange = onConnectionChange
  }

  isConnected(): boolean {
    return this.connected
  }

  private setConnectionStatus(connected: boolean) {
    if (this.connected !== connected) {
      this.connected = connected
      this.onConnectionChange?.(connected)
      console.log(`[v0] WebSocket connection status: ${connected ? "Connected" : "Disconnected"}`)
    }
  }

  async createSession(classId: string, teacherId: string, teacherMetadata?: any) {
    try {
      const sessionRef = await addDoc(collection(db, "sessions"), {
        classId,
        teacherId,
        teacherName: teacherMetadata?.teacherName || "Unknown Teacher",
        className: teacherMetadata?.className || "Unknown Class",
        subjectCode: teacherMetadata?.subjectCode || classId,
        startTime: teacherMetadata?.startTime || new Date().toISOString(),
        status: "active",
        createdAt: serverTimestamp(),
        currentToken: "",
        tokenExpiresAt: null,
        attendanceCount: 0,
        totalStudents: 0,
      })

      console.log("[v0] Session created:", sessionRef.id)
      this.setConnectionStatus(true)

      return {
        sessionId: sessionRef.id,
        streamUrl: `wss://your-websocket-server.com/session/${sessionRef.id}`,
      }
    } catch (error) {
      console.error("[v0] Failed to create session:", error)
      this.setConnectionStatus(false)
      throw error
    }
  }

  subscribeToSession(sessionId: string) {
    const sessionRef = doc(db, "sessions", sessionId)

    const unsubscribe = onSnapshot(
      sessionRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          this.setConnectionStatus(true)
          this.onMessage({
            type: "session_update",
            sessionData: data,
          })
        }
      },
      (error) => {
        console.error("[v0] Session subscription error:", error)
        this.setConnectionStatus(false)
        this.onError?.(error)
      },
    )

    this.unsubscribes.push(unsubscribe)
  }

  subscribeToAttendance(sessionId: string) {
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("sessionId", "==", sessionId),
      orderBy("timestamp", "desc"),
    )

    const unsubscribe = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        this.setConnectionStatus(true)
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data()
            this.onMessage({
              type: "attendance_update",
              studentName: data.studentName,
              rollNo: data.rollNo,
              timestamp: data.timestamp?.toDate?.() || new Date(),
            })
          }
        })
      },
      (error) => {
        console.error("[v0] Attendance subscription error:", error)
        this.setConnectionStatus(false)
        this.onError?.(error)
      },
    )

    this.unsubscribes.push(unsubscribe)
  }

  async updateSessionToken(sessionId: string, token: string) {
    try {
      const sessionRef = doc(db, "sessions", sessionId)
      await updateDoc(sessionRef, {
        currentToken: token,
        tokenExpiresAt: new Date(Date.now() + 2000), // 2 seconds
      })

      this.onMessage({
        type: "token_update",
        token,
        expiresIn: 2000,
      })
      this.setConnectionStatus(true)
    } catch (error) {
      console.error("[v0] Failed to update token:", error)
      this.setConnectionStatus(false)
      throw error
    }
  }

  async markAttendance(
    sessionId: string,
    studentId: string,
    token: string,
    studentDetails?: { studentName: string; rollNo: string },
  ) {
    try {
      console.log("[v0] Marking attendance:", { sessionId, studentId, token, studentDetails })

      // Validate session and token
      const sessionRef = doc(db, "sessions", sessionId)
      const sessionDoc = await getDoc(sessionRef)

      if (!sessionDoc.exists()) {
        console.error("[v0] Session not found:", sessionId)
        return { success: false, error: "Session not found" }
      }

      const sessionData = sessionDoc.data()
      if (sessionData.status !== "active") {
        console.error("[v0] Session not active:", sessionData.status)
        return { success: false, error: "Session is not active" }
      }

      if (sessionData.currentToken !== token) {
        console.error("[v0] Token mismatch:", { expected: sessionData.currentToken, received: token })
        return { success: false, error: "Invalid or expired token" }
      }

      if (sessionData.tokenExpiresAt && sessionData.tokenExpiresAt.toDate() < new Date()) {
        console.error("[v0] Token expired:", sessionData.tokenExpiresAt.toDate())
        return { success: false, error: "Token has expired" }
      }

      const existingAttendanceQuery = query(
        collection(db, "attendance"),
        where("sessionId", "==", sessionId),
        where("studentId", "==", studentId),
      )

      const existingAttendanceSnapshot = await getDocs(existingAttendanceQuery)
      if (!existingAttendanceSnapshot.empty) {
        console.error("[v0] Student already marked attendance:", studentId)
        return { success: false, error: "Student already marked attendance" }
      }

      const studentName = studentDetails?.studentName || `Student ${studentId}`
      const rollNo = studentDetails?.rollNo || `2024${studentId.slice(-3)}`

      console.log("[v0] Adding attendance record for:", { studentName, rollNo })

      // Add attendance record
      await addDoc(collection(db, "attendance"), {
        sessionId,
        studentId,
        studentName,
        rollNo,
        timestamp: serverTimestamp(),
        token,
      })

      // Update session attendance count
      await updateDoc(sessionRef, {
        attendanceCount: (sessionData.attendanceCount || 0) + 1,
      })

      console.log("[v0] Attendance marked successfully")
      return { success: true, message: `Attendance marked for ${studentName}` }
    } catch (error) {
      console.error("[v0] Failed to mark attendance:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error occurred while marking attendance"

      return { success: false, error: errorMessage }
    }
  }

  async endSession(sessionId: string) {
    try {
      const sessionRef = doc(db, "sessions", sessionId)
      await updateDoc(sessionRef, {
        status: "ended",
        endedAt: serverTimestamp(),
      })

      return { success: true, message: "Session ended successfully" }
    } catch (error) {
      console.error("[v0] Failed to end session:", error)
      throw error
    }
  }

  disconnect() {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe())
    this.unsubscribes = []
    this.setConnectionStatus(false)
  }
}
