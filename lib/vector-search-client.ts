export interface VectorSearchResult {
  product_id: string
  name: string
  current_price: number
  category: string
  stock_left: number
  expiry_date: string
  similarity_score: number
}

export interface SearchFilters {
  category?: string
  max_price?: number
  min_stock?: number
}

export interface SearchResponse {
  query: string
  results: VectorSearchResult[]
  total_found: number
  search_time_ms: number
}

// Function to resolve server/base URL
function getServerBaseUrl(): string {
  // In the browser, relative paths work and must remain relative
  if (typeof window !== "undefined") return ""
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) return siteUrl
  return "http://localhost:3000"
}

export class VectorSearchClient {
  // Use absolute URL on server, relative in browser
  private baseUrl = `${getServerBaseUrl()}/api/vector-search`

  async searchProducts(query: string, topK = 5, filters: SearchFilters = {}): Promise<SearchResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          top_k: topK,
          filters,
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Vector search error:", error)
      throw error
    }
  }

  async getSimilarProducts(productId: string): Promise<VectorSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=similar&product_id=${productId}`)

      if (!response.ok) {
        throw new Error(`Similar products search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.similar_products || []
    } catch (error) {
      console.error("[v0] Similar products search error:", error)
      return []
    }
  }

  async getExpiringProducts(daysThreshold = 7): Promise<VectorSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=expiring&days=${daysThreshold}`)

      if (!response.ok) {
        throw new Error(`Expiring products search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.expiring_products || []
    } catch (error) {
      console.error("[v0] Expiring products search error:", error)
      return []
    }
  }

  async getLowStockProducts(stockThreshold = 20): Promise<VectorSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=low-stock&threshold=${stockThreshold}`)

      if (!response.ok) {
        throw new Error(`Low stock products search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.low_stock_products || []
    } catch (error) {
      console.error("[v0] Low stock products search error:", error)
      return []
    }
  }

  async getAnalytics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}?action=analytics`)

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Analytics request error:", error)
      return null
    }
  }
}

// Export singleton instance
export const vectorSearchClient = new VectorSearchClient()
