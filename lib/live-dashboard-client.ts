export interface LiveDashboardData {
  overview: {
    total_products: number
    active_alerts: number
    revenue_impact: number
    waste_reduction: number
    last_update: string
  }
  alerts: Array<{
    id: string
    type: "expiring" | "low_stock" | "price_change" | "demand_spike"
    severity: "high" | "medium" | "low"
    product_name: string
    message: string
    timestamp: string
    action_required: boolean
  }>
  trending_products: Array<{
    product_id: string
    name: string
    category: string
    price_change_percent: number
    demand_change_percent: number
    urgency_score: number
  }>
  performance_metrics: {
    pricing_accuracy: number
    revenue_optimization: number
    waste_reduction_rate: number
    model_confidence: number
  }
  real_time_updates: Array<{
    timestamp: string
    event_type: string
    product_name: string
    details: string
  }>
}

export class LiveDashboardClient {
  private baseUrl = "/api/live-dashboard"
  private eventListeners: Map<string, (data: any) => void> = new Map()
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false

  async getDashboardData(): Promise<LiveDashboardData> {
    try {
      const response = await fetch(this.baseUrl)
      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("[v0] Error fetching dashboard data:", error)
      throw error
    }
  }

  async getAlerts(): Promise<LiveDashboardData["alerts"]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=alerts`)
      if (!response.ok) {
        throw new Error(`Alerts API error: ${response.statusText}`)
      }
      const data = await response.json()
      return data.alerts || []
    } catch (error) {
      console.error("[v0] Error fetching alerts:", error)
      return []
    }
  }

  async getMetrics(): Promise<{
    performance_metrics: LiveDashboardData["performance_metrics"]
    overview: LiveDashboardData["overview"]
  }> {
    try {
      const response = await fetch(`${this.baseUrl}?action=metrics`)
      if (!response.ok) {
        throw new Error(`Metrics API error: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("[v0] Error fetching metrics:", error)
      throw error
    }
  }

  async getTrendingProducts(): Promise<LiveDashboardData["trending_products"]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=trending`)
      if (!response.ok) {
        throw new Error(`Trending API error: ${response.statusText}`)
      }
      const data = await response.json()
      return data.trending_products || []
    } catch (error) {
      console.error("[v0] Error fetching trending products:", error)
      return []
    }
  }

  async getRealTimeUpdates(): Promise<LiveDashboardData["real_time_updates"]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=updates`)
      if (!response.ok) {
        throw new Error(`Updates API error: ${response.statusText}`)
      }
      const data = await response.json()
      return data.real_time_updates || []
    } catch (error) {
      console.error("[v0] Error fetching real-time updates:", error)
      return []
    }
  }

  async refreshDashboard(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}?action=refresh`)
      if (!response.ok) {
        throw new Error(`Refresh API error: ${response.statusText}`)
      }
      console.log("[v0] Dashboard refreshed successfully")
    } catch (error) {
      console.error("[v0] Error refreshing dashboard:", error)
      throw error
    }
  }

  async addAlert(alert: {
    type: "expiring" | "low_stock" | "price_change" | "demand_spike"
    severity?: "high" | "medium" | "low"
    product_name: string
    message: string
    action_required?: boolean
  }): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add_alert",
          data: alert,
        }),
      })

      if (!response.ok) {
        throw new Error(`Add alert API error: ${response.statusText}`)
      }

      console.log("[v0] Alert added successfully")
    } catch (error) {
      console.error("[v0] Error adding alert:", error)
      throw error
    }
  }

  async simulatePriceUpdate(productName: string, oldPrice: number, newPrice: number): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "simulate_price_update",
          data: {
            product_name: productName,
            old_price: oldPrice,
            new_price: newPrice,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Price update API error: ${response.statusText}`)
      }

      console.log("[v0] Price update simulated successfully")
    } catch (error) {
      console.error("[v0] Error simulating price update:", error)
      throw error
    }
  }

  startPolling(intervalMs = 30000): void {
    if (this.isPolling) {
      console.log("[v0] Dashboard polling already active")
      return
    }

    this.isPolling = true
    console.log(`[v0] Starting dashboard polling every ${intervalMs}ms`)

    this.pollingInterval = setInterval(async () => {
      try {
        const data = await this.getDashboardData()
        this.notifyListeners("data_update", data)
      } catch (error) {
        console.error("[v0] Polling error:", error)
        this.notifyListeners("error", error)
      }
    }, intervalMs)
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      this.isPolling = false
      console.log("[v0] Dashboard polling stopped")
    }
  }

  addEventListener(event: string, callback: (data: any) => void): () => void {
    this.eventListeners.set(event, callback)

    // Return unsubscribe function
    return () => {
      this.eventListeners.delete(event)
    }
  }

  private notifyListeners(event: string, data: any): void {
    const listener = this.eventListeners.get(event)
    if (listener) {
      listener(data)
    }
  }

  isPollingActive(): boolean {
    return this.isPolling
  }
}

// Export singleton instance
export const liveDashboardClient = new LiveDashboardClient()
