import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

// Server-Sent Events endpoint for real-time dashboard updates
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const proto = (request.headers.get("x-forwarded-proto") || request.headers.get("x-forwarded-protocol")) ?? "https"
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? process.env.VERCEL_URL ?? "localhost:3000"
  const base = `${proto}://${host}`

  const customReadable = new ReadableStream({
    start(controller) {
      console.log("[v0] SSE connection established")

      // Send initial connection message
      const initialData = {
        type: "connection",
        message: "Connected to live dashboard stream",
        timestamp: new Date().toISOString(),
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`))

      // Send periodic updates
      const interval = setInterval(async () => {
        try {
          const dashboardResponse = await fetch(`${base}/api/live-dashboard`, { cache: "no-store" })
          const dashboardData = await dashboardResponse.json()

          // Send dashboard update
          const updateData = {
            type: "dashboard_update",
            data: {
              overview: dashboardData.overview,
              alerts_count: dashboardData.alerts.length,
              trending_count: dashboardData.trending_products.length,
            },
            timestamp: new Date().toISOString(),
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`))

          // Simulate random events
          if (Math.random() > 0.7) {
            const eventData = {
              type: "price_alert",
              data: {
                product_name: "Organic Bananas",
                message: "Price optimization recommended",
                severity: "medium",
              },
              timestamp: new Date().toISOString(),
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`))
          }
        } catch (error) {
          console.error("[v0] SSE update error:", error)
          const errorData = {
            type: "error",
            message: "Failed to fetch dashboard updates",
            timestamp: new Date().toISOString(),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
        }
      }, 10000) // Update every 10 seconds

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        console.log("[v0] SSE connection closed")
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
