import csv
import time
import random
import os
from datetime import datetime, timedelta

class InventorySimulator:
    def __init__(self, csv_path="public/data/grocery-inventory.csv"):
        self.csv_path = csv_path
        self.products = []
        self.load_initial_data()
    
    def load_initial_data(self):
        """Load initial product data"""
        try:
            with open(self.csv_path, 'r') as file:
                reader = csv.DictReader(file)
                self.products = list(reader)
            print(f"Loaded {len(self.products)} products for simulation")
        except FileNotFoundError:
            print(f"CSV file not found: {self.csv_path}")
            self.create_sample_data()
    
    def create_sample_data(self):
        """Create sample data if CSV doesn't exist"""
        self.products = [
            {
                'product_id': '01-903-5373',
                'name': 'Organic Bananas',
                'current_price': '2.50',
                'expiry_date': '2024-06-08',
                'stock_left': '156',
                'category': 'Fruits & Vegetables'
            },
            {
                'product_id': '02-445-1122',
                'name': 'Greek Yogurt', 
                'current_price': '4.99',
                'expiry_date': '2024-06-12',
                'stock_left': '78',
                'category': 'Dairy'
            },
            {
                'product_id': '03-778-9900',
                'name': 'Fresh Salmon Fillet',
                'current_price': '18.99', 
                'expiry_date': '2024-06-03',
                'stock_left': '32',
                'category': 'Seafood'
            }
        ]
    
    def simulate_stock_changes(self):
        """Simulate realistic stock level changes"""
        for product in self.products:
            current_stock = int(product['stock_left'])
            
            # Simulate sales (stock decreases)
            if random.random() < 0.7:  # 70% chance of sales
                sales = random.randint(1, min(10, current_stock))
                current_stock = max(0, current_stock - sales)
            
            # Simulate restocking (occasional stock increases)
            if random.random() < 0.1 and current_stock < 20:  # 10% chance of restocking when low
                restock = random.randint(20, 100)
                current_stock += restock
                print(f"Restocked {product['name']}: +{restock} units")
            
            product['stock_left'] = str(current_stock)
            
            # Update timestamp
            product['updated_at'] = datetime.now().isoformat()
    
    def simulate_price_changes(self):
        """Simulate dynamic price changes based on stock and expiry"""
        for product in self.products:
            base_price = float(product['current_price'])
            stock_left = int(product['stock_left'])
            
            # Calculate days to expiry
            expiry_date = datetime.strptime(product['expiry_date'], '%Y-%m-%d')
            days_to_expiry = (expiry_date - datetime.now()).days
            
            # Price adjustment factors
            price_multiplier = 1.0
            
            # Expiry-based pricing
            if days_to_expiry <= 1:
                price_multiplier *= 0.6  # 40% off
            elif days_to_expiry <= 3:
                price_multiplier *= 0.75  # 25% off
            elif days_to_expiry <= 7:
                price_multiplier *= 0.85  # 15% off
            
            # Stock-based pricing
            if stock_left > 100:
                price_multiplier *= 0.9  # 10% off for overstocked
            elif stock_left < 10:
                price_multiplier *= 1.1  # 10% markup for low stock
            
            # Apply random market fluctuation
            price_multiplier *= (0.95 + random.random() * 0.1)  # ±5% random variation
            
            new_price = round(base_price * price_multiplier, 2)
            product['recommended_price'] = str(new_price)
            product['price_change'] = str(round(new_price - base_price, 2))
    
    def append_to_csv(self):
        """Append updated data to CSV file"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.csv_path), exist_ok=True)
            
            # Write updated data
            with open(self.csv_path, 'w', newline='') as file:
                if self.products:
                    fieldnames = self.products[0].keys()
                    writer = csv.DictWriter(file, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(self.products)
            
            print(f"Updated {len(self.products)} products in {self.csv_path}")
            
        except Exception as e:
            print(f"Error writing to CSV: {e}")
    
    def run_simulation(self, duration_minutes=60, update_interval_seconds=10):
        """Run the simulation for specified duration"""
        print(f"Starting inventory simulation for {duration_minutes} minutes...")
        print(f"Updates every {update_interval_seconds} seconds")
        
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        
        while time.time() < end_time:
            # Simulate changes
            self.simulate_stock_changes()
            self.simulate_price_changes()
            
            # Update CSV file
            self.append_to_csv()
            
            # Print status
            current_time = datetime.now().strftime("%H:%M:%S")
            print(f"[{current_time}] Simulation update completed")
            
            # Wait for next update
            time.sleep(update_interval_seconds)
        
        print("Simulation completed!")

if __name__ == "__main__":
    simulator = InventorySimulator()
    
    # Run simulation for 30 minutes with updates every 5 seconds
    simulator.run_simulation(duration_minutes=30, update_interval_seconds=5)
