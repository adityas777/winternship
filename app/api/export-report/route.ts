import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Generate CSV report
    const csvData = [
      ["Product Name", "Current Price", "Recommended Price", "Discount %", "Expected Revenue", "Waste Reduction"],
      ["Strawberries", "$6.00", "$4.80", "20%", "$192.00", "8 units"],
      ["Organic Bananas", "$2.50", "$2.38", "5%", "$154.70", "12 units"],
      ["Greek Yogurt", "$4.99", "$4.99", "0%", "$124.75", "0 units"],
      ["Whole Wheat Bread", "$3.49", "$2.44", "30%", "$43.88", "15 units"],
      ["Premium Ground Coffee", "$12.99", "$12.99", "0%", "$454.65", "0 units"],
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="pricing-report.csv"',
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
