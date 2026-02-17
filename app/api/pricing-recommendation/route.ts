import { type NextRequest, NextResponse } from "next/server"

// Mock ML model prediction function
function predictPrice(features: any) {
  const basePrice = features.Unit_Price || 5.0
  const daysToExpiry = features.Days_to_Expiry || 7
  const turnoverRate = features.Turnover_Rate || 0.3
  const stockLevel = features.Stock_Quantity || 50

  let adjustedPrice = basePrice

  // Urgency factor (closer to expiry = lower price)
  if (daysToExpiry <= 2) adjustedPrice *= 0.85
  else if (daysToExpiry <= 5) adjustedPrice *= 0.95

  // Stock level factor
  if (stockLevel > 100) adjustedPrice *= 0.98
  else if (stockLevel < 20) adjustedPrice *= 1.05

  // Turnover factor
  if (turnoverRate > 0.5) adjustedPrice *= 1.02
  else if (turnoverRate < 0.2) adjustedPrice *= 0.96

  return Math.max(adjustedPrice, basePrice * 0.7)
}

// Mock Q-table logic
function getOptimalDiscount(daysToExpiry: number, stockLevel: number) {
  if (daysToExpiry <= 1) return 30
  if (daysToExpiry <= 2 && stockLevel > 50) return 20
  if (daysToExpiry <= 3 && stockLevel > 30) return 15
  if (daysToExpiry <= 5 && stockLevel > 80) return 10
  if (stockLevel > 100) return 5
  return 0
}

export async function POST(request: NextRequest) {
  try {
    const { productName, currentDay } = await request.json()

    // Expanded product data lookup
    const mockProducts: any = {
      Strawberries: {
        Unit_Price: 6.0,
        Days_to_Expiry: Math.max(1, 4 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 94 - (currentDay - 1) * 15),
        Sales_Volume: 40,
        Turnover_Rate: 0.42,
        Inventory_Turnover_Rate: 84,
      },
      "Organic Bananas": {
        Unit_Price: 2.5,
        Days_to_Expiry: Math.max(1, 7 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 156 - (currentDay - 1) * 20),
        Sales_Volume: 65,
        Turnover_Rate: 0.41,
        Inventory_Turnover_Rate: 92,
      },
      "Greek Yogurt": {
        Unit_Price: 4.99,
        Days_to_Expiry: Math.max(1, 11 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 78 - (currentDay - 1) * 8),
        Sales_Volume: 25,
        Turnover_Rate: 0.32,
        Inventory_Turnover_Rate: 68,
      },
      "Whole Wheat Bread": {
        Unit_Price: 3.49,
        Days_to_Expiry: Math.max(1, 3 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 45 - (currentDay - 1) * 12),
        Sales_Volume: 18,
        Turnover_Rate: 0.4,
        Inventory_Turnover_Rate: 75,
      },
      "Premium Ground Coffee": {
        Unit_Price: 12.99,
        Days_to_Expiry: Math.max(1, 75 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 120 - (currentDay - 1) * 5),
        Sales_Volume: 35,
        Turnover_Rate: 0.29,
        Inventory_Turnover_Rate: 45,
      },
      "Fresh Salmon Fillet": {
        Unit_Price: 18.99,
        Days_to_Expiry: Math.max(1, 2 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 32 - (currentDay - 1) * 8),
        Sales_Volume: 12,
        Turnover_Rate: 0.37,
        Inventory_Turnover_Rate: 95,
      },
      "Organic Spinach": {
        Unit_Price: 3.99,
        Days_to_Expiry: Math.max(1, 5 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 67 - (currentDay - 1) * 10),
        Sales_Volume: 28,
        Turnover_Rate: 0.41,
        Inventory_Turnover_Rate: 78,
      },
      "Aged Cheddar Cheese": {
        Unit_Price: 8.99,
        Days_to_Expiry: Math.max(1, 44 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 89 - (currentDay - 1) * 3),
        Sales_Volume: 22,
        Turnover_Rate: 0.24,
        Inventory_Turnover_Rate: 52,
      },
      "Sourdough Bread": {
        Unit_Price: 4.99,
        Days_to_Expiry: Math.max(1, 4 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 38 - (currentDay - 1) * 8),
        Sales_Volume: 16,
        Turnover_Rate: 0.42,
        Inventory_Turnover_Rate: 82,
      },
      "Organic Milk": {
        Unit_Price: 5.49,
        Days_to_Expiry: Math.max(1, 9 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 124 - (currentDay - 1) * 12),
        Sales_Volume: 45,
        Turnover_Rate: 0.36,
        Inventory_Turnover_Rate: 88,
      },
      "Free-Range Eggs": {
        Unit_Price: 6.99,
        Days_to_Expiry: Math.max(1, 17 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 156 - (currentDay - 1) * 8),
        Sales_Volume: 38,
        Turnover_Rate: 0.24,
        Inventory_Turnover_Rate: 65,
      },
      Avocados: {
        Unit_Price: 1.99,
        Days_to_Expiry: Math.max(1, 6 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 89 - (currentDay - 1) * 14),
        Sales_Volume: 42,
        Turnover_Rate: 0.47,
        Inventory_Turnover_Rate: 89,
      },
      "Chicken Breast": {
        Unit_Price: 9.99,
        Days_to_Expiry: Math.max(1, 4 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 67 - (currentDay - 1) * 10),
        Sales_Volume: 28,
        Turnover_Rate: 0.41,
        Inventory_Turnover_Rate: 76,
      },
      Blueberries: {
        Unit_Price: 7.99,
        Days_to_Expiry: Math.max(1, 6 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 78 - (currentDay - 1) * 12),
        Sales_Volume: 32,
        Turnover_Rate: 0.41,
        Inventory_Turnover_Rate: 81,
      },
      "Artisan Pasta": {
        Unit_Price: 3.99,
        Days_to_Expiry: Math.max(1, 202 - (currentDay - 1)),
        Stock_Quantity: Math.max(0, 145 - (currentDay - 1) * 3),
        Sales_Volume: 25,
        Turnover_Rate: 0.17,
        Inventory_Turnover_Rate: 35,
      },
    }

    const productData = mockProducts[productName]
    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // ML prediction
    const predictedPrice = predictPrice(productData)

    // Q-learning discount recommendation
    const discountPercent = getOptimalDiscount(productData.Days_to_Expiry, productData.Stock_Quantity)
    const discountedPrice = predictedPrice * (1 - discountPercent / 100)

    // Calculate business metrics
    const baseDemand = productData.Sales_Volume
    const demandMultiplier = 1 + (discountPercent / 100) * 1.5
    const estimatedDemand = baseDemand * demandMultiplier
    const actualSales = Math.min(estimatedDemand, productData.Stock_Quantity)
    const estimatedRevenue = actualSales * discountedPrice
    const wasteReduction = Math.max(0, actualSales - baseDemand)

    const recommendation = {
      productName,
      predictedPrice,
      discountPercent,
      discountedPrice,
      estimatedRevenue,
      wasteReduction,
      confidence: 0.87,
      reasoning: `Based on ${productData.Days_to_Expiry} days to expiry and ${productData.Stock_Quantity} units in stock, a ${discountPercent}% discount is recommended to optimize revenue while reducing waste.`,
    }

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error("Error generating recommendation:", error)
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}
