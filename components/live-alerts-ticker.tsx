"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown, Package, Clock, Bell } from "lucide-react"
import { liveDashboardClient } from "@/lib/live-dashboard-client"

interface Alert {
  id: string
  type: "expiring" | "low_stock" | "price_change" | "demand_spike"
  severity: "high" | "medium" | "low"
  product_name: string
  message: string
  timestamp: string
}

export default function LiveAlertsTicker() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alertsData = await liveDashboardClient.getAlerts()
        setAlerts(alertsData.filter((alert) => alert.severity === "high" || alert.action_required))
        setIsVisible(alertsData.length > 0)
      } catch (error) {
        console.error("[v0] Failed to load alerts:", error)
      }
    }

    loadAlerts()

    // Refresh alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (alerts.length > 1) {
      const ticker = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % alerts.length)
      }, 4000) // Change alert every 4 seconds

      return () => clearInterval(ticker)
    }
  }, [alerts.length])

  if (!isVisible || alerts.length === 0) return null

  const currentAlert = alerts[currentIndex]
  if (!currentAlert) return null

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "expiring":
        return <Clock className="h-4 w-4" />
      case "low_stock":
        return <Package className="h-4 w-4" />
      case "price_change":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-600 border-red-500"
      case "medium":
        return "bg-orange-600 border-orange-500"
      case "low":
        return "bg-blue-600 border-blue-500"
      default:
        return "bg-gray-600 border-gray-500"
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center">
      <div
        className={`
        flex items-center gap-3 px-4 py-2 rounded-lg border-2 
        ${getAlertColor(currentAlert.severity)} 
        text-white shadow-lg backdrop-blur-sm
        animate-in slide-in-from-bottom-2 duration-300
      `}
      >
        <div className="flex items-center gap-2">
          {getAlertIcon(currentAlert.type)}
          <AlertTriangle className="h-4 w-4 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{currentAlert.product_name}</span>
            <Badge variant="secondary" className="text-xs">
              {currentAlert.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs opacity-90 truncate">{currentAlert.message}</p>
        </div>

        {alerts.length > 1 && (
          <div className="flex items-center gap-1">
            {alerts.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-xs opacity-75">{new Date(currentAlert.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
