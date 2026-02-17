import { NextResponse } from "next/server"
import DataStore from "@/lib/data-store"

export async function GET() {
  try {
    const dataStore = DataStore.getInstance()

    if (!dataStore.hasCustomData()) {
      return NextResponse.json({ error: "No custom data available. Please upload a CSV file first." }, { status: 404 })
    }

    const customData = dataStore.getCustomData()
    console.log("Serving custom products:", customData.length)

    return NextResponse.json(customData)
  } catch (error) {
    console.error("Error loading custom products:", error)
    return NextResponse.json({ error: "Failed to load custom products" }, { status: 500 })
  }
}
