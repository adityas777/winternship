export interface ProductData {
  Product_Name: string
  Catagory: string
  Supplier_Name: string
  Warehouse_Location: string
  Status: string
  Product_ID: string
  Supplier_ID: string
  Date_Received: string
  Last_Order_Date: string
  Expiration_Date: string
  Stock_Quantity: number
  Reorder_Level: number
  Reorder_Quantity: number
  Unit_Price: number
  Sales_Volume: number
  Inventory_Turnover_Rate: number
  percentage: string
  Days_to_Expiry: number
  Turnover_Rate: number
  Stock_Value: number
}

export interface PricingRecommendation {
  productName: string
  predictedPrice: number
  discountPercent: number
  discountedPrice: number
  estimatedRevenue: number
  wasteReduction: number
  confidence: number
  reasoning: string
}

export interface QTableState {
  daysToExpiry: number
  stockLevel: number
}

export interface MLFeatures {
  Days_to_Expiry: number
  Turnover_Rate: number
  Sales_Volume: number
  Inventory_Turnover_Rate: number
  Stock_Quantity: number
}
