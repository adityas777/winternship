import { type NextRequest, NextResponse } from "next/server"
import DataStore from "@/lib/data-store"

// Add these constants at the top of the file
// Define regions for states
const stateRegions = {
  Punjab: "North",
  Haryana: "North",
  "Himachal Pradesh": "North",
  "Uttar Pradesh": "North",
  Uttarakhand: "North",
  Delhi: "North",
  Rajasthan: "North",
  "Tamil Nadu": "South",
  Kerala: "South",
  Karnataka: "South",
  "Andhra Pradesh": "South",
  Telangana: "South",
  "West Bengal": "East",
  Bihar: "East",
  Jharkhand: "East",
  Odisha: "East",
  Assam: "East",
  "Arunachal Pradesh": "East",
  Manipur: "East",
  Meghalaya: "East",
  Mizoram: "East",
  Nagaland: "East",
  Sikkim: "East",
  Tripura: "East",
  Maharashtra: "West",
  Gujarat: "West",
  Goa: "West",
  "Madhya Pradesh": "Central",
  Chhattisgarh: "Central",
}

// Seasonal factors by month and region
const seasonalFactors = {
  North: {
    Winter: 15,
    Summer: 10,
    Monsoon: 15,
    Festival: 25,
  },
  South: {
    Winter: 10,
    Summer: 20,
    Monsoon: 15,
    Festival: 25,
  },
  East: {
    Winter: 15,
    Summer: 10,
    Monsoon: 20,
    Festival: 25,
  },
  West: {
    Winter: 10,
    Summer: 15,
    Monsoon: 15,
    Festival: 25,
  },
  Central: {
    Winter: 15,
    Summer: 15,
    Monsoon: 15,
    Festival: 20,
  },
}

const daysToExpiryBins = [0, 2, 5, 10, 30, 100]
const stockBins = [0, 10, 20, 50, 100, 1000]

function getState(daysLeft: number, stock: number) {
  const daysIndex = daysToExpiryBins.findIndex((bin) => daysLeft <= bin)
  const stockIndex = stockBins.findIndex((bin) => stock <= bin)

  return {
    daysIndex: daysIndex === -1 ? daysToExpiryBins.length : daysIndex,
    stockIndex: stockIndex === -1 ? stockBins.length : stockIndex,
  }
}

// Update the getOptimalDiscount function to consider location and seasonality
function getOptimalDiscount(
  qTable: any,
  daysLeft: number,
  stock: number,
  turnoverRate: number,
  salesVolume: number,
  region: string,
  season: string,
) {
  const { daysIndex, stockIndex } = getState(daysLeft, stock)

  // Get base action from Q-table
  const qValues = qTable[daysIndex][stockIndex]
  const baseActionIndex = qValues.indexOf(Math.max(...qValues))

  // Apply real-world business logic adjustments
  let discountPercent = baseActionIndex * 10

  // Urgency-based adjustments
  if (daysLeft <= 1) {
    discountPercent = Math.max(discountPercent, 25) // Minimum 25% for expiring today/tomorrow
  } else if (daysLeft <= 2) {
    discountPercent = Math.max(discountPercent, 20) // Minimum 20% for 2 days
  } else if (daysLeft <= 3) {
    discountPercent = Math.max(discountPercent, 15) // Minimum 15% for 3 days
  } else if (daysLeft <= 5) {
    discountPercent = Math.max(discountPercent, 10) // Minimum 10% for 5 days
  }

  // Stock level adjustments
  if (stock > 100 && daysLeft <= 7) {
    discountPercent += 5 // Extra discount for overstocked items
  } else if (stock < 10) {
    discountPercent = Math.max(0, discountPercent - 5) // Reduce discount for low stock
  }

  // Turnover rate adjustments
  if (turnoverRate < 0.1 && daysLeft <= 5) {
    discountPercent += 5 // Extra discount for slow-moving items
  } else if (turnoverRate > 0.8) {
    discountPercent = Math.max(0, discountPercent - 3) // Reduce discount for fast-moving items
  }

  // Sales volume adjustments
  if (salesVolume < 5 && daysLeft <= 3) {
    discountPercent += 3 // Extra discount for low-selling items near expiry
  }

  // Location and seasonality adjustments
  const seasonalDiscount = seasonalFactors[region]?.[season] || 0
  discountPercent = Math.max(discountPercent, seasonalDiscount)

  // Cap the discount at reasonable limits
  return Math.min(Math.max(discountPercent, 0), 40)
}

