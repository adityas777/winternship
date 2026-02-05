"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Leaf, Droplets, Recycle, TrendingDown, AlertTriangle, Award, Globe } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { ProductData, PricingRecommendation } from "@/types"

interface SustainabilityTabProps {
  recommendation: PricingRecommendation | null
  productData: ProductData | undefined
}

export default function SustainabilityTab({ recommendation, productData }: SustainabilityTabProps) {
  if (!recommendation || !productData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Please select a product to view sustainability impact.</AlertDescription>
      </Alert>
    )
  }

  // Calculate sustainability metrics
  const wasteReductionKg = recommendation.wasteReduction * 0.5 // Assume 0.5kg per unit
  const waterSavedLiters = wasteReductionKg * 822 // Water footprint per kg of food
  const co2SavedKg = wasteReductionKg * 2.5 // CO2 equivalent per kg of food waste
  const costSavings = recommendation.wasteReduction * productData.Unit_Price * 0.3 // Cost of waste disposal

  // Environmental impact data
  const impactData = [
    { category: "Food Waste", before: 15, after: 15 - wasteReductionKg, unit: "kg" },
    { category: "Water Usage", before: 12330, after: 12330 - waterSavedLiters, unit: "L" },
    { category: "CO₂ Emissions", before: 37.5, after: 37.5 - co2SavedKg, unit: "kg" },
    { category: "Disposal Cost", before: 45, after: 45 - costSavings, unit: "$" },
  ]

  // Waste breakdown
  const wasteBreakdown = [
    { name: "Prevented", value: recommendation.wasteReduction, color: "#10b981" },
    {
      name: "Remaining",
      value: Math.max(0, productData.Stock_Quantity - productData.Sales_Volume - recommendation.wasteReduction),
      color: "#ef4444",
    },
  ]

  // SDG alignment
  const sdgGoals = [
    { goal: "Zero Hunger", progress: 85, description: "Reducing food waste" },
    { goal: "Responsible Consumption", progress: 92, description: "Optimizing resource use" },
    { goal: "Climate Action", progress: 78, description: "Reducing emissions" },
    { goal: "Life on Land", progress: 70, description: "Preserving ecosystems" },
  ]

  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Food Waste Saved</p>
                <p className="text-2xl font-bold text-green-600">{wasteReductionKg.toFixed(1)} kg</p>
                <p className="text-xs text-gray-500">Per week</p>
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Water Saved</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(waterSavedLiters)} L</p>
                <p className="text-xs text-gray-500">Water footprint</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CO₂ Reduced</p>
                <p className="text-2xl font-bold text-purple-600">{co2SavedKg.toFixed(1)} kg</p>
                <p className="text-xs text-gray-500">Carbon equivalent</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost Savings</p>
                <p className="text-2xl font-bold text-orange-600">${costSavings.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Disposal costs</p>
              </div>
              <Recycle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Impact Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              Environmental Impact Reduction
            </CardTitle>
            <CardDescription>Before vs. after implementing smart pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)} ${impactData.find((d) => d.category)?.unit || ""}`,
                    name === "before" ? "Before" : "After",
                  ]}
                />
                <Bar dataKey="before" fill="#ef4444" name="before" />
                <Bar dataKey="after" fill="#10b981" name="after" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Before Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>After Optimization</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waste Prevention Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>🗑️ Waste Prevention Analysis</CardTitle>
            <CardDescription>Breakdown of waste prevented vs. remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={wasteBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {wasteBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} units`, "Quantity"]} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {wasteBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} units</span>
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <Award className="h-4 w-4" />
              <AlertDescription>
                <strong>Achievement:</strong>{" "}
                {((recommendation.wasteReduction / productData.Stock_Quantity) * 100).toFixed(1)}% waste reduction
                through smart pricing!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* SDG Alignment */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🎯 UN Sustainable Development Goals Alignment</CardTitle>
            <CardDescription>How your smart pricing contributes to global sustainability goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sdgGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">{goal.goal}</h4>
                    <Badge variant="outline">{goal.progress}%</Badge>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <p className="text-xs text-gray-600">{goal.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🌍 Global Impact Potential</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">If scaled globally:</p>
                  <p className="text-green-700">{(wasteReductionKg * 1000000).toLocaleString()} tons food saved</p>
                </div>
                <div>
                  <p className="font-medium">Water conservation:</p>
                  <p className="text-blue-700">{(waterSavedLiters * 1000000).toLocaleString()} liters saved</p>
                </div>
                <div>
                  <p className="font-medium">Emission reduction:</p>
                  <p className="text-purple-700">{(co2SavedKg * 1000000).toLocaleString()} tons CO₂</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability Certification */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Sustainability Achievements</CardTitle>
          <CardDescription>Certifications and recognitions for your environmental efforts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold">Waste Warrior</h4>
              <p className="text-sm text-gray-600">Reduced waste by 25%+</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Leaf className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold">Eco Champion</h4>
              <p className="text-sm text-gray-600">Carbon footprint reduction</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold">SDG Contributor</h4>
              <p className="text-sm text-gray-600">Supporting global goals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
