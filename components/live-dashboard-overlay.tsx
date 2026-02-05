"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Bell, TrendingUp, TrendingDown, AlertTriangle, Clock, Activity, X, Minimize2, Maximize2 } from "lucide-react"
import { liveDashboardClient, type LiveDashboardData } from "@/lib/live-dashboard-client"

interface LiveDashboardOverlayProps {
  isVisible: boolean
  onToggle: () => void
}

export default function LiveDashboardOverlay({ isVisible, onToggle }: LiveDashboardOverlayProps) {
  const [dashboardData, setDashboardData] = useState<LiveDashboardData | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")

  useEffect(() => {
    if (isVisible) {
      // Start polling for live data
      setConnectionStatus("connecting")

      const loadInitialData = async () => {
        try {
          const data = await liveDashboardClient.getDashboardData()
          setDashboardData(data)
          setLastUpdate(new Date().toLocaleTimeString())
          setConnectionStatus("connected")
        } catch (error) {
          console.error("[v0] Failed to load dashboard data:", error)
          setConnectionStatus("disconnected")
        }
      }

      loadInitialData()

      // Set up real-time updates
      liveDashboardClient.startPolling(15000) // Poll every 15 seconds

      const unsubscribe = liveDashboardClient.addEventListener("data_update", (data: LiveDashboardData) => {
        console.log("[v0] Received live dashboard update")
        setDashboardData(data)
        setLastUpdate(new Date().toLocaleTimeString())
        setConnectionStatus("connected")
      })

      const errorUnsubscribe = liveDashboardClient.addEventListener("error", (error) => {
        console.error("[v0] Dashboard polling error:", error)
        setConnectionStatus("disconnected")
      })

      return () => {
        liveDashboardClient.stopPolling()
        unsubscribe()
        errorUnsubscribe()
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === "high") return <AlertTriangle className="h-4 w-4 text-red-400" />
    if (type === "price_change") return <TrendingUp className="h-4 w-4 text-blue-400" />
    return <Bell className="h-4 w-4 text-orange-400" />
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500/50 bg-red-500/10"
      case "medium":
        return "border-orange-500/50 bg-orange-500/10"
      case "low":
        return "border-blue-500/50 bg-blue-500/10"
      default:
        return "border-gray-500/50 bg-gray-500/10"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden">
      <Card className="glow-card border-purple-500/50 bg-black/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity
                className={`h-4 w-4 ${
                  connectionStatus === "connected"
                    ? "text-green-400"
                    : connectionStatus === "connecting"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              />
              Live Dashboard
              <Badge
                className={`text-xs ${
                  connectionStatus === "connected"
                    ? "bg-green-600"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                }`}
              >
                {connectionStatus}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button onClick={onToggle} variant="ghost" size="sm" className="text-white hover:bg-white/10 h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last update: {lastUpdate}
            </p>
          )}
        </CardHeader>

        {!isMinimized && dashboardData && (
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {/* Overview Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded bg-purple-500/20">
                <p className="text-xs text-gray-300">Active Alerts</p>
                <p className="text-lg font-bold text-white">{dashboardData.overview.active_alerts}</p>
              </div>
              <div className="text-center p-2 rounded bg-green-500/20">
                <p className="text-xs text-gray-300">Revenue Impact</p>
                <p className="text-lg font-bold text-green-400">
                  ${(dashboardData.overview.revenue_impact / 1000).toFixed(1)}k
                </p>
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-400" />
                Recent Alerts ({dashboardData.alerts.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dashboardData.alerts.slice(0, 5).map((alert) => (
                  <Alert key={alert.id} className={`py-2 px-3 ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type, alert.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{alert.product_name}</p>
                        <p className="text-xs text-gray-300">{alert.message}</p>
                        {alert.action_required && (
                          <Badge className="bg-red-600 text-white text-xs mt-1">Action Required</Badge>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>

            {/* Trending Products */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Trending Products
              </h4>
              <div className="space-y-2">
                {dashboardData.trending_products.slice(0, 3).map((product) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between p-2 rounded bg-gray-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p
                          className={`text-xs font-medium ${
                            product.price_change_percent > 0 ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {product.price_change_percent > 0 ? "+" : ""}
                          {product.price_change_percent.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400">price</p>
                      </div>
                      {product.price_change_percent > 0 ? (
                        <TrendingUp className="h-3 w-3 text-red-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Updates */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                Live Updates
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {dashboardData.real_time_updates.slice(0, 5).map((update, index) => (
                  <div key={index} className="text-xs p-2 rounded bg-gray-800/30">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 truncate">{update.details}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-400">Model Accuracy</p>
                <p className="text-sm font-bold text-white">
                  {dashboardData.performance_metrics.pricing_accuracy.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Waste Reduction</p>
                <p className="text-sm font-bold text-green-400">
                  {dashboardData.performance_metrics.waste_reduction_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
