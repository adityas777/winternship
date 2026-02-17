import { NextResponse } from "next/server"
import DataStore from "@/lib/data-store"

export async function GET() {
  try {
    const dataStore = DataStore.getInstance()

    if (!dataStore.hasCustomData()) {
      return NextResponse.json({ error: "No custom data available" }, { status: 404 })
    }

    const customData = dataStore.getCustomData()

    // Generate CSV report for custom data
    const csvData = [
      [
        "Product Name",
        "Category",
        "Current Price",
        "Recommended Discount",
        "Final Price",
        "Expected Revenue",
        "Waste Reduction",
        "Days to Expiry",
      ],
    ]

    // Add data for each product
    customData.forEach((product: any) => {
      const discountPercent = product.Days_to_Expiry <= 2 ? 20 : product.Days_to_Expiry <= 5 ? 10 : 0
      const finalPrice = product.Unit_Price * (1 - discountPercent / 100)
      const estimatedRevenue = Math.min(product.Sales_Volume * 1.2, product.Stock_Quantity) * finalPrice
      const wasteReduction = Math.max(0, product.Sales_Volume * 0.2)

      csvData.push([
        product.Product_Name,
        product.Catagory,
        `$${product.Unit_Price.toFixed(2)}`,
        `${discountPercent}%`,
        `$${finalPrice.toFixed(2)}`,
        `$${estimatedRevenue.toFixed(2)}`,
        `${wasteReduction.toFixed(0)} units`,
        `${product.Days_to_Expiry} days`,
      ])
    })

    const csvContent = csvData.map((row) => row.join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="custom-pricing-report.csv"',
      },
    })
  } catch (error) {
    console.error("Error generating custom report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
