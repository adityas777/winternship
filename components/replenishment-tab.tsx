"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Package, AlertTriangle, CheckCircle, Truck, Calendar, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import type { ProductData, PricingRecommendation } from "@/types"

interface ReplenishmentTabProps {
  productData: ProductData | undefined
  recommendation: PricingRecommendation | null
}

export default function ReplenishmentTab({ productData, recommendation }: ReplenishmentTabProps) {
  if (!productData || !recommendation) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Please select a product to view replenishment recommendations.</AlertDescription>
      </Alert>
    )
  }

  const reorderPoint = Math.max(productData.Sales_Volume * 2, productData.Reorder_Level)
  const shouldReorder = productData.Stock_Quantity <= reorderPoint
  const daysUntilStockout = Math.floor(productData.Stock_Quantity / Math.max(productData.Sales_Volume, 1))

  // Mock historical sales data
  const salesHistory = [
    { week: "Week 1", sales: productData.Sales_Volume * 0.8 },
    { week: "Week 2", sales: productData.Sales_Volume * 1.1 },
    { week: "Week 3", sales: productData.Sales_Volume * 0.9 },
    { week: "Week 4", sales: productData.Sales_Volume },
    { week: "Week 5", sales: productData.Sales_Volume * 1.2 },
  ]

  const inventoryProjection = [
    { day: 0, stock: productData.Stock_Quantity },
    { day: 1, stock: Math.max(0, productData.Stock_Quantity - productData.Sales_Volume) },
    { day: 2, stock: Math.max(0, productData.Stock_Quantity - productData.Sales_Volume * 2) },
    { day: 3, stock: Math.max(0, productData.Stock_Quantity - productData.Sales_Volume * 3) },
    { day: 4, stock: Math.max(0, productData.Stock_Quantity - productData.Sales_Volume * 4) },
    { day: 5, stock: Math.max(0, productData.Stock_Quantity - productData.Sales_Volume * 5) },
  ]

  return (
    <div className="space-y-6">
      {/* Replenishment Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reorder Status</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {shouldReorder ? (
                    <>
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                      <span className="text-red-600">REORDER NOW</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="text-green-600">SUFFICIENT</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Until Stockout</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {daysUntilStockout}
                  <Calendar className="h-5 w-5 text-gray-400" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recommended Order</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {productData.Reorder_Quantity}
                  <Package className="h-5 w-5 text-blue-500" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Inventory Analysis
            </CardTitle>
            <CardDescription>Current stock levels and reorder recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Current Stock</span>
                  <span className="font-mono">{productData.Stock_Quantity} units</span>
                </div>
                <Progress
                  value={
                    (productData.Stock_Quantity / (productData.Stock_Quantity + productData.Reorder_Quantity)) * 100
                  }
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Reorder Point</span>
                  <span className="font-mono">{reorderPoint} units</span>
                </div>
                <Progress value={(reorderPoint / productData.Stock_Quantity) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Safety Stock</span>
                  <span className="font-mono">{Math.floor(productData.Sales_Volume * 0.5)} units</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Replenishment Recommendation</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Supplier:</span>
                  <span className="font-medium">{productData.Supplier_Name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Quantity:</span>
                  <span className="font-medium">{productData.Reorder_Quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Cost:</span>
                  <span className="font-medium">
                    ${(productData.Unit_Price * productData.Reorder_Quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lead Time:</span>
                  <span className="font-medium">3-5 days</span>
                </div>
              </div>
            </div>

            {shouldReorder && (
              <Button className="w-full" size="lg">
                <Truck className="h-4 w-4 mr-2" />
                Place Reorder Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Sales Trend Analysis</CardTitle>
            <CardDescription>Historical sales performance over the last 5 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} units`, "Sales"]} />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Average Weekly Sales</p>
                <p className="font-bold">{productData.Sales_Volume} units</p>
              </div>
              <div>
                <p className="text-gray-600">Sales Velocity</p>
                <p className="font-bold">{(productData.Sales_Volume / 7).toFixed(1)} units/day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Projection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>📊 Inventory Projection</CardTitle>
            <CardDescription>
              Projected stock levels over the next 5 days based on current sales velocity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={inventoryProjection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} units`, "Stock"]} />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {daysUntilStockout <= 3 ? (
                  <span className="text-red-600">
                    <strong>Critical:</strong> Stock will run out in {daysUntilStockout} days at current sales rate.
                  </span>
                ) : (
                  <span className="text-green-600">
                    <strong>Good:</strong> Current stock should last {daysUntilStockout} days at current sales rate.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
