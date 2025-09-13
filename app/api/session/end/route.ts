import { type NextRequest, NextResponse } from "next/server"
import { FirebaseWebSocketManager } from "@/lib/firebase-websocket"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    const firebaseManager = new FirebaseWebSocketManager(
      () => {},
      () => {},
    )
    const result = await firebaseManager.endSession(sessionId)

    console.log("[v0] Ended session:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Session end error:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}
