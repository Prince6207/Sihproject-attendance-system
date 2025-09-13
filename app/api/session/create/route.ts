import { type NextRequest, NextResponse } from "next/server"
import { FirebaseWebSocketManager } from "@/lib/firebase-websocket"

export async function POST(request: NextRequest) {
  try {
    const { classId, teacherId, teacherName, className, subjectCode } = await request.json()

    // Validate required fields
    if (!teacherName || !className || !subjectCode) {
      return NextResponse.json({ error: "Missing required teacher details" }, { status: 400 })
    }

    const firebaseManager = new FirebaseWebSocketManager(
      () => {},
      () => {},
    )

    const session = await firebaseManager.createSession(classId, teacherId, {
      teacherName,
      className,
      subjectCode,
      startTime: new Date().toISOString(),
    })

    console.log("[v0] Created session:", session)

    return NextResponse.json(session)
  } catch (error) {
    console.error("[v0] Session creation error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
