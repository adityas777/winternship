"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StateData {
  name: string
  color: string
  sales: number
  revenue: number
  stores: number
}

export default function IndiaMap() {
  const [selectedState, setSelectedState] = useState<StateData | null>(null)

  // State data with realistic metrics
  const stateData: Record<string, StateData> = {
    "Jammu and Kashmir": {
      name: "Jammu and Kashmir",
      color: "#FF6B6B",
      sales: 1245000,
      revenue: 3750000,
      stores: 42,
    },
    "Himachal Pradesh": {
      name: "Himachal Pradesh",
      color: "#FFD93D",
      sales: 876000,
      revenue: 2340000,
      stores: 28,
    },
    Punjab: {
      name: "Punjab",
      color: "#6BCB77",
      sales: 2450000,
      revenue: 6780000,
      stores: 87,
    },
    Uttarakhand: {
      name: "Uttarakhand",
      color: "#4D96FF",
      sales: 945000,
      revenue: 2560000,
      stores: 34,
    },
    Haryana: {
      name: "Haryana",
      color: "#9D65C9",
      sales: 1870000,
      revenue: 5230000,
      stores: 65,
    },
    Rajasthan: {
      name: "Rajasthan",
      color: "#C490E4",
      sales: 2340000,
      revenue: 5890000,
      stores: 79,
    },
    "Uttar Pradesh": {
      name: "Uttar Pradesh",
      color: "#A0E4CB",
      sales: 4560000,
      revenue: 10780000,
      stores: 156,
    },
    Bihar: {
      name: "Bihar",
      color: "#CDF0EA",
      sales: 2870000,
      revenue: 6450000,
      stores: 92,
    },
    Sikkim: {
      name: "Sikkim",
      color: "#97D2EC",
      sales: 345000,
      revenue: 980000,
      stores: 12,
    },
    "Arunachal Pradesh": {
      name: "Arunachal Pradesh",
      color: "#FF9F29",
      sales: 456000,
      revenue: 1230000,
      stores: 18,
    },
    Nagaland: {
      name: "Nagaland",
      color: "#A6D1E6",
      sales: 387000,
      revenue: 1050000,
      stores: 15,
    },
    Manipur: {
      name: "Manipur",
      color: "#BFDB38",
      sales: 423000,
      revenue: 1180000,
      stores: 17,
    },
    Mizoram: {
      name: "Mizoram",
      color: "#F7EC09",
      sales: 312000,
      revenue: 890000,
      stores: 11,
    },
    Tripura: {
      name: "Tripura",
      color: "#F1C93B",
      sales: 378000,
      revenue: 1020000,
      stores: 14,
    },
    Meghalaya: {
      name: "Meghalaya",
      color: "#43919B",
      sales: 356000,
      revenue: 970000,
      stores: 13,
    },
    Assam: {
      name: "Assam",
      color: "#30E3DF",
      sales: 1240000,
      revenue: 3450000,
      stores: 45,
    },
    "West Bengal": {
      name: "West Bengal",
      color: "#BCF2C2",
      sales: 3450000,
      revenue: 8760000,
      stores: 112,
    },
    Jharkhand: {
      name: "Jharkhand",
      color: "#F9F9C5",
      sales: 1560000,
      revenue: 3980000,
      stores: 54,
    },
    Odisha: {
      name: "Odisha",
      color: "#F8BDEB",
      sales: 1780000,
      revenue: 4560000,
      stores: 62,
    },
    Chhattisgarh: {
      name: "Chhattisgarh",
      color: "#C9F4AA",
      sales: 1340000,
      revenue: 3450000,
      stores: 48,
    },
    "Madhya Pradesh": {
      name: "Madhya Pradesh",
      color: "#F6C6EA",
      sales: 2670000,
      revenue: 6780000,
      stores: 89,
    },
    Gujarat: {
      name: "Gujarat",
      color: "#FFF89A",
      sales: 3450000,
      revenue: 8970000,
      stores: 118,
    },
    Maharashtra: {
      name: "Maharashtra",
      color: "#FFC4C4",
      sales: 5670000,
      revenue: 14560000,
      stores: 187,
    },
    Goa: {
      name: "Goa",
      color: "#FFEBA1",
      sales: 567000,
      revenue: 1780000,
      stores: 22,
    },
    Karnataka: {
      name: "Karnataka",
      color: "#A6CF98",
      sales: 3780000,
      revenue: 9870000,
      stores: 128,
    },
    Telangana: {
      name: "Telangana",
      color: "#F3B664",
      sales: 2340000,
      revenue: 6120000,
      stores: 82,
    },
    "Andhra Pradesh": {
      name: "Andhra Pradesh",
      color: "#FF9B9B",
      sales: 2890000,
      revenue: 7450000,
      stores: 98,
    },
    "Tamil Nadu": {
      name: "Tamil Nadu",
      color: "#FFD59E",
      sales: 3560000,
      revenue: 9230000,
      stores: 124,
    },
    Kerala: {
      name: "Kerala",
      color: "#A0E9FF",
      sales: 2450000,
      revenue: 6780000,
      stores: 87,
    },
    "Andaman and Nicobar": {
      name: "Andaman and Nicobar",
      color: "#CEEDC7",
      sales: 234000,
      revenue: 670000,
      stores: 8,
    },
    Lakshadweep: {
      name: "Lakshadweep",
      color: "#FFF5E4",
      sales: 89000,
      revenue: 245000,
      stores: 3,
    },
  }

  return (
    <div className="space-y-6">
      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="text-white">India - State-wise Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <TooltipProvider>
                <div className="relative w-full">
                  {/* Use the provided India map image */}
                  <img
                    src="/india.jpg"
                    alt="Map of India showing states"
                    className="w-full h-auto"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                  />

                  {/* Interactive overlay for states */}
                  <div className="absolute inset-0">
                    {Object.entries(stateData).map(([key, state]) => {
                      const stateCoordinates: Record<string, { left: string; top: string }> = {
                        "Jammu and Kashmir": { left: "25%", top: "8%" },
                        "Himachal Pradesh": { left: "30%", top: "15%" },
                        Punjab: { left: "28%", top: "18%" },
                        Uttarakhand: { left: "35%", top: "20%" },
                        Haryana: { left: "32%", top: "22%" },
                        Rajasthan: { left: "25%", top: "30%" },
                        "Uttar Pradesh": { left: "38%", top: "25%" },
                        Bihar: { left: "45%", top: "30%" },
                        Sikkim: { left: "52%", top: "22%" },
                        "Arunachal Pradesh": { left: "60%", top: "18%" },
                        Nagaland: { left: "62%", top: "28%" },
                        Manipur: { left: "60%", top: "32%" },
                        Mizoram: { left: "58%", top: "35%" },
                        Tripura: { left: "55%", top: "35%" },
                        Meghalaya: { left: "55%", top: "30%" },
                        Assam: { left: "58%", top: "28%" },
                        "West Bengal": { left: "50%", top: "35%" },
                        Jharkhand: { left: "45%", top: "35%" },
                        Odisha: { left: "48%", top: "42%" },
                        Chhattisgarh: { left: "42%", top: "40%" },
                        "Madhya Pradesh": { left: "35%", top: "38%" },
                        Gujarat: { left: "22%", top: "40%" },
                        Maharashtra: { left: "30%", top: "48%" },
                        Goa: { left: "28%", top: "58%" },
                        Karnataka: { left: "32%", top: "60%" },
                        Telangana: { left: "38%", top: "52%" },
                        "Andhra Pradesh": { left: "40%", top: "58%" },
                        "Tamil Nadu": { left: "38%", top: "68%" },
                        Kerala: { left: "32%", top: "72%" },
                        "Andaman and Nicobar": { left: "65%", top: "65%" },
                        Lakshadweep: { left: "25%", top: "68%" },
                      }

                      const coords = stateCoordinates[state.name] || { left: "50%", top: "50%" }

                      return (
                        <Tooltip key={key}>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute cursor-pointer hover:opacity-70 transition-all duration-200 flex items-center justify-center group"
                              style={{
                                left: coords.left,
                                top: coords.top,
                                transform: "translate(-50%, -50%)",
                              }}
                              onClick={() => setSelectedState(state)}
                            >
                              <div
                                className="relative"
                                style={{
                                  width: selectedState?.name === state.name ? "16px" : "12px",
                                  height: selectedState?.name === state.name ? "16px" : "12px",
                                  borderRadius: "50%",
                                  backgroundColor: state.color,
                                  border: "2px solid white",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                  transition: "all 0.2s ease",
                                }}
                              />
                              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <div className="bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                  {state.name}
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <div className="text-sm">
                              <p className="font-bold">{state.name}</p>
                              <p>Sales: ₹{(state.sales / 1000000).toFixed(2)}M</p>
                              <p>Stores: {state.stores}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
              </TooltipProvider>
            </div>

            <div className="flex-1">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {selectedState ? selectedState.name : "Select a state"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedState ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Annual Sales</p>
                        <p className="text-2xl font-bold text-white">₹{(selectedState.sales / 1000000).toFixed(2)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Revenue</p>
                        <p className="text-2xl font-bold text-green-400">
                          ₹{(selectedState.revenue / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Store Count</p>
                        <p className="text-2xl font-bold text-blue-400">{selectedState.stores}</p>
                      </div>
                      <div className="pt-4">
                        <Badge className="bg-purple-600 text-white">Region: {getRegion(selectedState.name)}</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Click on a state to view detailed information</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400">Total Sales</p>
                    <p className="text-xl font-bold text-white">
                      ₹{(Object.values(stateData).reduce((sum, state) => sum + state.sales, 0) / 1000000).toFixed(2)}M
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400">Total Stores</p>
                    <p className="text-xl font-bold text-white">
                      {Object.values(stateData).reduce((sum, state) => sum + state.stores, 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to determine region based on state name
function getRegion(stateName: string): string {
  const northStates = [
    "Jammu and Kashmir",
    "Himachal Pradesh",
    "Punjab",
    "Uttarakhand",
    "Haryana",
    "Delhi",
    "Rajasthan",
    "Uttar Pradesh",
  ]
  const southStates = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"]
  const eastStates = [
    "West Bengal",
    "Bihar",
    "Jharkhand",
    "Odisha",
    "Assam",
    "Arunachal Pradesh",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura",
  ]
  const westStates = ["Maharashtra", "Gujarat", "Goa"]
  const centralStates = ["Madhya Pradesh", "Chhattisgarh"]

  if (northStates.includes(stateName)) return "North"
  if (southStates.includes(stateName)) return "South"
  if (eastStates.includes(stateName)) return "East"
  if (westStates.includes(stateName)) return "West"
  if (centralStates.includes(stateName)) return "Central"
  return "Other"
}