// Enhanced ML price prediction with real-world factors
function predictPrice(features: any, currentDay: number) {
  const basePrice = features.Unit_Price || 5.0
  const daysToExpiry = Math.max(1, features.Days_to_Expiry - (currentDay - 1))
  const turnoverRate = features.Turnover_Rate || 0.3
  const salesVolume = features.Sales_Volume || 20
  const inventoryTurnover = features.Inventory_Turnover_Rate || 50
  const stockLevel = Math.max(0, features.Stock_Quantity - (currentDay - 1) * Math.floor(salesVolume / 7))

  let adjustedPrice = basePrice

  // Time-based price adjustments (more sophisticated)
  const urgencyMultiplier = Math.max(0.7, 1 - (7 - daysToExpiry) * 0.05)
  adjustedPrice *= urgencyMultiplier

  // Stock pressure adjustments
  const stockPressure = stockLevel / (features.Stock_Quantity || 1)
  if (stockPressure > 0.8) {
    adjustedPrice *= 0.95 // Slight reduction for high stock
  } else if (stockPressure < 0.3) {
    adjustedPrice *= 1.05 // Slight increase for low stock
  }

  // Market demand adjustments based on turnover
  if (turnoverRate > 0.6) {
    adjustedPrice *= 1.03 // Premium for high-demand items
  } else if (turnoverRate < 0.2) {
    adjustedPrice *= 0.97 // Discount for low-demand items
  }

  // Category-based adjustments
  const category = features.Catagory?.toLowerCase() || ""
  if (category.includes("dairy") || category.includes("meat") || category.includes("seafood")) {
    // Perishable items get more aggressive pricing near expiry
    if (daysToExpiry <= 3) adjustedPrice *= 0.9
  } else if (category.includes("pantry") || category.includes("canned")) {
    // Non-perishable items maintain price better
    adjustedPrice *= 1.02
  }

  return Math.max(adjustedPrice, basePrice * 0.6) // Minimum 60% of original price
}

// Calculate realistic demand response
function calculateDemandResponse(basePrice: number, discountedPrice: number, features: any) {
  const priceElasticity = getPriceElasticity(features.Catagory)
  const priceChange = (basePrice - discountedPrice) / basePrice
  const demandIncrease = priceChange * priceElasticity

  return Math.max(1, 1 + demandIncrease)
}

// Get price elasticity by category
function getPriceElasticity(category: string): number {
  const categoryLower = category?.toLowerCase() || ""

  if (categoryLower.includes("luxury") || categoryLower.includes("premium")) {
    return 1.5 // Luxury items are more price sensitive
  } else if (categoryLower.includes("dairy") || categoryLower.includes("bread")) {
    return 0.8 // Staples are less price sensitive
  } else if (categoryLower.includes("meat") || categoryLower.includes("seafood")) {
    return 1.2 // Protein is moderately price sensitive
  } else if (categoryLower.includes("fruits") || categoryLower.includes("vegetables")) {
    return 1.0 // Fresh produce is moderately price sensitive
  }

  return 1.0 // Default elasticity
}

