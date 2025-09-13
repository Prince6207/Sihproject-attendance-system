import jsQR from "jsqr"

export class QRScanner {
  private video: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private scanning = false
  private onDetected: (data: string) => void = () => {}
  private onError: (error: string) => void = () => {}
  private animationId: number | null = null

  constructor(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    onDetected: (data: string) => void,
    onError: (error: string) => void,
  ) {
    this.video = video
    this.canvas = canvas
    this.context = canvas.getContext("2d")
    this.onDetected = onDetected
    this.onError = onError
  }

  async startScanning(): Promise<void> {
    if (!this.video || !this.canvas || !this.context) {
      this.onError("Video or canvas elements not available")
      return
    }

    if (!document.contains(this.video) || !document.contains(this.canvas)) {
      this.onError("Video or canvas elements not attached to DOM")
      return
    }

    try {
      console.log("[v0] Requesting camera access...")

      let stream: MediaStream | null = null

      try {
        // Try back camera first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
        })
      } catch (backCameraError) {
        console.log("[v0] Back camera not available, trying front camera...")
        // Fallback to front camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
        })
      }

      if (!stream) {
        throw new Error("No camera stream available")
      }

      this.video.srcObject = stream
      this.video.setAttribute("playsinline", "true")
      this.video.setAttribute("muted", "true")
      this.video.muted = true

      console.log("[v0] Starting video playback...")

      await new Promise<void>((resolve, reject) => {
        const onLoadedMetadata = () => {
          console.log("[v0] Video metadata loaded, dimensions:", this.video?.videoWidth, "x", this.video?.videoHeight)
          this.video?.removeEventListener("loadedmetadata", onLoadedMetadata)
          this.video?.removeEventListener("error", onError)
          resolve()
        }

        const onError = (error: Event) => {
          console.error("[v0] Video loading error:", error)
          this.video?.removeEventListener("loadedmetadata", onLoadedMetadata)
          this.video?.removeEventListener("error", onError)
          reject(new Error("Failed to load video"))
        }

        this.video?.addEventListener("loadedmetadata", onLoadedMetadata)
        this.video?.addEventListener("error", onError)

        this.video?.play().catch(reject)
      })

      this.scanning = true
      console.log("[v0] Starting QR code scanning...")
      this.scanFrame()
    } catch (error) {
      console.error("[v0] Camera initialization error:", error)
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          this.onError("Camera permission denied. Please allow camera access and try again.")
        } else if (error.name === "NotFoundError") {
          this.onError("No camera found. Please ensure your device has a camera.")
        } else if (error.name === "NotReadableError") {
          this.onError("Camera is already in use by another application.")
        } else {
          this.onError(`Camera error: ${error.message}`)
        }
      } else {
        this.onError("Unknown camera error occurred")
      }
    }
  }

  private scanFrame(): void {
    if (!this.scanning || !this.video || !this.canvas || !this.context) {
      return
    }

    if (
      this.video.readyState >= 2 && // 2 is HAVE_CURRENT_DATA
      this.video.videoWidth > 0 &&
      this.video.videoHeight > 0
    ) {
      try {
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)

        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        })

        if (code && code.data) {
          console.log("[v0] QR Code detected:", code.data)
          this.scanning = false // Stop scanning immediately after detection
          this.onDetected(code.data)
          return
        }
      } catch (scanError) {
        console.error("[v0] QR scanning error:", scanError)
      }
    }

    if (this.scanning) {
      this.animationId = requestAnimationFrame(() => this.scanFrame())
    }
  }

  stopScanning(): void {
    console.log("[v0] Stopping QR scanner...")
    this.scanning = false

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    if (this.video && this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream
      stream.getTracks().forEach((track) => {
        console.log("[v0] Stopping track:", track.kind)
        track.stop()
      })
      this.video.srcObject = null
      this.video.load() // Reset video element
    }

    if (this.canvas && this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  isScanning(): boolean {
    return this.scanning
  }
}
