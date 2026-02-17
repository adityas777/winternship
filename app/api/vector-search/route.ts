import { NextResponse } from "next/server"

// Mock vector search functionality (in production, this would interface with Python vector store)
interface ProductSearchResult {
  product_id: string
  name: string
  current_price: number
  category: string
  stock_left: number
  expiry_date: string
  similarity_score: number
}

// Mock product database for vector search
const mockProducts = [
  {
    product_id: "01-903-5373",
    name: "Organic Bananas",
    current_price: 2.5,
    category: "Fruits & Vegetables",
    stock_left: 156,
    expiry_date: "2024-06-08",
  },
  {
    product_id: "02-445-1122",
    name: "Greek Yogurt",
    current_price: 4.99,
    category: "Dairy",
    stock_left: 78,
    expiry_date: "2024-06-12",
  },
  {
    product_id: "03-778-9900",
    name: "Fresh Salmon Fillet",
    current_price: 18.99,
    category: "Seafood",
    stock_left: 32,
    expiry_date: "2024-06-03",
  },
  {
    product_id: "04-123-4567",
    name: "Strawberries",
    current_price: 6.0,
    category: "Fruits & Vegetables",
    stock_left: 94,
    expiry_date: "2024-06-05",
  },
  {
    product_id: "05-987-6543",
    name: "Whole Wheat Bread",
    current_price: 3.49,
    category: "Bakery",
    stock_left: 45,
    expiry_date: "2024-06-04",
  },
]

function calculateSimilarity(query: string, product: any): number {
  const queryLower = query.toLowerCase()
  const productText = `${product.name} ${product.category}`.toLowerCase()

  // Simple keyword matching (in production, use proper vector similarity)
  const queryWords = queryLower.split(" ")
  let matches = 0

  for (const word of queryWords) {
    if (productText.includes(word)) {
      matches++
    }
  }

  // Category boost
  if (productText.includes(queryLower)) {
    matches += 2
  }

  return matches / queryWords.length
}

export async function POST(request: Request) {
  try {
    const { query, top_k = 5, filters = {} } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    console.log("[v0] Vector search query:", query)

    // Filter products based on criteria
    let filteredProducts = mockProducts

    if (filters.category) {
      filteredProducts = filteredProducts.filter((p) =>
        p.category.toLowerCase().includes(filters.category.toLowerCase()),
      )
    }

    if (filters.max_price) {
      filteredProducts = filteredProducts.filter((p) => p.current_price <= filters.max_price)
    }

    if (filters.min_stock) {
      filteredProducts = filteredProducts.filter((p) => p.stock_left >= filters.min_stock)
    }

    // Calculate similarity scores
    const results: ProductSearchResult[] = filteredProducts
      .map((product) => ({
        ...product,
        similarity_score: calculateSimilarity(query, product),
      }))
      .filter((result) => result.similarity_score > 0)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, top_k)

    console.log("[v0] Vector search results:", results.length)

    return NextResponse.json({
      query,
      results,
      total_found: results.length,
      search_time_ms: Math.random() * 50 + 10, // Mock search time
    })
  } catch (error) {
    console.error("Vector search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "similar": {
        const productId = searchParams.get("product_id")
        if (!productId) {
          return NextResponse.json({ error: "Product ID required" }, { status: 400 })
        }

        const targetProduct = mockProducts.find((p) => p.product_id === productId)
        if (!targetProduct) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        // Find similar products (same category or similar price range)
        const similar = mockProducts
          .filter((p) => p.product_id !== productId)
          .map((product) => ({
            ...product,
            similarity_score:
              product.category === targetProduct.category
                ? 0.8 + Math.random() * 0.2
                : Math.abs(product.current_price - targetProduct.current_price) < 5
                  ? 0.4 + Math.random() * 0.3
                  : Math.random() * 0.3,
          }))
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, 3)

        return NextResponse.json({ similar_products: similar })
      }

      case "expiring": {
        const daysThreshold = Number.parseInt(searchParams.get("days") || "7")
        const currentDate = new Date()

        const expiringProducts = mockProducts
          .map((product) => {
            const expiryDate = new Date(product.expiry_date)
            const daysToExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
            return { ...product, days_to_expiry: daysToExpiry }
          })
          .filter((product) => product.days_to_expiry >= 0 && product.days_to_expiry <= daysThreshold)
          .sort((a, b) => a.days_to_expiry - b.days_to_expiry)

        return NextResponse.json({ expiring_products: expiringProducts })
      }

      case "low-stock": {
        const stockThreshold = Number.parseInt(searchParams.get("threshold") || "20")

        const lowStockProducts = mockProducts
          .filter((product) => product.stock_left <= stockThreshold)
          .sort((a, b) => a.stock_left - b.stock_left)

        return NextResponse.json({ low_stock_products: lowStockProducts })
      }

      case "analytics": {
        const categories = mockProducts.reduce(
          (acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const totalStock = mockProducts.reduce((sum, product) => sum + product.stock_left, 0)
        const totalValue = mockProducts.reduce((sum, product) => sum + product.current_price * product.stock_left, 0)

        const currentDate = new Date()
        const expiringCount = mockProducts.filter((product) => {
          const expiryDate = new Date(product.expiry_date)
          const daysToExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysToExpiry >= 0 && daysToExpiry <= 7
        }).length

        return NextResponse.json({
          total_products: mockProducts.length,
          categories,
          total_stock_units: totalStock,
          total_inventory_value: Math.round(totalValue * 100) / 100,
          products_expiring_soon: expiringCount,
          last_update: new Date().toISOString(),
        })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Vector search GET error:", error)
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}