export async function POST(request: NextRequest) {
  try {
    const { productName, currentDay } = await request.json()

    const dataStore = DataStore.getInstance()

    if (!dataStore.hasCustomData()) {
      return NextResponse.json(
        {
          error: "No custom data available. Please upload a CSV file first.",
          fallbackToDemo: true,
        },
        { status: 404 },
      )
    }

    const customData = dataStore.getCustomData()
    const qTable = dataStore.getQTable() || generateDefaultQTable()

    console.log("Processing recommendation for:", productName, "from", customData.length, "products")

    // Get available product names for better error messages
    const availableProducts = customData.map((p: any) => p.Product_Name)

    const productData = customData.find((p: any) => p.Product_Name === productName)
    if (!productData) {
      return NextResponse.json(
        {
          error: `Product "${productName}" not found in custom data`,
          availableProducts: availableProducts.slice(0, 5),
          allProducts: availableProducts,
        },
        { status: 404 },
      )
    }

    // Extract location and seasonality data
    const region = productData.Region || stateRegions[productData.State] || "West"
    const season = productData.Seasonal_Factor || "Regular"

    // Simulate time progression with realistic stock depletion
    const dailySales = Math.max(1, Math.floor(productData.Sales_Volume / 7))
    const adjustedData = {
      ...productData,
      Days_to_Expiry: Math.max(0, productData.Days_to_Expiry - (currentDay - 1)),
      Stock_Quantity: Math.max(0, productData.Stock_Quantity - (currentDay - 1) * dailySales),
    }

    // Recalculate turnover rate with adjusted stock
    adjustedData.Turnover_Rate =
      adjustedData.Stock_Quantity > 0 ? adjustedData.Sales_Volume / adjustedData.Stock_Quantity : 1

    // Enhanced ML price prediction
    const predictedPrice = predictPrice(adjustedData, currentDay)

    // Sophisticated Q-learning discount recommendation
    const discountPercent = getOptimalDiscount(
      qTable,
      adjustedData.Days_to_Expiry,
      adjustedData.Stock_Quantity,
      adjustedData.Turnover_Rate,
      adjustedData.Sales_Volume,
      region,
      season,
    )

    const discountedPrice = predictedPrice * (1 - discountPercent / 100)

    // Calculate realistic business metrics
    const baseDemand = adjustedData.Sales_Volume
    const demandMultiplier = calculateDemandResponse(predictedPrice, discountedPrice, adjustedData)
    const estimatedDemand = baseDemand * demandMultiplier
    const actualSales = Math.min(estimatedDemand, adjustedData.Stock_Quantity)
    const estimatedRevenue = actualSales * discountedPrice
    const wasteReduction = Math.max(0, actualSales - baseDemand)

    // Calculate confidence based on data quality and business factors
    const dataQuality = Math.min(1, (adjustedData.Sales_Volume + adjustedData.Inventory_Turnover_Rate) / 100)
    const timeConfidence = adjustedData.Days_to_Expiry > 0 ? 1 : 0.7
    const stockConfidence = adjustedData.Stock_Quantity > 0 ? 1 : 0.5
    const confidence = Math.min(0.95, 0.6 + dataQuality * 0.2 + timeConfidence * 0.1 + stockConfidence * 0.1)

    // Generate intelligent reasoning
    const reasoning = generateReasoning(adjustedData, discountPercent, currentDay)

    const recommendation = {
      productName,
      predictedPrice,
      discountPercent,
      discountedPrice,
      estimatedRevenue,
      wasteReduction,
      confidence,
      reasoning,
    }

    console.log("Recommendation generated:", recommendation)
    return NextResponse.json(recommendation)
  } catch (error) {
    console.error("Error generating custom recommendation:", error)
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}

function generateReasoning(productData: any, discountPercent: number, currentDay: number): string {
  const reasons = []

  if (productData.Days_to_Expiry <= 1) {
    reasons.push("URGENT: Product expires within 24 hours")
  } else if (productData.Days_to_Expiry <= 3) {
    reasons.push(`Product expires in ${productData.Days_to_Expiry} days`)
  }

  if (productData.Stock_Quantity > 100) {
    reasons.push("High inventory levels detected")
  } else if (productData.Stock_Quantity < 10) {
    reasons.push("Low stock - limited discount applied")
  }

  if (productData.Turnover_Rate < 0.2) {
    reasons.push("Slow-moving product")
  } else if (productData.Turnover_Rate > 0.6) {
    reasons.push("Fast-moving product")
  }

  if (currentDay > 1) {
    reasons.push(`Day ${currentDay} simulation - stock and expiry adjusted`)
  }

  if (productData.Region) {
    reasons.push(`Regional factor: ${productData.Region}`)
  }
  if (productData.Seasonal_Factor) {
    reasons.push(`Seasonal factor: ${productData.Seasonal_Factor}`)
  }

  const baseReason = `AI recommends ${discountPercent}% discount based on: ${reasons.join(", ")}`
  return baseReason + ". This optimizes revenue while minimizing waste."
}

function generateDefaultQTable() {
  const qTable = Array(daysToExpiryBins.length + 1)
    .fill(0)
    .map(() =>
      Array(stockBins.length + 1)
        .fill(0)
        .map(() => Array(3).fill(0)),
    )

  for (let i = 0; i < qTable.length; i++) {
    for (let j = 0; j < qTable[0].length; j++) {
      if (i <= 2 && j >= 3) {
        qTable[i][j] = [0.1, 0.3, 0.6]
      } else if (i <= 3 && j >= 2) {
        qTable[i][j] = [0.3, 0.5, 0.2]
      } else {
        qTable[i][j] = [0.8, 0.15, 0.05]
      }
    }
  }

  return qTable
}
