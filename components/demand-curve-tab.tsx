"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts"
import type { ProductData, PricingRecommendation } from "@/types"

interface DemandCurveTabProps {
  productData: ProductData | undefined
  recommendation: PricingRecommendation | null
}

export default function DemandCurveTab({ productData, recommendation }: DemandCurveTabProps) {
  if (!productData || !recommendation) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Please select a product to view demand analysis.</AlertDescription>
      </Alert>
    )
  }

  // Generate demand curve data
  const demandCurveData = []
  const basePrice = recommendation.predictedPrice
  const baseDemand = productData.Sales_Volume

  for (let i = 0; i <= 50; i += 5) {
    const discountPercent = i
    const price = basePrice * (1 - discountPercent / 100)
    const demand = baseDemand * (1 + (discountPercent / 100) * 2) // Price elasticity
    const revenue = price * Math.min(demand, productData.Stock_Quantity)

    demandCurveData.push({
      discount: discountPercent,
      price: price,
      demand: Math.round(demand),
      revenue: revenue,
      isRecommended: discountPercent === recommendation.discountPercent,
    })
  }

  // Price elasticity analysis
  const elasticityData = [
    { priceChange: -20, demandChange: 40, category: "Elastic" },
    { priceChange: -15, demandChange: 28, category: "Elastic" },
    { priceChange: -10, demandChange: 18, category: "Moderate" },
    { priceChange: -5, demandChange: 8, category: "Moderate" },
    { priceChange: 0, demandChange: 0, category: "Baseline" },
    { priceChange: 5, demandChange: -6, category: "Moderate" },
    { priceChange: 10, demandChange: -12, category: "Moderate" },
    { priceChange: 15, demandChange: -20, category: "Elastic" },
  ]

  // Revenue optimization data
  const revenueData = demandCurveData.map((d) => ({
    discount: d.discount,
    revenue: d.revenue,
    isOptimal: d.revenue === Math.max(...demandCurveData.map((x) => x.revenue)),
  }))

  const optimalDiscount = revenueData.find((d) => d.isOptimal)?.discount || 0

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price Elasticity</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  High
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                </p>
                <p className="text-xs text-gray-500">Demand sensitive to price</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Optimal Discount</p>
                <p className="text-2xl font-bold text-green-600">{optimalDiscount}%</p>
                <p className="text-xs text-gray-500">Maximum revenue point</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Impact</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  +{((Math.max(...revenueData.map((d) => d.revenue)) / (basePrice * baseDemand) - 1) * 100).toFixed(1)}%
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </p>
                <p className="text-xs text-gray-500">vs. no discount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Curve */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Price-Demand Relationship</CardTitle>
            <CardDescription>How demand changes with price adjustments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="price"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "demand" ? `${value} units` : `$${Number(value).toFixed(2)}`,
                    name === "demand" ? "Demand" : "Price",
                  ]}
                  labelFormatter={(value) => `Price: $${Number(value).toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={(props) => {
                    const { payload, key, ...restProps } = props
                    return payload?.isRecommended ? (
                      <circle key={key} {...restProps} fill="#ef4444" r={6} stroke="#ef4444" strokeWidth={2} />
                    ) : (
                      <circle key={key} {...restProps} fill="#3b82f6" r={3} />
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Demand Curve</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>AI Recommendation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Optimization */}
        <Card>
          <CardHeader>
            <CardTitle>💰 Revenue Optimization</CardTitle>
            <CardDescription>Revenue potential across different discount levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="discount" tickFormatter={(value) => `${value}%`} />
                <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                  labelFormatter={(value) => `Discount: ${value}%`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>

            <Alert className="mt-4">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Optimal Strategy:</strong> A {optimalDiscount}% discount maximizes revenue at{" "}
                <strong>${Math.max(...revenueData.map((d) => d.revenue)).toFixed(2)}</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Price Elasticity Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Price Elasticity Analysis</CardTitle>
            <CardDescription>Demand sensitivity to price changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart data={elasticityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="priceChange"
                  tickFormatter={(value) => `${value}%`}
                  label={{ value: "Price Change (%)", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  label={{ value: "Demand Change (%)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name === "demandChange" ? "Demand Change" : "Price Change"]}
                />
                <Scatter
                  dataKey="demandChange"
                  fill={(entry) => {
                    if (entry?.category === "Elastic") return "#ef4444"
                    if (entry?.category === "Moderate") return "#f59e0b"
                    return "#10b981"
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Highly Elastic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Moderately Elastic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Baseline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>🏪 Competitive Analysis</CardTitle>
            <CardDescription>How your pricing compares to market averages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Your Current Price</span>
                  <span className="font-mono">${recommendation.predictedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Market Average</span>
                  <span className="font-mono">${(recommendation.predictedPrice * 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Recommended Price</span>
                  <span className="font-mono text-green-600">${recommendation.discountedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Competitive Positioning</h4>
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center">
                  {recommendation.discountedPrice < recommendation.predictedPrice * 0.9
                    ? "🏆 Price Leader"
                    : recommendation.discountedPrice < recommendation.predictedPrice
                      ? "💰 Competitive"
                      : "📈 Premium"}
                </Badge>
                <p className="text-sm text-gray-600 text-center">
                  Your recommended price is{" "}
                  <strong>
                    {((1 - recommendation.discountedPrice / (recommendation.predictedPrice * 1.15)) * 100).toFixed(1)}%
                  </strong>{" "}
                  below market average
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
