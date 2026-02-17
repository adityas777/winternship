import { NextResponse } from "next/server"
import type { ProductData } from "@/lib/pathway-client"

// Store for live product data
let liveProductData: ProductData[] = []
let lastUpdateTime = Date.now()

// Simulate live data updates (in production, this would come from Pathway)
const simulateLiveUpdates = () => {
  // Mock data that changes over time
  const mockProducts: ProductData[] = [
    {
      product_id: "01-903-5373",
      name: "Organic Bananas",
      current_price: 2.5,
      recommended_price: 2.25,
      expiry_date: "2024-06-08",
      stock_left: Math.floor(Math.random() * 200) + 50,
      category: "Fruits & Vegetables",
      price_change: -0.25,
      updated_at: new Date().toISOString(),
    },
    {
      product_id: "02-445-1122",
      name: "Greek Yogurt",
      current_price: 4.99,
      recommended_price: 4.49,
      expiry_date: "2024-06-12",
      stock_left: Math.floor(Math.random() * 100) + 20,
      category: "Dairy",
      price_change: -0.5,
      updated_at: new Date().toISOString(),
    },
    {
      product_id: "03-778-9900",
      name: "Fresh Salmon Fillet",
      current_price: 18.99,
      recommended_price: 13.29,
      expiry_date: "2024-06-03",
      stock_left: Math.floor(Math.random() * 50) + 10,
      category: "Seafood",
      price_change: -5.7,
      updated_at: new Date().toISOString(),
    },
    {
      product_id: "04-123-4567",
      name: "Strawberries",
      current_price: 6.0,
      recommended_price: 4.2,
      expiry_date: "2024-06-05",
      stock_left: Math.floor(Math.random() * 150) + 30,
      category: "Fruits & Vegetables",
      price_change: -1.8,
      updated_at: new Date().toISOString(),
    },
    {
      product_id: "05-987-6543",
      name: "Whole Wheat Bread",
      current_price: 3.49,
      recommended_price: 2.44,
      expiry_date: "2024-06-04",
      stock_left: Math.floor(Math.random() * 80) + 15,
      category: "Bakery",
      price_change: -1.05,
      updated_at: new Date().toISOString(),
    },
  ]

  liveProductData = mockProducts
  lastUpdateTime = Date.now()
}

// Initialize with mock data
simulateLiveUpdates()

// Update data every 5 seconds
setInterval(simulateLiveUpdates, 5000)

export async function GET() {
  try {
    // Return current live data
    return NextResponse.json({
      products: liveProductData,
      lastUpdate: lastUpdateTime,
      isLive: true,
    })
  } catch (error) {
    console.error("Error serving live products:", error)
    return NextResponse.json({ error: "Failed to load live products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { product_id } = await request.json()

    // Find specific product
    const product = liveProductData.find((p) => p.product_id === product_id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error getting live product:", error)
    return NextResponse.json({ error: "Failed to get product" }, { status: 500 })
  }
}
