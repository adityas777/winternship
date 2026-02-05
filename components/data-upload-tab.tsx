"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, AlertTriangle, Download, Database, Sparkles, BarChart3 } from "lucide-react"

interface DataUploadTabProps {
  onDataUpload: (success: boolean) => void
}

export default function DataUploadTab({ onDataUpload }: DataUploadTabProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setUploadedFile(file)
      setUploadStatus("idle")
      setErrorMessage(null)
      setAnalysisResults(null) // Reset previous results
    } else {
      setErrorMessage("Please select a valid CSV file")
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type === "text/csv") {
      setUploadedFile(file)
      setUploadStatus("idle")
      setErrorMessage(null)
      setAnalysisResults(null) // Reset previous results
    } else {
      setErrorMessage("Please drop a valid CSV file")
    }
  }

  const uploadFile = async () => {
    if (!uploadedFile) return

    setUploadStatus("uploading")
    setUploadProgress(0)
    setErrorMessage(null)

    const formData = new FormData()
    formData.append("file", uploadedFile)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok || result.error) {
        setUploadStatus("error")
        setErrorMessage(result.error || "Failed to process CSV file")
        return
      }

      setUploadStatus("processing")

      // Simulate processing time
      setTimeout(() => {
        setAnalysisResults(result)
        setUploadStatus("success")
        onDataUpload(true) // Notify parent component of successful upload
      }, 2000)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage("Network error occurred during upload")
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `Product_Name,Catagory,Supplier_Name,Warehouse_Location,Status,Product_ID,Supplier_ID,Date_Received,Last_Order_Date,Expiration_Date,Stock_Quantity,Reorder_Level,Reorder_Quantity,Unit_Price,Sales_Volume,Inventory_Turnover_Rate,percentage,Store_Location,State,Region,Seasonal_Factor
Organic Apples,Fruits & Vegetables,Fresh Farms Co,123 Farm Road,Active,AP-001,SF-001,2024-01-15,2024-01-10,2024-02-15,150,50,100,$3.99,45,75,12%,Zirakpur,Punjab,North,Winter
Premium Milk,Dairy,Dairy Fresh,456 Milk Lane,Active,MK-002,DF-002,2024-01-20,2024-01-18,2024-02-05,89,30,60,$4.49,32,68,-8%,Mumbai,Maharashtra,West,Summer
Whole Grain Bread,Bakery,Baker's Best,789 Bread St,Active,BR-003,BB-003,2024-01-22,2024-01-20,2024-01-28,67,25,50,$2.99,28,82,-15%,Chennai,Tamil Nadu,South,Monsoon
Fresh Salmon,Seafood,Ocean Catch,101 Harbor Dr,Active,FS-004,OC-004,2024-01-18,2024-01-15,2024-01-25,42,15,30,$12.99,18,90,-5%,Delhi,Delhi,North,Festival
Organic Spinach,Fruits & Vegetables,Green Fields,202 Farm Ave,Active,OS-005,GF-005,2024-01-21,2024-01-19,2024-01-27,75,25,50,$2.49,30,85,-10%,Kolkata,West Bengal,East,Monsoon`

    const blob = new Blob([sampleData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample_inventory.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-6 w-6 text-purple-400" />
            Upload Your Inventory Data
          </CardTitle>
          <CardDescription className="text-gray-300">
            Upload your CSV file to get AI-powered pricing recommendations for your specific inventory
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-white">📁 File Upload</CardTitle>
            <CardDescription className="text-gray-300">Drag and drop your CSV file or click to browse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center glass-effect cursor-pointer hover:border-purple-300 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              {uploadedFile ? (
                <div>
                  <p className="text-lg font-medium text-white mb-2">File Selected:</p>
                  <p className="text-purple-400 mb-2">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-400">Size: {(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-white mb-2">Drop your CSV file here</p>
                  <p className="text-gray-300 mb-4">or click to browse</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            </div>

            {errorMessage && (
              <Alert className="glow-card border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-gray-300">
                  <strong className="text-red-400">Error:</strong> {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {uploadedFile && uploadStatus === "idle" && (
              <Button onClick={uploadFile} className="glow-button w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload and Process
              </Button>
            )}

            {uploadStatus === "uploading" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Uploading...</span>
                  <span className="text-white">{uploadProgress}%</span>
                </div>
                <div className="progress-glow">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </div>
            )}

            {uploadStatus === "processing" && (
              <Alert className="glow-card border-blue-500/50">
                <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
                <AlertDescription className="text-gray-300">
                  Processing your data with AI models... This may take a few moments.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "success" && (
              <Alert className="glow-card border-green-500/50">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-gray-300">
                  <strong className="text-green-400">Success!</strong> Your data has been processed and is ready for
                  analysis.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && !errorMessage && (
              <Alert className="glow-card border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-gray-300">
                  <strong className="text-red-400">Error:</strong> Failed to process your file. Please check the format
                  and try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions & Sample */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-white">📋 CSV Format Requirements</CardTitle>
            <CardDescription className="text-gray-300">
              Your CSV file should include the following columns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Required Columns:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Product_Name
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Catagory
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Unit_Price
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Stock_Quantity
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Sales_Volume
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Expiration_Date
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Supplier_Name
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Inventory_Turnover_Rate
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Store_Location
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  State
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Region
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Seasonal_Factor
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-600">
              <h4 className="font-semibold text-white mb-2">Date Format:</h4>
              <p className="text-sm text-gray-300">Use MM/DD/YYYY format for dates</p>
            </div>

            <div className="pt-4 border-t border-gray-600">
              <h4 className="font-semibold text-white mb-2">Price Format:</h4>
              <p className="text-sm text-gray-300">Include $ symbol (e.g., $3.99)</p>
            </div>

            <Button onClick={downloadSampleCSV} variant="outline" className="w-full text-white border-purple-400">
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Data Analysis Results
            </CardTitle>
            <CardDescription className="text-gray-300">Summary of your uploaded inventory data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 glass-effect rounded-lg">
                <p className="text-2xl font-bold text-white">{analysisResults.totalProducts || 0}</p>
                <p className="text-sm text-gray-300">Total Products</p>
              </div>
              <div className="text-center p-4 glass-effect rounded-lg">
                <p className="text-2xl font-bold text-orange-400">{analysisResults.urgentProducts || 0}</p>
                <p className="text-sm text-gray-300">Urgent Items</p>
              </div>
              <div className="text-center p-4 glass-effect rounded-lg">
                <p className="text-2xl font-bold text-green-400">${analysisResults.totalValue || 0}</p>
                <p className="text-sm text-gray-300">Total Inventory Value</p>
              </div>
              <div className="text-center p-4 glass-effect rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{analysisResults.categories || 0}</p>
                <p className="text-sm text-gray-300">Product Categories</p>
              </div>
            </div>

            <Alert className="mt-4 glow-card border-green-500/50">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-gray-300">
                <strong className="text-green-400">Ready for Analysis!</strong> Your data has been successfully
                processed. Switch to the Dashboard tab to start getting AI-powered pricing recommendations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="text-white">🚀 What Happens After Upload?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">🤖 AI Processing</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Random Forest ML model training on your data</li>
                <li>• Q-learning optimization for discount strategies</li>
                <li>• Real-time price predictions</li>
                <li>• Demand forecasting</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">📊 Analytics Available</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Dynamic pricing recommendations</li>
                <li>• Waste reduction analysis</li>
                <li>• Revenue optimization</li>
                <li>• Sustainability impact metrics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
