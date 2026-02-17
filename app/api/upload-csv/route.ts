import { type NextRequest, NextResponse } from "next/server"
import DataStore from "@/lib/data-store"

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

// Define bins for Q-table (matching the Python script)
const daysToExpiryBins = [0, 2, 5, 10, 30, 100]
const stockBins = [0, 10, 20, 50, 100, 1000]

// Generate Q-table based on the provided logic
function generateQTable() {
  const qTable = Array(daysToExpiryBins.length + 1)
    .fill(0)
    .map(() =>
      Array(stockBins.length + 1)
        .fill(0)
        .map(
          () => Array(3).fill(0), // 3 actions: 0%, 10%, 20%
        ),
    )

  // Fill Q-table with values based on real-world logic
  for (let i = 0; i < qTable.length; i++) {
    for (let j = 0; j < qTable[0].length; j++) {
      // Very urgent (0-2 days) + high stock = aggressive discount
      if (i <= 2 && j >= 3) {
        qTable[i][j] = [0.1, 0.3, 0.6] // Favor 20% discount
      }
      // Urgent (3-5 days) + medium stock = moderate discount
      else if (i <= 3 && j >= 2) {
        qTable[i][j] = [0.3, 0.5, 0.2] // Favor 10% discount
      }
      // Low urgency or low stock = minimal discount
      else {
        qTable[i][j] = [0.8, 0.15, 0.05] // Favor 0% discount
      }
    }
  }

  return qTable
}

// Parse date in various formats
function parseDate(dateString: string): Date {
  // Try different date formats
  const formats = [
    // MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  ]

  for (const format of formats) {
    const match = dateString.match(format)
    if (match) {
      if (format === formats[2]) {
        // YYYY-MM-DD format
        return new Date(Number.parseInt(match[1]), Number.parseInt(match[2]) - 1, Number.parseInt(match[3]))
      } else {
        // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US format
        return new Date(Number.parseInt(match[3]), Number.parseInt(match[1]) - 1, Number.parseInt(match[2]))
      }
    }
  }

  // Fallback to Date constructor
  return new Date(dateString)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const csvContent = await file.text()
    const lines = csvContent.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file must contain at least a header and one data row" }, { status: 400 })
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    const requiredColumns = [
      "Product_Name",
      "Catagory",
      "Unit_Price",
      "Stock_Quantity",
      "Sales_Volume",
      "Expiration_Date",
      "Supplier_Name",
      "Inventory_Turnover_Rate",
    ]

    const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing required columns: ${missingColumns.join(", ")}` }, { status: 400 })
    }

    const products = []
    let urgentProducts = 0
    let totalValue = 0
    const categories = new Set()
    const productNames = new Set()
    const currentDate = new Date()

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const row: any = {}

        headers.forEach((header, index) => {
          let value = values[index] || ""

          if (header === "Unit_Price") {
            value = Number.parseFloat(value.replace(/[$,]/g, "")) || 0
          } else if (
            ["Stock_Quantity", "Reorder_Level", "Reorder_Quantity", "Sales_Volume", "Inventory_Turnover_Rate"].includes(
              header,
            )
          ) {
            value = Number.parseInt(value) || 0
          }

          row[header] = value
        })

        if (!row.Product_Name) {
          console.warn("Skipping row with empty product name:", row)
          continue
        }

        // Handle duplicate product names
        if (productNames.has(row.Product_Name)) {
          let counter = 1
          let newName = `${row.Product_Name} (${counter})`
          while (productNames.has(newName)) {
            counter++
            newName = `${row.Product_Name} (${counter})`
          }
          console.log(`Renamed duplicate product "${row.Product_Name}" to "${newName}"`)
          row.Product_Name = newName
        }
        productNames.add(row.Product_Name)

        // Calculate real expiry days from CSV data
        try {
          const expirationDate = parseDate(row.Expiration_Date)
          row.Days_to_Expiry = Math.max(
            0,
            Math.floor((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          )
        } catch (error) {
          console.warn("Invalid expiration date for", row.Product_Name, ":", row.Expiration_Date)
          row.Days_to_Expiry = 7 // Default to 7 days if date parsing fails
        }

        // Calculate realistic turnover rate
        row.Turnover_Rate = row.Stock_Quantity > 0 ? row.Sales_Volume / row.Stock_Quantity : 0

        // Calculate stock value
        row.Stock_Value = row.Stock_Quantity * row.Unit_Price

        // Add default fields if missing
        row.Warehouse_Location = row.Warehouse_Location || "Main Warehouse"
        row.Status = row.Status || "Active"
        row.Product_ID = row.Product_ID || `PROD-${i.toString().padStart(3, "0")}`
        row.Supplier_ID = row.Supplier_ID || `SUP-${i.toString().padStart(3, "0")}`
        row.Date_Received = row.Date_Received || new Date().toISOString().split("T")[0]
        row.Last_Order_Date = row.Last_Order_Date || new Date().toISOString().split("T")[0]
        row.Reorder_Level = row.Reorder_Level || Math.floor(row.Stock_Quantity * 0.3)
        row.Reorder_Quantity = row.Reorder_Quantity || Math.floor(row.Stock_Quantity * 0.5)

        // Calculate percentage change based on turnover and expiry
        const urgencyFactor = row.Days_to_Expiry <= 3 ? -20 : row.Days_to_Expiry <= 7 ? -10 : 0
        const turnoverFactor = row.Turnover_Rate > 0.5 ? 15 : row.Turnover_Rate > 0.3 ? 5 : -5
        row.percentage = `${urgencyFactor + turnoverFactor}%`

        // Add location data if missing
        row.Store_Location = row.Store_Location || "Main Store"
        row.State = row.State || "Maharashtra" // Default state
        row.Region = row.Region || stateRegions[row.State] || "West" // Derive region from state if missing
        row.Seasonal_Factor = row.Seasonal_Factor || "Regular" // Default seasonal factor

        // Apply regional and seasonal adjustments to pricing recommendations
        const region = row.Region
        const season = row.Seasonal_Factor
        const seasonalDiscount = seasonalFactors[region]?.[season] || 0

        // Adjust the percentage based on location and seasonality
        const locationFactor = seasonalDiscount
        row.percentage = `${Number.parseInt(row.percentage) + locationFactor}%`

        // Analytics
        if (row.Days_to_Expiry <= 5) urgentProducts++
        totalValue += row.Stock_Value
        categories.add(row.Catagory)

        products.push(row)
      }
    }

    if (products.length === 0) {
      return NextResponse.json({ error: "No valid products found in CSV file" }, { status: 400 })
    }

    const qTable = generateQTable()

    const dataStore = DataStore.getInstance()
    dataStore.clearCustomData()
    const success = dataStore.setCustomData(products)
    dataStore.setQTable(qTable)

    if (!success) {
      return NextResponse.json({ error: "Failed to store processed data" }, { status: 500 })
    }

    const analysisResults = {
      totalProducts: products.length,
      urgentProducts,
      totalValue: totalValue.toFixed(2),
      categories: categories.size,
      success: true,
    }

    console.log("CSV processed successfully:", analysisResults)
    return NextResponse.json(analysisResults)
  } catch (error) {
    console.error("CSV processing error:", error)
    return NextResponse.json({ error: "Failed to process CSV file" }, { status: 500 })
  }
}
