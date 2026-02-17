import { NextResponse } from "next/server"
import { vectorSearchClient } from "@/lib/vector-search-client"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

interface LiveDashboardData {
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

class LiveDashboardService {
  private static instance: LiveDashboardService
  private dashboardData: LiveDashboardData
  private lastUpdate: Date
  private updateInterval: NodeJS.Timeout | null = null

  static getInstance(): LiveDashboardService {
    if (!LiveDashboardService.instance) {
      LiveDashboardService.instance = new LiveDashboardService()
    }
    return LiveDashboardService.instance
  }

  constructor() {
    this.lastUpdate = new Date()
    this.dashboardData = this.initializeDashboardData()
    // this.startRealTimeUpdates()
  }

  private initializeDashboardData(): LiveDashboardData {
    return {
      overview: {
        total_products: 0,
        active_alerts: 0,
        revenue_impact: 0,
        waste_reduction: 0,
        last_update: new Date().toISOString(),
      },
      alerts: [],
      trending_products: [],
      performance_metrics: {
        pricing_accuracy: 87.5,
        revenue_optimization: 12.3,
        waste_reduction_rate: 23.8,
        model_confidence: 89.2,
      },
      real_time_updates: [],
    }
  }

  private startRealTimeUpdates(): void {
    // Update dashboard data every 30 seconds
    this.updateInterval = setInterval(() => {
      this.refreshDashboardData()
    }, 30000)

    // Initial data load
    this.refreshDashboardData()
  }

  private async refreshDashboardData(): Promise<void> {
    try {
      console.log("[v0] Refreshing live dashboard data...")

      // Get analytics from vector store
      const analytics = await vectorSearchClient.getAnalytics()

      // Get expiring products
      const expiringProducts = await vectorSearchClient.getExpiringProducts(7)

      // Get low stock products
      const lowStockProducts = await vectorSearchClient.getLowStockProducts(20)

      // Update overview
      this.dashboardData.overview = {
        total_products: analytics?.total_products || 15,
        active_alerts: expiringProducts.length + lowStockProducts.length,
        revenue_impact: this.calculateRevenueImpact(),
        waste_reduction: this.calculateWasteReduction(),
        last_update: new Date().toISOString(),
      }

      // Generate alerts
      this.dashboardData.alerts = this.generateAlerts(expiringProducts, lowStockProducts)

      // Generate trending products
      this.dashboardData.trending_products = this.generateTrendingProducts()

      // Update performance metrics with some variation
      this.updatePerformanceMetrics()

      // Add real-time update event
      this.addRealTimeUpdate("dashboard_refresh", "System", "Dashboard data refreshed successfully")

      this.lastUpdate = new Date()
      console.log("[v0] Dashboard data refreshed at", this.lastUpdate.toISOString())
    } catch (error) {
      console.error("[v0] Error refreshing dashboard data:", error)
      this.addRealTimeUpdate("error", "System", "Failed to refresh dashboard data")
    }
  }

  private generateAlerts(expiringProducts: any[], lowStockProducts: any[]): LiveDashboardData["alerts"] {
    const alerts: LiveDashboardData["alerts"] = []

    // Expiring product alerts
    expiringProducts.forEach((product, index) => {
      const daysToExpiry = product.days_to_expiry || 0
      alerts.push({
        id: `expiring_${product.product_id || index}`,
        type: "expiring",
        severity: daysToExpiry <= 2 ? "high" : daysToExpiry <= 5 ? "medium" : "low",
        product_name: product.name || "Unknown Product",
        message: `Expires in ${daysToExpiry} day${daysToExpiry !== 1 ? "s" : ""}`,
        timestamp: new Date().toISOString(),
        action_required: daysToExpiry <= 3,
      })
    })

    // Low stock alerts
    lowStockProducts.forEach((product, index) => {
      const stockLeft = product.stock_left || 0
      alerts.push({
        id: `low_stock_${product.product_id || index}`,
        type: "low_stock",
        severity: stockLeft < 10 ? "high" : stockLeft < 20 ? "medium" : "low",
        product_name: product.name || "Unknown Product",
        message: `Only ${stockLeft} units remaining`,
        timestamp: new Date().toISOString(),
        action_required: stockLeft < 15,
      })
    })

    // Simulate price change alerts
    if (Math.random() > 0.7) {
      alerts.push({
        id: `price_change_${Date.now()}`,
        type: "price_change",
        severity: "medium",
        product_name: this.getRandomProductName(),
        message: "Significant price adjustment recommended",
        timestamp: new Date().toISOString(),
        action_required: true,
      })
    }

    // Simulate demand spike alerts
    if (Math.random() > 0.8) {
      alerts.push({
        id: `demand_spike_${Date.now()}`,
        type: "demand_spike",
        severity: "low",
        product_name: this.getRandomProductName(),
        message: "Unusual demand pattern detected",
        timestamp: new Date().toISOString(),
        action_required: false,
      })
    }

    return alerts.slice(0, 10) // Limit to 10 most recent alerts
  }

  private generateTrendingProducts(): LiveDashboardData["trending_products"] {
    const mockProducts = [
      "Organic Bananas",
      "Greek Yogurt",
      "Fresh Salmon Fillet",
      "Strawberries",
      "Whole Wheat Bread",
      "Premium Ground Coffee",
    ]

    return mockProducts.slice(0, 5).map((name, index) => ({
      product_id: `trending_${index}`,
      name,
      category: this.getCategoryForProduct(name),
      price_change_percent: (Math.random() - 0.5) * 30, // -15% to +15%
      demand_change_percent: Math.random() * 40 - 10, // -10% to +30%
      urgency_score: Math.random(),
    }))
  }

