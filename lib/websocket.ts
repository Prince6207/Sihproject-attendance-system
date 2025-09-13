export class AttendanceWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private url: string,
    private onMessage: (data: any) => void,
    private onError?: (error: Event) => void,
  ) {}

  connect() {
    try {
      console.log("[v0] Connecting to WebSocket:", this.url)

      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("[v0] Received WebSocket message:", data)
          this.onMessage(data)
        } catch (error) {
          console.error("[v0] Failed to parse WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
        this.onError?.(error)
        this.handleReconnect()
      }

      this.ws.onclose = () => {
        console.log("[v0] WebSocket disconnected")
        this.handleReconnect()
      }
    } catch (error) {
      console.error("[v0] WebSocket connection error:", error)
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`[v0] Reconnecting... Attempt ${this.reconnectAttempts}`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  disconnect() {
    console.log("[v0] Disconnecting WebSocket")
    this.ws?.close()
    this.ws = null
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.log("[v0] WebSocket not connected, queuing message:", data)
    }
  }
}
