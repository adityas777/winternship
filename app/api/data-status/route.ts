import { NextResponse } from "next/server"
import DataStore from "@/lib/data-store"

export async function GET() {
  try {
    const dataStore = DataStore.getInstance()

    return NextResponse.json({
      hasCustomData: dataStore.hasCustomData(),
      productCount: dataStore.getCustomData().length,
      dataAge: dataStore.getDataAge(),
    })
  } catch (error) {
    console.error("Error checking data status:", error)
    return NextResponse.json({ error: "Failed to check data status" }, { status: 500 })
  }
}
