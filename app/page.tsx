"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Package,
  Download,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Upload,
  Camera,
  Activity,
} from "lucide-react"
import PricingDashboard from "@/components/pricing-dashboard"
import ReplenishmentTab from "@/components/replenishment-tab"
import DemandCurveTab from "@/components/demand-curve-tab"
import SustainabilityTab from "@/components/sustainability-tab"
import DataUploadTab from "@/components/data-upload-tab"
import IndiaMapSection from "@/components/india-map-section"
import type { ProductData, PricingRecommendation } from "@/types"
import CameraDetectionTab from "@/components/camera-detection-tab"
import LiveDashboardOverlay from "@/components/live-dashboard-overlay"
import RealTimeMetrics from "@/components/real-time-metrics"
import LiveAlertsTicker from "@/components/live-alerts-ticker"

export default function SmartPricingApp() {
  // Ensure products is always initialized as an array
  const [products, setProducts] = useState<ProductData[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentDay, setCurrentDay] = useState(1)
  const [useCustomData, setUseCustomData] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [dataStatus, setDataStatus] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectKey, setSelectKey] = useState(0) // Key to force re-render of Select component
  const [showLiveDashboard, setShowLiveDashboard] = useState(false) // Add state for live dashboard overlay

  // Ref to track if products have been loaded
  const productsLoadedRef = useRef(false)
  const dataSourceChangingRef = useRef(false)

  // Safe setter for products that ensures it's always an array
  const setProductsSafely = (data: any) => {
    if (Array.isArray(data)) {
      console.log("Setting products:", data.length, "items")
      setProducts(data)

      // Reset selected product when data source changes
      if (data.length > 0) {
        setSelectedProduct(data[0].Product_Name)
      } else {
        setSelectedProduct("")
      }

      // Force re-render of Select component
      setSelectKey((prev) => prev + 1)

      // Mark products as loaded
      productsLoadedRef.current = true
      dataSourceChangingRef.current = false
    } else {
      console.error("Attempted to set products with non-array:", typeof data, data)
      setProducts([])
      setSelectedProduct("")
      productsLoadedRef.current = false
      dataSourceChangingRef.current = false
    }
  }

  // Check data status function
  const checkDataStatus = async () => {
    try {
      const response = await fetch("/api/data-status")
      if (response.ok) {
        const status = await response.json()
        setDataStatus(status)
        console.log("Data status:", status)

        // Auto-switch to custom data if available and not already using it
        if (status.hasCustomData && !useCustomData) {
          setUseCustomData(true)
        }
      }
    } catch (error) {
      console.error("Error checking data status:", error)
    }
  }

  useEffect(() => {
    checkDataStatus()
  }, [])

  useEffect(() => {
    // Reset products loaded flag when data source changes
    productsLoadedRef.current = false
    dataSourceChangingRef.current = true
    setRecommendation(null) // Clear recommendation when data source changes
    loadProducts()
  }, [useCustomData])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setDataError(null)
      const endpoint = useCustomData ? "/api/products/custom" : "/api/products"
      console.log("Loading products from:", endpoint)

      const response = await fetch(endpoint)
      const data = await response.json()

      console.log("API Response:", { ok: response.ok, data: typeof data, isArray: Array.isArray(data) })

      // Check if the response is an error
      if (!response.ok || data.error) {
        const errorMessage = data.error || "Failed to load products"
        console.error("API Error:", errorMessage)
        setDataError(errorMessage)
        setProductsSafely([])

        // Auto-fallback to demo data if custom data fails
        if (useCustomData) {
          console.log("Custom data failed, falling back to demo data")
          setUseCustomData(false)
          return
        }
        return
      }

      // Ensure data is an array and set it safely
      if (Array.isArray(data) && data.length > 0) {
        setProductsSafely(data)
        console.log("Products loaded successfully:", data.length)
      } else if (Array.isArray(data) && data.length === 0) {
        setProductsSafely([])
        setDataError("No products found in the data")
      } else {
        console.error("Invalid data format - expected array, got:", typeof data)
        setDataError("Invalid data format received")
        setProductsSafely([])
      }
    } catch (error) {
      console.error("Error loading products:", error)
      setDataError("Network error - failed to load products")
      setProductsSafely([])
    } finally {
      setLoading(false)
    }
  }

  const getPricingRecommendation = async (productName: string) => {
    if (!productName) {
      console.log("No product name provided for recommendation")
      return
    }

    // Check if the product exists in the current products array
    const productExists = Array.isArray(products) && products.some((p) => p.Product_Name === productName)
    if (!productExists) {
      console.log(`Product "${productName}" not found in current data, skipping recommendation request`)
      setRecommendation(null)
      return
    }

    setLoading(true)
    try {
      const endpoint = useCustomData ? "/api/pricing-recommendation/custom" : "/api/pricing-recommendation"
      console.log("Getting recommendation for:", productName, "from:", endpoint)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, currentDay }),
      })
      const data = await response.json()

      if (!response.ok || data.error) {
        console.error("Recommendation error:", data.error)

        // Auto-fallback if custom data is missing
        if (data.fallbackToDemo && useCustomData) {
          console.log("Custom data missing, falling back to demo data")
          setUseCustomData(false)
          setDataError("Custom data expired, switched to demo data")
          return
        }

        setRecommendation(null)
        return
      }

      console.log("Recommendation received:", data)
      setRecommendation(data)
    } catch (error) {
      console.error("Error getting recommendation:", error)
      setRecommendation(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Don't fetch recommendations while data source is changing
    if (dataSourceChangingRef.current) {
      return
    }

    // Ensure products is an array before proceeding
    if (selectedProduct && Array.isArray(products) && products.length > 0) {
      // Verify the selected product exists in the current products array
      const productExists = products.some((p) => p && p.Product_Name === selectedProduct)
      if (productExists) {
        getPricingRecommendation(selectedProduct)
      } else if (products.length > 0) {
        // If selected product doesn't exist, select the first available product
        console.log(`Selected product "${selectedProduct}" not found, selecting first available product`)
        setSelectedProduct(products[0].Product_Name)
      }
    }
  }, [selectedProduct, currentDay, useCustomData, products])

  const incrementDay = () => {
    setCurrentDay((prev) => {
      const newDay = prev + 1
      // Clear recommendation to force recalculation with new day
      setRecommendation(null)
      return newDay
    })
  }

  const decrementDay = () => {
    setCurrentDay((prev) => {
      const newDay = Math.max(1, prev - 1)
      // Clear recommendation to force recalculation with new day
      setRecommendation(null)
      return newDay
    })
  }

  const resetDay = () => {
    setCurrentDay(1)
    setRecommendation(null)
  }

  const exportReport = async () => {
    try {
      const endpoint = useCustomData ? "/api/export-report/custom" : "/api/export-report"
      const response = await fetch(endpoint)

      if (!response.ok) {
        console.error("Export failed")
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "pricing-report.csv"
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting report:", error)
    }
  }

  const handleDataUpload = (success: boolean) => {
    if (success) {
      // Reset state for new data
      setCurrentDay(1)
      setDataError(null)
      setRecommendation(null)
      productsLoadedRef.current = false
      dataSourceChangingRef.current = true

      // Check data status and load products
      checkDataStatus()

      // Switch to custom data and dashboard tab
      setUseCustomData(true)
      setActiveTab("dashboard")

      // Force re-render of Select component
      setSelectKey((prev) => prev + 1)
    }
  }

  const switchToDefaultData = () => {
    setUseCustomData(false)
    setCurrentDay(1)
    setDataError(null)
    productsLoadedRef.current = false
    dataSourceChangingRef.current = true
    setRecommendation(null)
    setSelectKey((prev) => prev + 1)
  }

  const switchToCustomData = () => {
    if (dataStatus?.hasCustomData) {
      setUseCustomData(true)
      setCurrentDay(1)
      setDataError(null)
      productsLoadedRef.current = false
      dataSourceChangingRef.current = true
      setRecommendation(null)
      setSelectKey((prev) => prev + 1)
    }
  }

  // Extra defensive programming - ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  // Safely find the selected product with multiple safety checks
  const selectedProductData =
    safeProducts.length > 0 && selectedProduct
      ? safeProducts.find((p) => p && p.Product_Name === selectedProduct)
      : undefined

  console.log("Render state:", {
    productsLength: safeProducts.length,
    selectedProduct,
    hasSelectedData: !!selectedProductData,
    useCustomData,
    dataError,
    selectKey,
  })

  return (
    <div className="dark-theme">
      <div className="max-w-7xl mx-auto p-3 relative z-10">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-400" />
                Smart Dynamic Pricing Engine
              </h1>
              <p className="text-base text-gray-300 mb-2">
                AI-powered pricing optimization to reduce waste and maximize revenue
              </p>
              <div className="flex gap-2">
                {useCustomData && <Badge className="bg-green-600 text-white text-xs">Custom Data</Badge>}
                {dataError && <Badge className="bg-red-600 text-white text-xs">Error</Badge>}
                {dataStatus?.hasCustomData && !useCustomData && (
                  <Badge className="bg-blue-600 text-white cursor-pointer text-xs" onClick={switchToCustomData}>
                    Custom Available
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                onClick={() => setShowLiveDashboard(!showLiveDashboard)}
                className={`glow-button flex items-center gap-1 text-sm px-3 py-2 ${
                  showLiveDashboard ? "bg-purple-600 hover:bg-purple-700" : ""
                }`}
              >
                <Activity className="h-3 w-3" />
                Live
              </Button>

              {/* Day Controls */}
              <div className="flex items-center gap-1 glow-card p-2 rounded-lg">
                <Button
                  onClick={decrementDay}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 h-8 w-8 p-0"
                  disabled={currentDay <= 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-1 px-2">
                  <Calendar className="h-3 w-3 text-purple-400" />
                  <span className="text-white font-medium text-sm">Day {currentDay}</span>
                </div>
                <Button
                  onClick={incrementDay}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button
                  onClick={resetDay}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 h-8 w-8 p-0 ml-1"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <Button
                onClick={exportReport}
                className="glow-button flex items-center gap-1 text-sm px-3 py-2"
                disabled={safeProducts.length === 0}
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
          </div>

          {/* Data Status Alert */}
          {dataStatus?.hasCustomData && !useCustomData && (
            <Alert className="glow-card border-blue-500/50 mb-3 py-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-gray-300 text-sm">
                <strong className="text-blue-400">Custom Data Available:</strong> {dataStatus.productCount} products.
                <Button
                  onClick={switchToCustomData}
                  variant="outline"
                  size="sm"
                  className="ml-2 text-white border-blue-400 bg-transparent text-xs px-2 py-1"
                >
                  Switch
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {dataError && (
            <Alert className="glow-card border-red-500/50 mb-3 py-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-gray-300 text-sm">
                <strong className="text-red-400">Error:</strong> {dataError}
                {useCustomData && (
                  <Button
                    onClick={switchToDefaultData}
                    variant="outline"
                    size="sm"
                    className="ml-2 text-white border-purple-400 bg-transparent text-xs px-2 py-1"
                  >
                    Demo Data
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Product Selection */}
          <Card className="glow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Package className="h-4 w-4 text-purple-400" />
                Product Selection ({safeProducts.length} available)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading && safeProducts.length === 0 ? (
                <div className="flex justify-center items-center py-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-white text-sm">Loading...</span>
                </div>
              ) : safeProducts.length > 0 ? (
                <Select
                  key={selectKey} // Force re-render when data changes
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  defaultOpen={false}
                >
                  <SelectTrigger className="w-full select-glow">
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 max-h-48">
                    {safeProducts.map((product, index) => {
                      // Extra safety check for each product
                      if (!product || !product.Product_Name) {
                        console.warn("Invalid product at index:", index, product)
                        return null
                      }

                      return (
                        <SelectItem
                          key={`${product.Product_Name}-${index}-${selectKey}`}
                          value={product.Product_Name}
                          className="text-white hover:bg-gray-800 focus:bg-gray-800"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2">
                              {product.Product_Name}
                              <span className="text-xs text-gray-400">
                                (${product.Unit_Price || 0} • {product.Days_to_Expiry || 0}d)
                              </span>
                            </span>
                            <Badge
                              variant="secondary"
                              className={`ml-2 text-xs ${
                                (product.Days_to_Expiry || 0) <= 2
                                  ? "bg-red-600 text-white"
                                  : (product.Days_to_Expiry || 0) <= 5
                                    ? "bg-orange-600 text-white"
                                    : "bg-green-600 text-white"
                              }`}
                            >
                              {product.Catagory || "Unknown"}
                            </Badge>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 mb-3 text-sm">
                    {useCustomData ? "No custom data available. Please upload a CSV file." : "No products available."}
                  </p>
                  {useCustomData && (
                    <Button onClick={switchToDefaultData} className="glow-button text-sm">
                      Use Demo Data
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedProduct && <RealTimeMetrics productName={selectedProduct} className="mb-4" />}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7 bg-transparent gap-1">
            <TabsTrigger value="dashboard" className="tab-glow text-xs px-2">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="camera" className="tab-glow text-xs px-2">
              <Camera className="h-3 w-3 mr-1" />
              Live
            </TabsTrigger>
            <TabsTrigger value="replenishment" className="tab-glow text-xs px-2">
              Restock
            </TabsTrigger>
            <TabsTrigger value="demand" className="tab-glow text-xs px-2">
              Demand
            </TabsTrigger>
            <TabsTrigger value="sustainability" className="tab-glow text-xs px-2">
              Green
            </TabsTrigger>
            <TabsTrigger value="indianmaps" className="tab-glow text-xs px-2">
              Maps
            </TabsTrigger>
            <TabsTrigger value="dataupload" className="tab-glow text-xs px-2">
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <PricingDashboard recommendation={recommendation} productData={selectedProductData} loading={loading} />
          </TabsContent>

          <TabsContent value="camera">
            <CameraDetectionTab
              onProductDetected={(productName) => {
                setSelectedProduct(productName)
                setActiveTab("dashboard") // Switch to dashboard after detection
              }}
              recommendation={recommendation}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="replenishment">
            <ReplenishmentTab productData={selectedProductData} recommendation={recommendation} />
          </TabsContent>

          <TabsContent value="demand">
            <DemandCurveTab productData={selectedProductData} recommendation={recommendation} />
          </TabsContent>

          <TabsContent value="sustainability">
            <SustainabilityTab recommendation={recommendation} productData={selectedProductData} />
          </TabsContent>

          <TabsContent value="indianmaps">
            <IndiaMapSection />
          </TabsContent>

          <TabsContent value="dataupload">
            <DataUploadTab onDataUpload={handleDataUpload} />
          </TabsContent>
        </Tabs>
      </div>

      <LiveDashboardOverlay isVisible={showLiveDashboard} onToggle={() => setShowLiveDashboard(!showLiveDashboard)} />
      <LiveAlertsTicker />
    </div>
  )
}
