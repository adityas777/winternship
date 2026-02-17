// Centralized data store utility
class DataStore {
  private static instance: DataStore
  private data: Map<string, any> = new Map()

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore()
    }
    return DataStore.instance
  }

  setCustomData(data: any) {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("Invalid data format for custom data:", data)
      return false
    }

    // Validate product names to ensure they're all strings
    const validData = data.filter((item) => {
      if (!item.Product_Name || typeof item.Product_Name !== "string") {
        console.warn("Invalid product data (missing or invalid Product_Name):", item)
        return false
      }
      return true
    })

    if (validData.length === 0) {
      console.error("No valid products found in data")
      return false
    }

    this.data.set("customProductData", validData)
    this.data.set("customDataTimestamp", Date.now())
    console.log("Custom data stored:", validData.length, "products")

    // Log the first few product names for debugging
    console.log(
      "Sample products:",
      validData.slice(0, 3).map((p) => p.Product_Name),
    )

    return true
  }

  getCustomData() {
    const data = this.data.get("customProductData") || []
    console.log("Custom data retrieved:", data.length, "products")

    // Log the first few product names for debugging
    if (data.length > 0) {
      console.log(
        "Sample products:",
        data.slice(0, 3).map((p: any) => p.Product_Name),
      )
    }

    return data
  }

  hasCustomData(): boolean {
    const data = this.data.get("customProductData")
    return Array.isArray(data) && data.length > 0
  }

  clearCustomData() {
    this.data.delete("customProductData")
    this.data.delete("customDataTimestamp")
    console.log("Custom data cleared")
  }

  getDataAge(): number {
    const timestamp = this.data.get("customDataTimestamp")
    return timestamp ? Date.now() - timestamp : 0
  }

  // Store Q-table data
  setQTable(qTable: any) {
    this.data.set("qTable", qTable)
    console.log("Q-table stored")
  }

  // Get Q-table data
  getQTable() {
    return this.data.get("qTable")
  }

  // Store ML model data
  setMLModel(model: any) {
    this.data.set("mlModel", model)
    console.log("ML model stored")
  }

  // Get ML model data
  getMLModel() {
    return this.data.get("mlModel")
  }
}

export default DataStore
