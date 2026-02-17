"""
API Endpoints Testing Script

This script tests all the API endpoints we've built for the Smart Pricing system.
It demonstrates the complete API functionality and validates responses.
"""

import asyncio
import json
import time
from datetime import datetime
import aiohttp

class APITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.test_results = []
        
    def log_test(self, endpoint: str, method: str, status: int, response_time: float, success: bool):
        """Log test results"""
        self.test_results.append({
            "endpoint": endpoint,
            "method": method,
            "status": status,
            "response_time": response_time,
            "success": success,
            "timestamp": datetime.now().isoformat()
        })
        
        status_icon = "✅" if success else "❌"
        print(f"   {status_icon} {method} {endpoint} - {status} ({response_time:.2f}s)")
    
    async def test_endpoint(self, session: aiohttp.ClientSession, endpoint: str, method: str = "GET", data: dict = None):
        """Test a single API endpoint"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                async with session.get(url) as response:
                    response_time = time.time() - start_time
                    success = response.status < 400
                    self.log_test(endpoint, method, response.status, response_time, success)
                    return await response.json() if success else None
            
            elif method == "POST":
                async with session.post(url, json=data) as response:
                    response_time = time.time() - start_time
                    success = response.status < 400
                    self.log_test(endpoint, method, response.status, response_time, success)
                    return await response.json() if success else None
                    
        except Exception as e:
            response_time = time.time() - start_time
            self.log_test(endpoint, method, 0, response_time, False)
            print(f"   ❌ Error testing {endpoint}: {str(e)}")
            return None
    
    async def run_api_tests(self):
        """Run comprehensive API tests"""
        print("🧪 Starting API Endpoint Testing")
        print("="*50)
        
        async with aiohttp.ClientSession() as session:
            # Test basic product endpoints
            print("\n📦 Testing Product Endpoints:")
            await self.test_endpoint(session, "/api/products")
            await self.test_endpoint(session, "/api/products/custom")
            
            # Test pricing recommendation endpoints
            print("\n💰 Testing Pricing Recommendation Endpoints:")
            pricing_data = {"productName": "Organic Bananas", "currentDay": 1}
            await self.test_endpoint(session, "/api/pricing-recommendation", "POST", pricing_data)
            await self.test_endpoint(session, "/api/pricing-recommendation/custom", "POST", pricing_data)
            
            # Test live dashboard endpoints
            print("\n📊 Testing Live Dashboard Endpoints:")
            await self.test_endpoint(session, "/api/live-dashboard")
            await self.test_endpoint(session, "/api/live-dashboard?action=alerts")
            await self.test_endpoint(session, "/api/live-dashboard?action=metrics")
            await self.test_endpoint(session, "/api/live-dashboard?action=trending")
            await self.test_endpoint(session, "/api/live-dashboard?action=updates")
            await self.test_endpoint(session, "/api/live-dashboard?action=refresh")
            
            # Test live dashboard POST endpoints
            alert_data = {
                "action": "add_alert",
                "data": {
                    "type": "price_change",
                    "severity": "medium",
                    "product_name": "Test Product",
                    "message": "Test alert message",
                    "action_required": True
                }
            }
            await self.test_endpoint(session, "/api/live-dashboard", "POST", alert_data)
            
            price_update_data = {
                "action": "simulate_price_update",
                "data": {
                    "product_name": "Test Product",
                    "old_price": 5.99,
                    "new_price": 4.99
                }
            }
            await self.test_endpoint(session, "/api/live-dashboard", "POST", price_update_data)
            
            # Test vector search endpoints
            print("\n🔍 Testing Vector Search Endpoints:")
            await self.test_endpoint(session, "/api/vector-search")
            
            search_data = {"query": "dairy products", "limit": 5}
            await self.test_endpoint(session, "/api/vector-search", "POST", search_data)
            
            # Test pathway endpoints
            print("\n🌊 Testing Pathway Framework Endpoints:")
            await self.test_endpoint(session, "/api/pathway-stream")
            
            # Test data status endpoints
            print("\n📋 Testing Data Management Endpoints:")
            await self.test_endpoint(session, "/api/data-status")
            await self.test_endpoint(session, "/api/export-report")
            
            # Test live stream endpoint (SSE)
            print("\n📡 Testing Live Stream Endpoint:")
            await self.test_endpoint(session, "/api/live-stream")
        
        # Display test summary
        self.display_test_summary()
    
    def display_test_summary(self):
        """Display comprehensive test results"""
        print("\n" + "="*50)
        print("📊 API TEST SUMMARY")
        print("="*50)
        
        total_tests = len(self.test_results)
        successful_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = total_tests - successful_tests
        
        print(f"\n📈 Overall Results:")
        print(f"   • Total Tests: {total_tests}")
        print(f"   • Successful: {successful_tests}")
        print(f"   • Failed: {failed_tests}")
        print(f"   • Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        # Response time analysis
        response_times = [t["response_time"] for t in self.test_results if t["success"]]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            min_response_time = min(response_times)
            
            print(f"\n⏱️  Response Time Analysis:")
            print(f"   • Average: {avg_response_time:.3f}s")
            print(f"   • Fastest: {min_response_time:.3f}s")
            print(f"   • Slowest: {max_response_time:.3f}s")
        
        # Endpoint breakdown
        endpoint_stats = {}
        for test in self.test_results:
            endpoint = test["endpoint"]
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {"total": 0, "success": 0}
            endpoint_stats[endpoint]["total"] += 1
            if test["success"]:
                endpoint_stats[endpoint]["success"] += 1
        
        print(f"\n🔗 Endpoint Performance:")
        for endpoint, stats in endpoint_stats.items():
            success_rate = (stats["success"] / stats["total"]) * 100
            status_icon = "✅" if success_rate == 100 else "⚠️" if success_rate > 0 else "❌"
            print(f"   {status_icon} {endpoint}: {success_rate:.0f}% ({stats['success']}/{stats['total']})")
        
        # Failed tests details
        failed_tests_list = [t for t in self.test_results if not t["success"]]
        if failed_tests_list:
            print(f"\n❌ Failed Tests Details:")
            for test in failed_tests_list:
                print(f"   • {test['method']} {test['endpoint']} - Status: {test['status']}")
        
        print(f"\n🎯 Recommendations:")
        if failed_tests == 0:
            print("   • All API endpoints are functioning correctly!")
            print("   • System is ready for production deployment")
        else:
            print("   • Review failed endpoints and fix issues")
            print("   • Ensure all services are running properly")
            print("   • Check network connectivity and configurations")

async def main():
    """Main testing function"""
    tester = APITester()
    await tester.run_api_tests()

if __name__ == "__main__":
    print("🚀 Starting API Endpoint Testing Suite")
    print("This will test all endpoints in the Smart Pricing system...\n")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
    except Exception as e:
        print(f"\n❌ Testing failed with error: {str(e)}")
    
    print("\n" + "="*50)
    print("API testing completed!")
    print("="*50)
