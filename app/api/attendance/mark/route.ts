import { type NextRequest, NextResponse } from "next/server"
import { FirebaseWebSocketManager } from "@/lib/firebase-websocket"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received attendance request:", body)

    const { token, sessionId, studentId, studentName, rollNo } = body

    if (!token?.trim()) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 })
    }

    if (!sessionId?.trim()) {
      return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 })
    }

    if (!studentId?.trim()) {
      return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 })
    }

    if (!studentName?.trim()) {
      return NextResponse.json({ success: false, error: "Student name is required" }, { status: 400 })
    }

    if (!rollNo?.trim()) {
      return NextResponse.json({ success: false, error: "Roll number is required" }, { status: 400 })
    }

    const sanitizedData = {
      token: String(token).trim(),
      sessionId: String(sessionId).trim(),
      studentId: String(studentId).trim(),
      studentName: String(studentName).trim(),
      rollNo: String(rollNo).trim(),
    }

    console.log("[v0] Sanitized data:", sanitizedData)

    const firebaseManager = new FirebaseWebSocketManager(
      () => {},
      () => {},
    )

    const result = await firebaseManager.markAttendance(
      sanitizedData.sessionId,
      sanitizedData.studentId,
      sanitizedData.token,
      {
        studentName: sanitizedData.studentName,
        rollNo: sanitizedData.rollNo,
      },
    )

    console.log("[v0] Attendance result:", result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      const errorMessage = result.error || "Failed to mark attendance"
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] Attendance marking error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error occurred"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
