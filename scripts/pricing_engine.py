import pathway as pw
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import json

class LivePricingEngine:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False
        self.price_history = {}
        
    def train_model(self, historical_data):
        """Train the pricing model with historical data"""
        # Feature engineering
        features = self._extract_features(historical_data)
        targets = historical_data['optimal_price'].values
        
        self.model.fit(features, targets)
        self.is_trained = True
        print("Pricing model trained successfully")
    
    def _extract_features(self, data):
        """Extract features for pricing model"""
        features = []
        for _, row in data.iterrows():
            # Days until expiry
            expiry_date = pd.to_datetime(row['expiry_date'])
            days_to_expiry = (expiry_date - datetime.now()).days
            
            # Stock ratio (current/max)
            stock_ratio = row['stock_left'] / 100  # Assuming max stock is 100
            
            # Price features
            current_price = row['current_price']
            
            # Category encoding (simplified)
            category_encoding = hash(row['category']) % 10
            
            features.append([
                days_to_expiry,
                stock_ratio,
                current_price,
                category_encoding,
                row['stock_left']
            ])
        
        return np.array(features)
    
    def calculate_dynamic_price(self, product_data):
        """Calculate dynamic price for a product"""
        if not self.is_trained:
            # Simple rule-based pricing if model not trained
            return self._rule_based_pricing(product_data)
        
        features = self._extract_features(pd.DataFrame([product_data]))
        predicted_price = self.model.predict(features)[0]
        
        # Apply business constraints
        min_price = product_data['current_price'] * 0.7  # Max 30% discount
        max_price = product_data['current_price'] * 1.3  # Max 30% markup
        
        final_price = np.clip(predicted_price, min_price, max_price)
        
        return round(final_price, 2)
    
    def _rule_based_pricing(self, product_data):
        """Fallback rule-based pricing"""
        base_price = product_data['current_price']
        
        # Days until expiry factor
        expiry_date = pd.to_datetime(product_data['expiry_date'])
        days_to_expiry = (expiry_date - datetime.now()).days
        
        if days_to_expiry <= 1:
            discount = 0.4  # 40% off
        elif days_to_expiry <= 3:
            discount = 0.25  # 25% off
        elif days_to_expiry <= 7:
            discount = 0.15  # 15% off
        else:
            discount = 0
        
        # Stock level factor
        stock_left = product_data['stock_left']
        if stock_left > 50:
            discount += 0.1  # Additional 10% off for overstocked items
        elif stock_left < 10:
            discount -= 0.1  # 10% markup for low stock
        
        final_price = base_price * (1 - discount)
        return round(max(final_price, base_price * 0.5), 2)  # Minimum 50% of original price

# Initialize the pricing engine
pricing_engine = LivePricingEngine()

def process_inventory_update(product_data):
    """Process new inventory data and update pricing"""
    new_price = pricing_engine.calculate_dynamic_price(product_data)
    
    # Update the product data with new price
    product_data['recommended_price'] = new_price
    product_data['price_change'] = new_price - product_data['current_price']
    product_data['updated_at'] = datetime.now().isoformat()
    
    return product_data
