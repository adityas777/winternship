import { pathwayClient, type ProductData } from "./pathway-client"

export class LiveDataManager {
  private static instance: LiveDataManager
  private subscribers: Map<string, (data: ProductData) => void> = new Map()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  static getInstance(): LiveDataManager {
    if (!LiveDataManager.instance) {
      LiveDataManager.instance = new LiveDataManager()
    }
    return LiveDataManager.instance
  }

  async initialize(): Promise<void> {
    try {
      await pathwayClient.connect()
      this.isConnected = true
      this.reconnectAttempts = 0

      console.log("[v0] Live data manager initialized")

      // Subscribe to all product updates
      pathwayClient.subscribeToAll((data: ProductData) => {
        console.log("[v0] Broadcasting live update:", data)
        this.broadcastUpdate(data)
      })
    } catch (error) {
      console.error("[v0] Failed to initialize live data manager:", error)
      this.handleConnectionError()
    }
  }

  private handleConnectionError(): void {
    this.isConnected = false

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      console.log(`[v0] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

      setTimeout(() => {
        this.initialize()
      }, delay)
    } else {
      console.error("[v0] Max reconnection attempts reached")
    }
  }

  subscribeToProduct(productId: string, callback: (data: ProductData) => void): () => void {
    const subscriptionKey = `product_${productId}`
    this.subscribers.set(subscriptionKey, callback)

    console.log(`[v0] Subscribed to product updates: ${productId}`)

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriptionKey)
      console.log(`[v0] Unsubscribed from product updates: ${productId}`)
    }
  }

  subscribeToAll(callback: (data: ProductData) => void): () => void {
    const subscriptionKey = "all_products"
    this.subscribers.set(subscriptionKey, callback)

    console.log("[v0] Subscribed to all product updates")

    return () => {
      this.subscribers.delete(subscriptionKey)
      console.log("[v0] Unsubscribed from all product updates")
    }
  }

  private broadcastUpdate(data: ProductData): void {
    // Notify product-specific subscribers
    const productSubscriber = this.subscribers.get(`product_${data.product_id}`)
    if (productSubscriber) {
      productSubscriber(data)
    }

    // Notify global subscribers
    const globalSubscriber = this.subscribers.get("all_products")
    if (globalSubscriber) {
      globalSubscriber(data)
    }
  }

  async fetchLiveProducts(): Promise<ProductData[]> {
    try {
      const response = await fetch("/api/products/live")
      if (!response.ok) {
        throw new Error("Failed to fetch live products")
      }

      const data = await response.json()
      return data.products || []
    } catch (error) {
      console.error("[v0] Error fetching live products:", error)
      return []
    }
  }

  isLiveDataAvailable(): boolean {
    return this.isConnected
  }

  disconnect(): void {
    pathwayClient.disconnect()
    this.subscribers.clear()
    this.isConnected = false
    console.log("[v0] Live data manager disconnected")
  }
}

// Export singleton instance
export const liveDataManager = LiveDataManager.getInstance()
