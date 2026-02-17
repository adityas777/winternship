import type { NextRequest } from "next/server"
import { WebSocketServer } from "ws"

// Global WebSocket server instance
let wss: WebSocketServer | null = null

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const protocol = searchParams.get("protocol")

  if (protocol === "websocket") {
    // Initialize WebSocket server if not already created
    if (!wss) {
      wss = new WebSocketServer({ port: 8080 })

      wss.on("connection", (ws) => {
        console.log("[v0] WebSocket client connected")

        // Send initial data
        ws.send(
          JSON.stringify({
            type: "initial",
            message: "Connected to live pricing feed",
          }),
        )

        // Handle client messages
        ws.on("message", (data) => {
          try {
            const message = JSON.parse(data.toString())
            console.log("[v0] Received message:", message)

            if (message.type === "subscribe") {
              // Handle product subscription
              ws.send(
                JSON.stringify({
                  type: "subscribed",
                  product_id: message.product_id,
                }),
              )
            }
          } catch (error) {
            console.error("[v0] Error parsing WebSocket message:", error)
          }
        })

        ws.on("close", () => {
          console.log("[v0] WebSocket client disconnected")
        })
      })

      // Simulate live price updates every 10 seconds
      setInterval(() => {
        if (wss) {
          const mockUpdate = {
            product_id: "01-903-5373",
            name: "Organic Bananas",
            current_price: 2.5,
            recommended_price: (2.0 + Math.random() * 1.0).toFixed(2),
            stock_left: Math.floor(Math.random() * 200) + 50,
            updated_at: new Date().toISOString(),
          }

          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              // WebSocket.OPEN
              client.send(JSON.stringify(mockUpdate))
            }
          })
        }
      }, 10000)
    }

    return new Response("WebSocket server running on port 8080", { status: 200 })
  }

  return new Response("WebSocket protocol required", { status: 400 })
}
