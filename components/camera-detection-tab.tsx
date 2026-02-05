"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, CameraOff, Zap, Package, AlertTriangle, CheckCircle, Eye, Target } from "lucide-react"
import type { PricingRecommendation } from "@/types"

interface CameraDetectionTabProps {
  onProductDetected: (productName: string) => void
  recommendation: PricingRecommendation | null
  loading: boolean
}

// Object detection mapping - maps COCO class names to our product database
const OBJECT_TO_PRODUCT_MAP: Record<string, string> = {
  // Fruits
  apple: "Organic Apples",
  banana: "Organic Bananas",
  orange: "Fresh Oranges",

  // Dairy & Beverages
  bottle: "Organic Milk",
  cup: "Greek Yogurt",

  // Bakery
  "hot dog": "Whole Wheat Bread", // COCO sometimes detects bread as hot dog
  sandwich: "Sourdough Bread",

  // Meat & Seafood
  "dining table": "Fresh Salmon Fillet", // Placeholder for fish detection

  // Vegetables
  broccoli: "Organic Spinach",
  carrot: "Fresh Carrots",

  // Packaged goods
  book: "Premium Ground Coffee", // Books can represent packaged goods
  laptop: "Artisan Pasta", // Electronics can represent packaged items

  // Default mappings for common objects
  person: "Strawberries", // When person is detected, default to strawberries
  cell_phone: "Blueberries", // Phone detection -> berries
}

export default function CameraDetectionTab({ onProductDetected, recommendation, loading }: CameraDetectionTabProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState<Array<{ name: string; confidence: number }>>([])
  const [lastDetection, setLastDetection] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [detectionHistory, setDetectionHistory] = useState<Array<{ object: string; product: string; time: string }>>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Start camera and detection
  const startDetection = async () => {
    try {
      setCameraError(null)

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "environment", // Use back camera on mobile
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setIsDetecting(true)

      // Start detection loop
      detectionIntervalRef.current = setInterval(() => {
        performDetection()
      }, 2000) // Detect every 2 seconds
    } catch (error) {
      console.error("Camera access error:", error)
      setCameraError("Unable to access camera. Please ensure camera permissions are granted.")
    }
  }

  // Stop camera and detection
  const stopDetection = () => {
    setIsDetecting(false)

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setDetectedObjects([])
    setLastDetection(null)
  }

  // Simulate object detection (in real implementation, this would use TensorFlow.js or similar)
  const performDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      // Capture frame from video
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      ctx.drawImage(videoRef.current, 0, 0)

      // Simulate detection results (in real implementation, this would be actual ML inference)
      const mockDetections = await simulateObjectDetection()

      setDetectedObjects(mockDetections)

      // Find the most confident detection
      if (mockDetections.length > 0) {
        const bestDetection = mockDetections.reduce((prev, current) =>
          prev.confidence > current.confidence ? prev : current,
        )

        // Map detected object to product
        const mappedProduct = OBJECT_TO_PRODUCT_MAP[bestDetection.name.toLowerCase()]

        if (mappedProduct && mappedProduct !== lastDetection) {
          setLastDetection(mappedProduct)
          onProductDetected(mappedProduct)

          // Add to detection history
          setDetectionHistory((prev) => [
            {
              object: bestDetection.name,
              product: mappedProduct,
              time: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 4), // Keep last 5 detections
          ])
        }
      }
    } catch (error) {
      console.error("Detection error:", error)
    }
  }

  // Simulate object detection results (replace with actual ML model)
  const simulateObjectDetection = async (): Promise<Array<{ name: string; confidence: number }>> => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [
      {
        name: "banana",
        confidence: 0.95, // High confidence for consistent banana detection
      },
    ]
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-6 w-6 text-purple-400" />
            Live Object Detection & Pricing
          </CardTitle>
          <CardDescription className="text-gray-300">
            Point your camera at products to get instant AI-powered pricing recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-400" />
                Live Camera Feed
              </span>
              <div className="flex gap-2">
                {!isDetecting ? (
                  <Button onClick={startDetection} className="glow-button" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Detection
                  </Button>
                ) : (
                  <Button onClick={stopDetection} variant="destructive" size="sm">
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Detection
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="hidden" />

              {/* Detection overlay */}
              {isDetecting && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex items-center gap-2 bg-black/70 rounded-lg p-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm">Detecting objects...</span>
                  </div>
                </div>
              )}

              {/* No camera placeholder */}
              {!isDetecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-100">Click "Start Detection" to begin</p>
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <Alert className="glow-card border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-gray-100">
                  <strong className="text-red-400">Camera Error:</strong> {cameraError}
                </AlertDescription>
              </Alert>
            )}

            {/* Detection Results */}
            {detectedObjects.length > 0 && (
              <Card className="bg-gray-800 border-purple-500/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    Detected Objects
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 space-y-2">
                  {detectedObjects.map((obj, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white capitalize">{obj.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={obj.confidence * 100} className="w-20 h-2" />
                        <span className="text-sm text-gray-100">{(obj.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Detection Results & Recommendations */}
        <div className="space-y-4">
          {/* Current Detection */}
          {lastDetection && (
            <Card className="glow-card border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Product Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Package className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">{lastDetection}</h3>
                  <Badge className="bg-green-600 text-white">Ready for Pricing Analysis</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Recommendation */}
          {recommendation && lastDetection && (
            <Card className="glow-card border-blue-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-blue-400" />
                  AI Pricing Recommendation
                </CardTitle>
                <CardDescription className="text-gray-300">Based on detected product: {lastDetection}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-white">Analyzing pricing...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-300">Original Price</p>
                        <p className="text-xl font-bold text-white">
                          ${recommendation.predictedPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">Recommended Discount</p>
                        <p className="text-xl font-bold text-orange-400">{recommendation.discountPercent}%</p>
                      </div>
                    </div>

                    <div className="text-center py-4 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg">
                      <p className="text-sm text-gray-300 mb-1">Final Recommended Price</p>
                      <p className="text-3xl font-bold text-green-400">
                        ${recommendation.discountedPrice?.toFixed(2) || "0.00"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-100">Expected Revenue</p>
                        <p className="text-white font-semibold">
                          ${recommendation.estimatedRevenue?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-100">Waste Reduction</p>
                        <p className="text-green-400 font-semibold">
                          {recommendation.wasteReduction?.toFixed(0) || "0"} units
                        </p>
                      </div>
                    </div>

                    <Alert className="bg-blue-900/30 border-blue-500/50">
                      <AlertTriangle className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-gray-100 text-sm">{recommendation.reasoning}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Detection History */}
          {detectionHistory.length > 0 && (
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="text-white">Recent Detections</CardTitle>
                <CardDescription className="text-gray-300">History of detected products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detectionHistory.map((detection, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
                    >
                      <div>
                        <p className="text-white font-medium">{detection.product}</p>
                        <p className="text-sm text-gray-400">Detected: {detection.object}</p>
                      </div>
                      <span className="text-xs text-gray-500">{detection.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="glow-card">
            <CardHeader>
              <CardTitle className="text-white">📱 How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p>Click "Start Detection" to activate your camera</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>Hold products in front of the camera (fruits, packaged goods, etc.)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>Wait for object detection and automatic product mapping</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </div>
                  <p>Get instant AI-powered pricing recommendations</p>
                </div>
              </div>

              <Alert className="mt-4 bg-yellow-900/30 border-yellow-500/50">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-gray-100 text-sm">
                  <strong className="text-yellow-400">Note:</strong> This demo uses simulated object detection. In
                  production, this would use real computer vision models like YOLOv8 or TensorFlow.js.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
