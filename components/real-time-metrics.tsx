"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Activity } from "lucide-react"

interface RealTimeMetricsProps {
  productName?: string
  className?: string
}

interface MetricData {
  current_price: number
  recommended_price: number
  price_change: number
  confidence: number
  demand_forecast: number
  stock_velocity: number
  last_update: string
}

export default function RealTimeMetrics({ productName, className = "" }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<MetricData | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (!productName) return

    // Simulate real-time metrics updates
    const updateMetrics = () => {
      const basePrice = 5.99
      const variation = (Math.random() - 0.5) * 0.5 // ±$0.25 variation
      const currentPrice = basePrice + variation
      const recommendedPrice = currentPrice * (0.85 + Math.random() * 0.3) // 85-115% of current

      setMetrics({
        current_price: currentPrice,
        recommended_price: recommendedPrice,
        price_change: recommendedPrice - currentPrice,
        confidence: 0.8 + Math.random() * 0.15, // 80-95%
        demand_forecast: 50 + Math.random() * 100, // 50-150 units
        stock_velocity: Math.random() * 20, // 0-20 units/hour
        last_update: new Date().toISOString(),
      })

      setLastUpdate(new Date())
      setIsLive(true)

      // Flash effect
      setTimeout(() => setIsLive(false), 1000)
    }

    // Initial load
    updateMetrics()

    // Update every 8-12 seconds with some randomness
    const interval = setInterval(updateMetrics, 8000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [productName])

  if (!metrics || !productName) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="metric-card animate-pulse">
            <CardContent className="p-3">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-600 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const priceChangePercent = (metrics.price_change / metrics.current_price) * 100
  const isPositiveChange = metrics.price_change > 0

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {/* Current Price */}
      <Card
        className={`metric-card transition-all duration-300 ${isLive ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-100 flex items-center gap-1">
                Current Price
                {isLive && <Activity className="h-3 w-3 text-blue-400 animate-pulse" />}
              </p>
              <p className="text-lg font-bold text-white">${metrics.current_price.toFixed(2)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      {/* Recommended Price */}
      <Card
        className={`metric-card transition-all duration-300 ${isLive ? "ring-2 ring-green-400 ring-opacity-50" : ""}`}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-100">Recommended</p>
              <p className="text-lg font-bold text-green-400">${metrics.recommended_price.toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-1">
                {isPositiveChange ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs ${isPositiveChange ? "text-green-400" : "text-red-400"}`}>
                  {isPositiveChange ? "+" : ""}
                  {priceChangePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demand Forecast */}
      <Card
        className={`metric-card transition-all duration-300 ${isLive ? "ring-2 ring-purple-400 ring-opacity-50" : ""}`}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-100">Demand Forecast</p>
              <p className="text-lg font-bold text-white">{Math.round(metrics.demand_forecast)}</p>
              <p className="text-xs text-gray-400">units/day</p>
            </div>
            <Package className="h-6 w-6 text-purple-400" />
          </div>
        </CardContent>
      </Card>

      {/* Model Confidence */}
      <Card
        className={`metric-card transition-all duration-300 ${isLive ? "ring-2 ring-orange-400 ring-opacity-50" : ""}`}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-100">Confidence</p>
              <p className="text-lg font-bold text-white">{(metrics.confidence * 100).toFixed(0)}%</p>
              <Badge
                className={`text-xs mt-1 ${
                  metrics.confidence > 0.9 ? "bg-green-600" : metrics.confidence > 0.8 ? "bg-yellow-600" : "bg-red-600"
                }`}
              >
                {metrics.confidence > 0.9 ? "High" : metrics.confidence > 0.8 ? "Medium" : "Low"}
              </Badge>
            </div>
            {metrics.confidence > 0.8 ? (
              <TrendingUp className="h-6 w-6 text-green-400" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-orange-400" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
