"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar } from "lucide-react"

// Define Indian states with their data
const indianStates = {
  "Jammu and Kashmir": { id: "JK", stores: 2, seasonality: "High in summer", color: "#F47373" },
  "Himachal Pradesh": { id: "HP", stores: 1, seasonality: "High in summer", color: "#F8E16C" },
  Punjab: { id: "PB", stores: 3, seasonality: "High in winter", color: "#37D67A" },
  Uttarakhand: { id: "UK", stores: 1, seasonality: "High in summer", color: "#2CCCE4" },
  Haryana: { id: "HR", stores: 4, seasonality: "High in winter", color: "#DCB0ED" },
  "Uttar Pradesh": { id: "UP", stores: 7, seasonality: "High in festival season", color: "#9FE6A0" },
  Rajasthan: { id: "RJ", stores: 4, seasonality: "High in winter", color: "#9966CC" },
  Gujarat: { id: "GJ", stores: 5, seasonality: "High in festival season", color: "#F8D3A9" },
  "Madhya Pradesh": { id: "MP", stores: 4, seasonality: "High in winter", color: "#E6C8C8" },
  Bihar: { id: "BR", stores: 2, seasonality: "High in winter", color: "#FFE69A" },
  Jharkhand: { id: "JH", stores: 1, seasonality: "Moderate year-round", color: "#B983FF" },
  "West Bengal": { id: "WB", stores: 4, seasonality: "High in festival season", color: "#4D96FF" },
  Sikkim: { id: "SK", stores: 0, seasonality: "High in summer", color: "#6BCB77" },
  Assam: { id: "AS", stores: 1, seasonality: "High in monsoon", color: "#4D96FF" },
  "Arunachal Pradesh": { id: "AR", stores: 0, seasonality: "Moderate year-round", color: "#FF6B6B" },
  Nagaland: { id: "NL", stores: 0, seasonality: "Moderate year-round", color: "#FFD93D" },
  Manipur: { id: "MN", stores: 0, seasonality: "Moderate year-round", color: "#6BCB77" },
  Mizoram: { id: "MZ", stores: 0, seasonality: "Moderate year-round", color: "#4D96FF" },
  Tripura: { id: "TR", stores: 0, seasonality: "Moderate year-round", color: "#F6C6EA" },
  Meghalaya: { id: "ML", stores: 0, seasonality: "High in monsoon", color: "#FFD93D" },
  Odisha: { id: "OD", stores: 2, seasonality: "High in summer", color: "#FFC4C4" },
  Chhattisgarh: { id: "CG", stores: 1, seasonality: "Moderate year-round", color: "#9FE6A0" },
  Maharashtra: { id: "MH", stores: 8, seasonality: "High in festival season", color: "#FFC4C4" },
  Telangana: { id: "TG", stores: 4, seasonality: "High in summer", color: "#9FE6A0" },
  "Andhra Pradesh": { id: "AP", stores: 3, seasonality: "High in summer", color: "#FF6B6B" },
  Karnataka: { id: "KA", stores: 6, seasonality: "High in summer", color: "#FFD93D" },
  Goa: { id: "GA", stores: 0, seasonality: "High in tourist season", color: "#FFC4C4" },
  Kerala: { id: "KL", stores: 3, seasonality: "High in monsoon", color: "#9FE6A0" },
  "Tamil Nadu": { id: "TN", stores: 5, seasonality: "High in summer", color: "#FFD93D" },
  Delhi: { id: "DL", stores: 5, seasonality: "High year-round", color: "#4D96FF" },
  "Andaman and Nicobar": { id: "AN", stores: 0, seasonality: "High in tourist season", color: "#6BCB77" },
  Lakshadweep: { id: "LD", stores: 0, seasonality: "High in tourist season", color: "#4D96FF" },
}

