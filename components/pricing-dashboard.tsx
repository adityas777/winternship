"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Calendar, Package2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import type { ProductData, PricingRecommendation } from "@/types"

interface PricingDashboardProps {
  recommendation: PricingRecommendation | null
  productData: ProductData | undefined
  loading: boolean
}

export default function PricingDashboard({ recommendation, productData, loading }: PricingDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glow-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-600 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!recommendation || !productData) {
    return (
      <Alert className="glow-card border-orange-500/50">
        <AlertTriangle className="h-4 w-4 text-orange-400" />
        <AlertDescription className="text-gray-100">
          Please select a product to view pricing recommendations.
        </AlertDescription>
      </Alert>
    )
  }

  const urgencyLevel = productData.Days_to_Expiry <= 2 ? "high" : productData.Days_to_Expiry <= 5 ? "medium" : "low"

  // Generate realistic price history based on actual product data
  const generatePriceHistory = () => {
    const basePrice = productData.Unit_Price
    const currentDiscount = recommendation.discountPercent
    const history = []

    for (let day = 1; day <= 5; day++) {
      const daysToExpiry = Math.max(0, productData.Days_to_Expiry - (day - 1))
      let dayDiscount = 0

      // Progressive discount logic based on expiry
      if (daysToExpiry <= 1) dayDiscount = Math.min(currentDiscount + 10, 40)
      else if (daysToExpiry <= 2) dayDiscount = Math.min(currentDiscount + 5, 35)
      else if (daysToExpiry <= 3) dayDiscount = currentDiscount
      else if (daysToExpiry <= 5) dayDiscount = Math.max(currentDiscount - 5, 0)
      else dayDiscount = Math.max(currentDiscount - 10, 0)

      const price = basePrice * (1 - dayDiscount / 100)
      history.push({ day, price, discount: dayDiscount })
    }

    return history
  }

  // Generate demand response based on category and price sensitivity
  const generateDemandData = () => {
    const baseDemand = productData.Sales_Volume
    const category = productData.Catagory?.toLowerCase() || ""

    // Category-specific price elasticity
    let elasticity = 1.0
    if (category.includes("luxury") || category.includes("premium")) elasticity = 1.5
    else if (category.includes("dairy") || category.includes("bread")) elasticity = 0.8
    else if (category.includes("meat") || category.includes("seafood")) elasticity = 1.2

    const demandData = []
    for (let discount = 0; discount <= 30; discount += 10) {
      const demandIncrease = (discount / 100) * elasticity
      const demand = Math.round(baseDemand * (1 + demandIncrease))
      demandData.push({ discount, demand })
    }

    return demandData
  }

  const priceHistoryData = generatePriceHistory()
  const demandData = generateDemandData()

  // Calculate revenue impact
  const originalRevenue = productData.Unit_Price * productData.Sales_Volume
  const revenueImpact =
    recommendation.estimatedRevenue != null
      ? ((recommendation.estimatedRevenue / originalRevenue - 1) * 100).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-6">
      {/* Product Overview */}
      <Card
        className={`glow-card ${urgencyLevel === "high" ? "priority-high" : urgencyLevel === "medium" ? "priority-medium" : "priority-low"}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-purple-400" />
              {productData.Product_Name}
            </span>
            <Badge
              className={`${
                urgencyLevel === "high"
                  ? "bg-red-600 text-white"
                  : urgencyLevel === "medium"
                    ? "bg-orange-600 text-white"
                    : "bg-green-600 text-white"
              }`}
            >
              {urgencyLevel.toUpperCase()} PRIORITY
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-100">
            {productData.Catagory} • Supplier: {productData.Supplier_Name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-100">Days to Expiry</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                {productData.Days_to_Expiry}
                <Calendar className="h-4 w-4 text-gray-400" />
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-100">Stock Quantity</p>
              <p className="text-2xl font-bold text-white">{productData.Stock_Quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-100">Weekly Sales</p>
              <p className="text-2xl font-bold text-white">{productData.Sales_Volume}</p>
            </div>
            <div>
              <p className="text-sm text-gray-100">Turnover Rate</p>
              <p className="text-2xl font-bold text-white">{(productData.Turnover_Rate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Recommendation */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-white">💡 AI Pricing Recommendation</CardTitle>
            <CardDescription className="text-gray-100">
              ML model prediction with Q-learning optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-100">Original Price:</span>
                <span className="font-mono text-white">${productData.Unit_Price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-100">AI Predicted Price:</span>
                <p className="text-2xl font-bold text-white">
                  ${recommendation.predictedPrice != null ? recommendation.predictedPrice.toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-100">Recommended Discount:</span>
                <span className="font-mono text-orange-400">{recommendation.discountPercent}%</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-white">Final Price:</span>
                <p className="text-2xl font-bold text-green-300">
                  ${recommendation.discountedPrice != null ? recommendation.discountedPrice.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-600">
              <div className="flex justify-between mb-2">
                <span className="text-white">Expected Revenue:</span>
                <p className="text-2xl font-bold text-white">
                  ${recommendation.estimatedRevenue != null ? recommendation.estimatedRevenue.toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white">Revenue Impact:</span>
                <span
                  className={`font-mono ${Number.parseFloat(revenueImpact) >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {Number.parseFloat(revenueImpact) >= 0 ? "+" : ""}
                  {revenueImpact}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Waste Reduction:</span>
                <p className="text-2xl font-bold text-green-300">
                  {recommendation.wasteReduction != null ? recommendation.wasteReduction.toFixed(0) : "0"} units
                </p>
              </div>
            </div>

            <Alert className="glow-card border-green-500/50">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-gray-100 text-sm">{recommendation.reasoning}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Price Trend Chart */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-white">📈 Price Optimization Timeline</CardTitle>
            <CardDescription className="text-gray-100">Projected price changes over the next 5 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={priceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#fff" />
                  <YAxis stroke="#fff" tickFormatter={(value) => `$${value.toFixed(2)}`} />
                  <Tooltip
                    formatter={(value, name) => [`$${Number(value).toFixed(2)}`, "Price"]}
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(102,126,234,0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={{ fill: "#667eea", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Demand Response */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-white">📊 Demand vs Discount Analysis</CardTitle>
            <CardDescription className="text-gray-100">Category-specific demand response to pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="discount" stroke="#fff" tickFormatter={(value) => `${value}%`} />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    formatter={(value) => [`${value} units`, "Demand"]}
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(102,126,234,0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="demand" fill="#10b981">
                    {demandData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.discount === recommendation.discountPercent ? "#f59e0b" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Model Confidence */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-white">🎯 Model Performance</CardTitle>
            <CardDescription className="text-gray-100">Confidence metrics for this recommendation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-100">Overall Confidence</span>
                <span className="text-white">{(recommendation.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="progress-glow">
                <Progress value={recommendation.confidence * 100} className="h-2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-100">Data Quality Score</span>
                <span className="text-white">
                  {Math.min(100, productData.Sales_Volume + productData.Inventory_Turnover_Rate).toFixed(0)}%
                </span>
              </div>
              <div className="progress-glow">
                <Progress
                  value={Math.min(100, productData.Sales_Volume + productData.Inventory_Turnover_Rate)}
                  className="h-2"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-100">Time Sensitivity</span>
                <span className="text-white">
                  {productData.Days_to_Expiry <= 3 ? "High" : productData.Days_to_Expiry <= 7 ? "Medium" : "Low"}
                </span>
              </div>
              <div className="progress-glow">
                <Progress
                  value={productData.Days_to_Expiry <= 3 ? 90 : productData.Days_to_Expiry <= 7 ? 60 : 30}
                  className="h-2"
                />
              </div>
            </div>

            <div className="pt-2 text-sm text-gray-400">
              <p>Analysis based on real CSV data: {productData.Product_Name}</p>
              <p>
                Category: {productData.Catagory} • Stock: {productData.Stock_Quantity} units
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
