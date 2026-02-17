export interface ProductData {
  product_id: string
  name: string
  current_price: number
  recommended_price?: number
  expiry_date: string
  stock_left: number
  category: string
  price_change?: number
  updated_at?: string
}

export class PathwayClient {
  private ws: WebSocket | null = null
  private listeners: Map<string, (data: ProductData) => void> = new Map()

  constructor(private wsUrl = "ws://localhost:8080/ws") {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl)

        this.ws.onopen = () => {
          console.log("[v0] Pathway WebSocket connected")
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data: ProductData = JSON.parse(event.data)
            console.log("[v0] Received product update:", data)

            // Notify all listeners for this product
            const listener = this.listeners.get(data.product_id)
            if (listener) {
              listener(data)
            }

            // Notify global listeners
            const globalListener = this.listeners.get("*")
            if (globalListener) {
              globalListener(data)
            }
          } catch (error) {
            console.error("[v0] Error parsing WebSocket message:", error)
          }
        }

        this.ws.onerror = (error) => {
          console.error("[v0] WebSocket error:", error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log("[v0] WebSocket connection closed")
          // Attempt to reconnect after 5 seconds
          setTimeout(() => this.connect(), 5000)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  subscribe(productId: string, callback: (data: ProductData) => void): () => void {
    this.listeners.set(productId, callback)

    // Send subscription message
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          product_id: productId,
        }),
      )
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(productId)
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: "unsubscribe",
            product_id: productId,
          }),
        )
      }
    }
  }

  subscribeToAll(callback: (data: ProductData) => void): () => void {
    this.listeners.set("*", callback)

    return () => {
      this.listeners.delete("*")
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

// Singleton instance
export const pathwayClient = new PathwayClient()