// Store locations (Walmart Best Price stores in India)
const storeLocations = [
  { id: 1, name: "Best Price Zirakpur", state: "Punjab", city: "Zirakpur", type: "Wholesale" },
  { id: 2, name: "Best Price Amritsar", state: "Punjab", city: "Amritsar", type: "Wholesale" },
  { id: 3, name: "Best Price Ludhiana", state: "Punjab", city: "Ludhiana", type: "Wholesale" },
  { id: 4, name: "Best Price Agra", state: "Uttar Pradesh", city: "Agra", type: "Wholesale" },
  { id: 5, name: "Best Price Lucknow", state: "Uttar Pradesh", city: "Lucknow", type: "Wholesale" },
  { id: 6, name: "Best Price Kanpur", state: "Uttar Pradesh", city: "Kanpur", type: "Wholesale" },
  { id: 7, name: "Best Price Meerut", state: "Uttar Pradesh", city: "Meerut", type: "Wholesale" },
  { id: 8, name: "Best Price Bareilly", state: "Uttar Pradesh", city: "Bareilly", type: "Wholesale" },
  { id: 9, name: "Best Price Varanasi", state: "Uttar Pradesh", city: "Varanasi", type: "Wholesale" },
  { id: 10, name: "Best Price Ghaziabad", state: "Uttar Pradesh", city: "Ghaziabad", type: "Wholesale" },
  { id: 11, name: "Best Price Mumbai", state: "Maharashtra", city: "Mumbai", type: "Wholesale" },
  { id: 12, name: "Best Price Pune", state: "Maharashtra", city: "Pune", type: "Wholesale" },
  { id: 13, name: "Best Price Nagpur", state: "Maharashtra", city: "Nagpur", type: "Wholesale" },
  { id: 14, name: "Best Price Aurangabad", state: "Maharashtra", city: "Aurangabad", type: "Wholesale" },
  { id: 15, name: "Best Price Amravati", state: "Maharashtra", city: "Amravati", type: "Wholesale" },
  { id: 16, name: "Best Price Nashik", state: "Maharashtra", city: "Nashik", type: "Wholesale" },
  { id: 17, name: "Best Price Hyderabad", state: "Telangana", city: "Hyderabad", type: "Wholesale" },
  { id: 18, name: "Best Price Bangalore", state: "Karnataka", city: "Bangalore", type: "Wholesale" },
  { id: 19, name: "Best Price Chennai", state: "Tamil Nadu", city: "Chennai", type: "Wholesale" },
  { id: 20, name: "Best Price Delhi", state: "Delhi", city: "Delhi", type: "Wholesale" },
  { id: 21, name: "Best Price Jaipur", state: "Rajasthan", city: "Jaipur", type: "Wholesale" },
  { id: 22, name: "Best Price Bhopal", state: "Madhya Pradesh", city: "Bhopal", type: "Wholesale" },
  { id: 23, name: "Best Price Indore", state: "Madhya Pradesh", city: "Indore", type: "Wholesale" },
  { id: 24, name: "Best Price Kolkata", state: "West Bengal", city: "Kolkata", type: "Wholesale" },
  { id: 25, name: "Best Price Ahmedabad", state: "Gujarat", city: "Ahmedabad", type: "Wholesale" },
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

// Seasonal factors by month and region
const seasonalFactors = {
  North: {
    January: { discount: 15, reason: "Winter sales - Cold weather increases demand for warm foods and comfort items" },
    February: { discount: 10, reason: "End of winter - Transitioning to spring inventory" },
    March: { discount: 5, reason: "Spring transition - New seasonal products being introduced" },
    April: { discount: 0, reason: "Regular season - Stable demand patterns" },
    May: { discount: 5, reason: "Summer begins - Increasing demand for cooling products and beverages" },
    June: { discount: 10, reason: "Summer sales - Peak demand for seasonal items" },
    July: { discount: 15, reason: "Monsoon sales - Weather affects shopping patterns" },
    August: { discount: 20, reason: "Independence Day - Patriotic promotions and festival shopping" },
    September: { discount: 10, reason: "Festival preparation - Early stocking for upcoming festivals" },
    October: { discount: 25, reason: "Diwali season - Highest shopping period of the year" },
    November: { discount: 15, reason: "Post-festival - Clearing remaining festival inventory" },
    December: { discount: 20, reason: "Year-end sales - Holiday shopping and inventory clearance" },
  },
  South: {
    January: { discount: 10, reason: "Pongal/Sankranti - Regional festival drives specific product demand" },
    February: { discount: 5, reason: "Regular season - Standard pricing strategy" },
    March: { discount: 0, reason: "Regular season - Stable demand patterns" },
    April: { discount: 15, reason: "Tamil New Year - Regional celebrations increase shopping" },
    May: { discount: 20, reason: "Summer peak - Extreme heat drives demand for specific products" },
    June: { discount: 15, reason: "Summer sales - Continued high temperatures affect buying patterns" },
    July: { discount: 10, reason: "Regular season - Moderate demand patterns" },
    August: { discount: 15, reason: "Independence Day - National holiday shopping" },
    September: { discount: 10, reason: "Onam (Kerala) - Major regional festival increases spending" },
    October: { discount: 20, reason: "Dussehra - Festival shopping season begins" },
    November: { discount: 25, reason: "Diwali season - Peak shopping period across India" },
    December: { discount: 15, reason: "Year-end sales - Holiday promotions and inventory management" },
  },
  East: {
    January: { discount: 15, reason: "Winter sales - Seasonal demand for specific products" },
    February: { discount: 10, reason: "Regular season - Standard pricing strategy" },
    March: { discount: 5, reason: "Regular season - Stable demand patterns" },
    April: { discount: 15, reason: "Bengali New Year - Cultural celebrations drive shopping" },
    May: { discount: 10, reason: "Regular season - Standard pricing strategy" },
    June: { discount: 5, reason: "Regular season - Preparing for monsoon" },
    July: { discount: 15, reason: "Monsoon sales - Weather significantly impacts shopping behavior" },
    August: { discount: 20, reason: "Independence Day - Patriotic promotions" },
    September: { discount: 15, reason: "Durga Puja prep - Early shopping for major regional festival" },
    October: { discount: 25, reason: "Durga Puja - Biggest regional festival drives highest sales" },
    November: { discount: 15, reason: "Post-festival - Clearing remaining festival inventory" },
    December: { discount: 20, reason: "Year-end sales - Holiday shopping and inventory clearance" },
  },
  West: {
    January: { discount: 10, reason: "Winter sales - Moderate seasonal demand" },
    February: { discount: 5, reason: "Regular season - Standard pricing strategy" },
    March: { discount: 15, reason: "Gudi Padwa - Regional new year celebrations increase spending" },
    April: { discount: 10, reason: "Regular season - Transitioning to summer products" },
    May: { discount: 15, reason: "Summer sales - Heat drives demand for seasonal products" },
    June: { discount: 10, reason: "Regular season - Preparing for monsoon" },
    July: { discount: 15, reason: "Monsoon sales - Weather affects shopping patterns" },
    August: { discount: 20, reason: "Independence Day - National holiday shopping" },
    September: { discount: 25, reason: "Ganesh Chaturthi - Major regional festival drives highest sales" },
    October: { discount: 20, reason: "Dussehra - Festival shopping season" },
    November: { discount: 25, reason: "Diwali season - Peak shopping period across India" },
    December: { discount: 15, reason: "Year-end sales - Holiday promotions and inventory management" },
  },
  Central: {
    January: { discount: 15, reason: "Winter sales - Seasonal demand patterns" },
    February: { discount: 10, reason: "Regular season - Standard pricing strategy" },
    March: { discount: 5, reason: "Regular season - Stable demand patterns" },
    April: { discount: 0, reason: "Regular season - Transitioning to summer products" },
    May: { discount: 15, reason: "Summer sales - Heat drives specific product demand" },
    June: { discount: 10, reason: "Regular season - Standard pricing strategy" },
    July: { discount: 15, reason: "Monsoon sales - Weather affects shopping patterns" },
    August: { discount: 20, reason: "Independence Day - Patriotic promotions increase sales" },
    September: { discount: 10, reason: "Regular season - Preparing for festival season" },
    October: { discount: 20, reason: "Dussehra - Festival shopping begins" },
    November: { discount: 25, reason: "Diwali season - Peak shopping period across India" },
    December: { discount: 15, reason: "Year-end sales - Holiday promotions and inventory management" },
  },
}

// Map regions to states
const stateRegions = {
  "Jammu and Kashmir": "North",
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
  "Andaman and Nicobar": "East",
  Lakshadweep: "South",
}

// Sample product data for each state
const stateProducts = {
  "Jammu and Kashmir": ["Kashmiri Apples", "Saffron", "Walnuts", "Dried Fruits"],
  Punjab: ["Basmati Rice", "Wheat Flour", "Dairy Products", "Fresh Vegetables"],
  Maharashtra: ["Alphonso Mangoes", "Bombay Duck", "Vada Pav Mix", "Puran Poli Mix"],
  "Tamil Nadu": ["Rice Varieties", "Filter Coffee", "Banana Varieties", "Spices"],
  Karnataka: ["Coffee Beans", "Mysore Pak", "Ragi Products", "Spices"],
  Gujarat: ["Groundnuts", "Khakhra", "Thepla Mix", "Dhokla Mix"],
  "West Bengal": ["Rice Varieties", "Fish Products", "Sweets", "Mustard Oil"],
  Delhi: ["Ready-to-eat Meals", "Packaged Snacks", "Beverages", "Imported Foods"],
  Rajasthan: ["Bajra", "Spices", "Dals", "Papad"],
  "Uttar Pradesh": ["Desi Ghee", "Petha", "Chikankari Items", "Banarasi Pan"],
  "Himachal Pradesh": ["Apples", "Honey", "Woolen Products", "Dried Fruits"],
  Uttarakhand: ["Organic Honey", "Rajma", "Basmati Rice", "Herbs"],
  Haryana: ["Dairy Products", "Wheat", "Mustard Oil", "Pickles"],
  "Madhya Pradesh": ["Soybean Products", "Wheat", "Besan", "Chanderi Fabrics"],
  Bihar: ["Litti Chokha Mix", "Sattu", "Makhana", "Rice Products"],
  Jharkhand: ["Rice Products", "Forest Produce", "Tribal Crafts", "Pulses"],
  Odisha: ["Rice Products", "Seafood", "Handicrafts", "Dairy"],
  Assam: ["Tea Varieties", "Silk Products", "Bamboo Items", "Rice"],
  Telangana: ["Rice Varieties", "Pickles", "Biryani Spices", "Snacks"],
  "Andhra Pradesh": ["Rice Varieties", "Pickles", "Spices", "Seafood"],
  Kerala: ["Coconut Products", "Spices", "Seafood", "Banana Chips"],
  Goa: ["Seafood", "Cashews", "Coconut Products", "Feni"],
  Chhattisgarh: [
    "Rice Varieties",
    "Forest Produce",
    "Tribal Crafts",
    "Pulses",
    "Mahua Products",
    "Tendu Leaves",
    "Sal Seeds",
    "Bamboo Products",
    "Kodo Millet",
    "Ragi Products",
    "Tamarind",
    "Herbal Products",
  ],
  "Andaman and Nicobar": ["Seafood", "Coconut Products", "Spices", "Tropical Fruits"],
  Lakshadweep: ["Tuna", "Coconut Products", "Seafood", "Handicrafts"],
}

export default function IndiaMapSection() {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("January")
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("all")
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("all")

  const regions = [
    { value: "all", label: "All Regions" },
    { value: "north", label: "North India" },
    { value: "south", label: "South India" },
    { value: "east", label: "East India" },
    { value: "west", label: "West India" },
    { value: "central", label: "Central India" },
  ]

  const products = [
    { value: "all", label: "All Products" },
    { value: "dairy", label: "Dairy Products" },
    { value: "produce", label: "Fresh Produce" },
    { value: "bakery", label: "Bakery Items" },
    { value: "meat", label: "Meat & Seafood" },
    { value: "grocery", label: "Grocery Staples" },
  ]

  // Get region for the selected state
  const getRegion = (state: string) => {
    return stateRegions[state as keyof typeof stateRegions] || "North"
  }

  // Get seasonal discount recommendation
  const getSeasonalRecommendation = (state: string, month: string) => {
    const region = getRegion(state)
    return (
      seasonalFactors[region as keyof typeof seasonalFactors]?.[month as keyof (typeof seasonalFactors)["North"]] || {
        discount: 0,
        reason: "No data",
      }
    )
  }

  // Filter stores by selected state
  const filteredStores = selectedState
    ? storeLocations.filter((store) => store.state === selectedState)
    : storeLocations

  // Get products for selected state
  const stateProductList = selectedState ? stateProducts[selectedState as keyof typeof stateProducts] || [] : []

  // Generate pricing recommendation
  useEffect(() => {
    if (selectedState && selectedMonth && selectedProduct) {
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        const region = getRegion(selectedState)
        const seasonalRec = getSeasonalRecommendation(selectedState, selectedMonth)

        // Generate realistic pricing data
        const basePrice = Math.floor(Math.random() * 50) + 50
        const discountPercent = seasonalRec.discount
        const discountedPrice = basePrice * (1 - discountPercent / 100)

        // Calculate business metrics
        const baseDemand = Math.floor(Math.random() * 100) + 50
        const demandMultiplier = 1 + (discountPercent / 100) * 1.5
        const estimatedDemand = baseDemand * demandMultiplier
        const stockLevel = Math.floor(Math.random() * 200) + 100
        const actualSales = Math.min(estimatedDemand, stockLevel)
        const estimatedRevenue = actualSales * discountedPrice
        const wasteReduction = Math.max(0, actualSales - baseDemand)

        // Generate sales forecast data
        const forecastData = []
        for (let i = 0; i < 5; i++) {
          forecastData.push({
            week: `Week ${i + 1}`,
            withDiscount: Math.floor(actualSales * (0.9 + Math.random() * 0.2)),
            withoutDiscount: Math.floor(baseDemand * (0.9 + Math.random() * 0.2)),
          })
        }

        setRecommendation({
          productName: selectedProduct,
          state: selectedState,
          month: selectedMonth,
          region: region,
          basePrice: basePrice,
          discountPercent: discountPercent,
          discountedPrice: discountedPrice,
          estimatedRevenue: estimatedRevenue,
          wasteReduction: wasteReduction,
          reason: seasonalRec.reason,
          stockLevel: stockLevel,
          baseDemand: baseDemand,
          estimatedDemand: Math.floor(estimatedDemand),
          forecastData: forecastData,
        })

        setLoading(false)
      }, 1000)
    }
  }, [selectedState, selectedMonth, selectedProduct])

  return (
    <div className="space-y-6">
      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="h-5 w-5 text-purple-400" />
            India Store Location & Seasonal Pricing
          </CardTitle>
          <CardDescription className="text-gray-300">
            Select a state, month, and product to get location-specific pricing recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Column */}
        <div>
          <Card className="glow-card h-full">
            <CardContent className="p-4">
              <div className="relative w-full h-[600px] bg-gray-900 rounded-lg p-4 overflow-hidden">
                {/* India SVG Map - Using the accurate map image */}
                <svg
                  viewBox="0 0 800 900"
                  className="w-full h-full"
                  style={{ filter: "drop-shadow(0 0 10px rgba(102, 126, 234, 0.3))" }}
                >
                  {/* Use the image as a background */}
                  <image
                    href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/india.jpg-2EHPMbnE4keeJ3NWFeVJFHsX8wpnFo.jpeg"
                    width="800"
                    height="900"
                    preserveAspectRatio="xMidYMid meet"
                  />

                  {/* Overlay for interactive states */}
                  <g>
                    {/* Jammu and Kashmir */}
                    <path
                      d="M300,100 L400,80 L450,150 L350,200 L250,180 Z"
                      fill={selectedState === "Jammu and Kashmir" ? "rgba(255,0,0,0.4)" : "rgba(255,0,0,0.1)"}
                      stroke="#fff"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:fill-red-500/40 cursor-pointer"
                      onClick={() => setSelectedState("Jammu and Kashmir")}
                      onMouseEnter={() => setHoveredState("Jammu and Kashmir")}
                      onMouseLeave={() => setHoveredState(null)}
                    />

                    {/* Himachal Pradesh */}
                    <path
                      d="M300,200 L350,200 L370,230 L320,250 L280,230 Z"
                      fill={selectedState === "Himachal Pradesh" ? "rgba(255,255,0,0.4)" : "rgba(255,255,0,0.1)"}
                      stroke="#fff"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:fill-yellow-500/40 cursor-pointer"
                      onClick={() => setSelectedState("Himachal Pradesh")}
                      onMouseEnter={() => setHoveredState("Himachal Pradesh")}
                      onMouseLeave={() => setHoveredState(null)}
                    />

                    {/* Punjab */}
                    <path
                      d="M280,230 L320,250 L310,280 L270,270 Z"
                      fill={selectedState === "Punjab" ? "rgba(0,255,0,0.4)" : "rgba(0,255,0,0.1)"}
                      stroke="#fff"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:fill-green-500/40 cursor-pointer"
                      onClick={() => setSelectedState("Punjab")}
                      onMouseEnter={() => setHoveredState("Punjab")}
                      onMouseLeave={() => setHoveredState(null)}
                    />

                    {/* Uttar Pradesh */}
                    <path
                      d="M320,250 L370,230 L450,250 L430,320 L350,350 L320,300 Z"
                      fill={selectedState === "Uttar Pradesh" ? "rgba(144,238,144,0.4)" : "rgba(144,238,144,0.1)"}
                      stroke="#fff"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:fill-lime-500/40 cursor-pointer"
                      onClick={() => setSelectedState("Uttar Pradesh")}
                      onMouseEnter={() => setHoveredState("Uttar Pradesh")}
                      onMouseLeave={() => setHoveredState(null)}
                    />

                    {/* Maharashtra */}
                    <path
                      d="M250,400 L350,380 L380,450 L300,500 L200,450 Z"
                      fill={selectedState === "Maharashtra" ? "rgba(255,192,203,0.4)" : "rgba(255,192,203,0.1)"}
                      stroke="#fff"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:fill-pink-500/40 cursor-pointer"
                      onClick={() => setSelectedState("Maharashtra")}
                      onMouseEnter={() => setHoveredState("Maharashtra")}
                      onMouseLeave={() => setHoveredState(null)}
                    />

                    {/* Tamil Nadu */}
                    <path
                      d="M300,600 L350,550 L380,650 L320,700 Z"
                      fill={selectedState === "Tamil Nadu" ? "rgba(255,165,0,0.4)" : "rgba(255,165,0,0.1)"}
                      stroke="#fff"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:fill-orange-500/40 cursor-pointer"
                      onClick={() => setSelectedState("Tamil Nadu")}
                      onMouseEnter={() => setHoveredState("Tamil Nadu")}
                      onMouseLeave={() => setHoveredState(null)}
                    />

                    {/* Add more states as needed */}

                    {/* Store location pins */}
                    {filteredStores.map((store, index) => (
                      <g key={store.id} className="animate-pulse">
                        <circle cx={300 + (index % 5) * 10} cy={300 + (index % 5) * 10} r="6" fill="#ef4444" />
                        <circle
                          cx={300 + (index % 5) * 10}
                          cy={300 + (index % 5) * 10}
                          r="10"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          opacity="0.6"
                        />
                      </g>
                    ))}

                    {/* Hover tooltip */}
                    {hoveredState && (
                      <g>
                        <rect x="400" y="50" width="200" height="70" rx="5" fill="rgba(0,0,0,0.8)" />
                        <text x="500" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                          {hoveredState}
                        </text>
                        <text x="500" y="95" textAnchor="middle" fill="#a78bfa" fontSize="12">
                          {indianStates[hoveredState as keyof typeof indianStates]?.stores || 0} Walmart stores
                        </text>
                        <text x="500" y="115" textAnchor="middle" fill="#a78bfa" fontSize="12">
                          {indianStates[hoveredState as keyof typeof indianStates]?.seasonality || ""}
                        </text>
                      </g>
                    )}

                    {/* Legend */}
                    <g transform="translate(50, 800)">
                      <rect x="0" y="0" width="15" height="15" fill="#ef4444" />
                      <text x="25" y="12" fill="white" fontSize="12">
                        Walmart Best Price Store
                      </text>

                      <rect x="0" y="25" width="15" height="15" fill="rgba(102, 126, 234, 0.6)" />
                      <text x="25" y="37" fill="white" fontSize="12">
                        Selected Region
                      </text>
                    </g>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selection & Info Column */}
        <div className="space-y-4">
          <Card className="glow-card">
            <CardHeader>
              <CardTitle className="text-white">Location & Product Selection</CardTitle>
              <CardDescription className="text-gray-300">
                Choose a state, month, and product to get pricing recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Select State</label>
                <Select value={selectedState || ""} onValueChange={setSelectedState}>
                  <SelectTrigger className="select-glow">
                    <SelectValue placeholder="Choose a state" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.keys(indianStates).map((state) => (
                      <SelectItem key={state} value={state} className="text-white hover:bg-gray-800">
                        {state} ({indianStates[state as keyof typeof indianStates].stores} stores)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Select Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="select-glow">
                    <SelectValue placeholder="Choose a month" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {months.map((month) => (
                      <SelectItem key={month} value={month} className="text-white hover:bg-gray-800">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedState && (
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Select Product</label>
                  <Select value={selectedProduct || ""} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="select-glow">
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {stateProductList.map((product) => (
                        <SelectItem key={product} value={product} className="text-white hover:bg-gray-800">
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedState && (
                <Card className="bg-gray-800 border-purple-500/30">
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg text-white">{selectedState} Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Region:</span>
                      <span className="text-white">{getRegion(selectedState)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Stores:</span>
                      <span className="text-white">
                        {indianStates[selectedState as keyof typeof indianStates]?.stores || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Seasonality:</span>
                      <span className="text-white">
                        {indianStates[selectedState as keyof typeof indianStates]?.seasonality || "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedState && selectedMonth && (
                <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      {selectedMonth} Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Recommended Discount:</span>
                      <Badge className="bg-purple-600">
                        {getSeasonalRecommendation(selectedState, selectedMonth).discount}%
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-300">Reason:</span>
                      <p className="text-white mt-1">
                        {getSeasonalRecommendation(selectedState, selectedMonth).reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {loading && (
            <Card className="glow-card">
              <CardContent className="p-6">
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-white">Generating recommendation...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {recommendation && (
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Pricing Recommendation</span>
                  <Badge className="bg-green-600">{recommendation.region} Region</Badge>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {recommendation.productName} in {recommendation.state} for {recommendation.month}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"></div>
                  <div className="space-y-2">
                    <span className="text-gray-300">Base Price:</span>
                    <span className="text-white">${recommendation.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-300">Discount Percent:</span>
                    <span className="text-white">{recommendation.discountPercent}%</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-300">Discounted Price:</span>
                    <span className="text-white">${recommendation.discountedPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <span className="text-gray-300">Estimated Revenue:</span>
                    <span className="text-white">${recommendation.estimatedRevenue.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-300">Waste Reduction:</span>
                    <span className="text-white">{recommendation.wasteReduction} units</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-300">Stock Level:</span>
                    <span className="text-white">{recommendation.stockLevel} units</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-300">Base Demand:</span>
                    <span className="text-white">{recommendation.baseDemand} units</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-300">Estimated Demand:</span>
                    <span className="text-white">{recommendation.estimatedDemand} units</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