  private updatePerformanceMetrics(): void {
    // Add small random variations to simulate real-time changes
    const variation = () => (Math.random() - 0.5) * 2 // ±1%

    this.dashboardData.performance_metrics = {
      pricing_accuracy: Math.max(80, Math.min(95, 87.5 + variation())),
      revenue_optimization: Math.max(8, Math.min(20, 12.3 + variation())),
      waste_reduction_rate: Math.max(15, Math.min(35, 23.8 + variation())),
      model_confidence: Math.max(85, Math.min(95, 89.2 + variation())),
    }
  }

  private calculateRevenueImpact(): number {
    // Simulate revenue impact calculation
    const baseRevenue = 50000 // Mock base revenue
    const optimizationRate = this.dashboardData.performance_metrics.revenue_optimization / 100
    return Math.round(baseRevenue * optimizationRate)
  }

  private calculateWasteReduction(): number {
    // Simulate waste reduction calculation
    const totalUnits = 1000 // Mock total units
    const reductionRate = this.dashboardData.performance_metrics.waste_reduction_rate / 100
    return Math.round(totalUnits * reductionRate)
  }

  private addRealTimeUpdate(eventType: string, productName: string, details: string): void {
    const update = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      product_name: productName,
      details,
    }

    this.dashboardData.real_time_updates.unshift(update)

    // Keep only the last 20 updates
    if (this.dashboardData.real_time_updates.length > 20) {
      this.dashboardData.real_time_updates = this.dashboardData.real_time_updates.slice(0, 20)
    }
  }

  private getRandomProductName(): string {
    const products = [
      "Organic Bananas",
      "Greek Yogurt",
      "Fresh Salmon Fillet",
      "Strawberries",
      "Whole Wheat Bread",
      "Premium Ground Coffee",
      "Organic Spinach",
      "Aged Cheddar Cheese",
    ]
    return products[Math.floor(Math.random() * products.length)]
  }

  private getCategoryForProduct(productName: string): string {
    const categoryMap: Record<string, string> = {
      "Organic Bananas": "Fruits & Vegetables",
      "Greek Yogurt": "Dairy",
      "Fresh Salmon Fillet": "Seafood",
      Strawberries: "Fruits & Vegetables",
      "Whole Wheat Bread": "Bakery",
      "Premium Ground Coffee": "Beverages",
    }
    return categoryMap[productName] || "Unknown"
  }

  public getDashboardData(): LiveDashboardData {
    return { ...this.dashboardData }
  }

  public getLastUpdateTime(): Date {
    return this.lastUpdate
  }

  public forceRefresh(): Promise<void> {
    return this.refreshDashboardData()
  }

  public addCustomAlert(alert: Omit<LiveDashboardData["alerts"][0], "id" | "timestamp">): void {
    const newAlert = {
      ...alert,
      id: `custom_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    this.dashboardData.alerts.unshift(newAlert)
    this.addRealTimeUpdate("alert_created", alert.product_name, `New ${alert.type} alert created`)
  }

  public simulatePriceUpdate(productName: string, oldPrice: number, newPrice: number): void {
    const changePercent = ((newPrice - oldPrice) / oldPrice) * 100
    const details = `Price ${changePercent > 0 ? "increased" : "decreased"} by ${Math.abs(changePercent).toFixed(1)}%`

    this.addRealTimeUpdate("price_update", productName, details)

    // Update performance metrics
    this.dashboardData.performance_metrics.pricing_accuracy += Math.random() * 0.5 - 0.25
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}

// Global dashboard service instance
const dashboardService = LiveDashboardService.getInstance()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "refresh":
        await dashboardService.forceRefresh()
        return NextResponse.json({
          message: "Dashboard data refreshed",
          last_update: dashboardService.getLastUpdateTime(),
        })

      case "alerts":
        const data = dashboardService.getDashboardData()
        return NextResponse.json({
          alerts: data.alerts,
          count: data.alerts.length,
        })

      case "metrics":
        const metricsData = dashboardService.getDashboardData()
        return NextResponse.json({
          performance_metrics: metricsData.performance_metrics,
          overview: metricsData.overview,
        })

      case "trending":
        const trendingData = dashboardService.getDashboardData()
        return NextResponse.json({
          trending_products: trendingData.trending_products,
        })

      case "updates":
        const updatesData = dashboardService.getDashboardData()
        return NextResponse.json({
          real_time_updates: updatesData.real_time_updates.slice(0, 10),
        })

      default:
        await dashboardService.forceRefresh()
        const fullData = dashboardService.getDashboardData()
        return NextResponse.json(fullData)
    }
  } catch (error) {
    console.error("Live dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case "add_alert":
        if (!data || !data.type || !data.product_name || !data.message) {
          return NextResponse.json({ error: "Invalid alert data" }, { status: 400 })
        }

        dashboardService.addCustomAlert({
          type: data.type,
          severity: data.severity || "medium",
          product_name: data.product_name,
          message: data.message,
          action_required: data.action_required || false,
        })

        return NextResponse.json({ message: "Alert added successfully" })

      case "simulate_price_update":
        if (!data || !data.product_name || !data.old_price || !data.new_price) {
          return NextResponse.json({ error: "Invalid price update data" }, { status: 400 })
        }

        dashboardService.simulatePriceUpdate(data.product_name, data.old_price, data.new_price)

        return NextResponse.json({ message: "Price update simulated" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Live dashboard POST error:", error)
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}
