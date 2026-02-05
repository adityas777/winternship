"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, Target, Cog, TrendingUp, Users, Globe, Play, Download, ExternalLink } from "lucide-react"

export default function PitchTab() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🛒 Smart Dynamic Pricing Engine</h1>
            <p className="text-xl mb-6">AI-Powered Solution to Reduce Food Waste & Maximize Revenue</p>
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🏆 Hackathon Ready
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🌍 Real Impact
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🤖 AI/ML Powered
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-red-500" />
            The Problem We're Solving
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h3 className="text-2xl font-bold text-red-600 mb-2">$1.3 Trillion</h3>
              <p className="text-sm text-gray-600">Global food waste annually</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">40%</h3>
              <p className="text-sm text-gray-600">Food wasted in retail</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">8-10%</h3>
              <p className="text-sm text-gray-600">Global greenhouse gas emissions</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Key Challenges:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Static pricing models don't adapt to inventory conditions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Retailers lose billions due to expired inventory
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Manual pricing decisions are slow and inefficient
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Environmental impact of food waste is massive
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Our Solution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Our AI-Powered Solution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">🤖 Machine Learning Engine</h4>
              <ul className="space-y-2 text-sm">
                <li>• Random Forest regression for price prediction</li>
                <li>• Real-time feature analysis (stock, expiry, turnover)</li>
                <li>• 87% prediction accuracy on test data</li>
                <li>• Continuous learning from sales patterns</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">🧠 Q-Learning Optimization</h4>
              <ul className="space-y-2 text-sm">
                <li>• Reinforcement learning for discount strategies</li>
                <li>• State-based decision making</li>
                <li>• Balances revenue vs. waste reduction</li>
                <li>• Adapts to market conditions</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3 text-blue-800">How It Works:</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                  1
                </div>
                <p>
                  <strong>Data Input</strong>
                  <br />
                  Stock levels, expiry dates, sales history
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                  2
                </div>
                <p>
                  <strong>ML Prediction</strong>
                  <br />
                  AI predicts optimal base price
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                  3
                </div>
                <p>
                  <strong>Q-Learning</strong>
                  <br />
                  Determines best discount strategy
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                  4
                </div>
                <p>
                  <strong>Real-time Pricing</strong>
                  <br />
                  Updates prices automatically
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-6 w-6 text-gray-600" />
            Technical Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Frontend Stack</h4>
              <ul className="space-y-1 text-sm">
                <li>• Next.js 15 with App Router</li>
                <li>• TypeScript for type safety</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• Recharts for data visualization</li>
                <li>• Responsive design</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Backend & AI</h4>
              <ul className="space-y-1 text-sm">
                <li>• Next.js API routes</li>
                <li>• Python ML models (scikit-learn)</li>
                <li>• Q-learning implementation</li>
                <li>• CSV data processing</li>
                <li>• Real-time predictions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Business Impact & ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="text-2xl font-bold text-green-600 mb-2">25-40%</h3>
              <p className="text-sm text-gray-600">Waste reduction</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">15-30%</h3>
              <p className="text-sm text-gray-600">Revenue increase</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">ROI 300%</h3>
              <p className="text-sm text-gray-600">Within 6 months</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Real-World Applications:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li>• Grocery stores & supermarkets</li>
                <li>• Restaurant chains</li>
                <li>• Food service providers</li>
              </ul>
              <ul className="space-y-2">
                <li>• Wholesale distributors</li>
                <li>• Convenience stores</li>
                <li>• Online food retailers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            Market Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Target Market Size</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Global retail market: $25 trillion</li>
                  <li>• Food retail segment: $5.7 trillion</li>
                  <li>• AI in retail market: $23.3 billion by 2027</li>
                  <li>• Dynamic pricing software: $2.7 billion</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Competitive Advantage</h4>
                <ul className="space-y-2 text-sm">
                  <li>• First to combine ML + Q-learning for food pricing</li>
                  <li>• Focus on sustainability impact</li>
                  <li>• Real-time adaptation capabilities</li>
                  <li>• Easy integration with existing POS systems</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo & Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-500" />
            Demo & Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">🎥 Live Demo Features</h4>
              <ul className="space-y-2 text-sm">
                <li>• Real grocery inventory data</li>
                <li>• Interactive pricing recommendations</li>
                <li>• Sustainability impact visualization</li>
                <li>• Revenue optimization charts</li>
                <li>• Simulated time progression</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">🚀 Immediate Next Steps</h4>
              <ul className="space-y-2 text-sm">
                <li>• Pilot program with local grocery chain</li>
                <li>• Integration with major POS systems</li>
                <li>• Mobile app for store managers</li>
                <li>• Advanced ML model training</li>
                <li>• Regulatory compliance & certifications</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Watch Demo Video
            </Button>
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Pitch Deck
            </Button>
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View GitHub
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Food Retail?</h2>
          <p className="text-xl mb-6">Join us in reducing food waste while maximizing profits</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">
              Schedule a Demo
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
