import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import json
import pickle
import os
from typing import Dict, List, Any, Optional, Tuple
import threading
import time

class RealtimePricingModel:
    def __init__(self, model_path="data/pricing_model.pkl"):
        self.model_path = model_path
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = []
        self.price_history = {}
        self.model_performance = {}
        self.last_training_time = None
        
        # Q-learning parameters for dynamic pricing
        self.q_table = {}
        self.learning_rate = 0.1
        self.discount_factor = 0.95
        self.epsilon = 0.1  # Exploration rate
        
        # Real-time processing
        self.processing_queue = []
        self.queue_lock = threading.Lock()
        self.is_processing = False
        
    def extract_features(self, product_data: Dict[str, Any]) -> np.ndarray:
        """Extract features for pricing model"""
        features = []
        
        # Basic product features
        current_price = float(product_data.get('current_price', 0))
        stock_left = int(product_data.get('stock_left', 0))
        
        # Time-based features
        if 'expiry_date' in product_data:
            try:
                expiry_date = pd.to_datetime(product_data['expiry_date'])
                days_to_expiry = (expiry_date - pd.Timestamp.now()).days
                hours_to_expiry = (expiry_date - pd.Timestamp.now()).total_seconds() / 3600
            except:
                days_to_expiry = 7
                hours_to_expiry = 168
        else:
            days_to_expiry = 7
            hours_to_expiry = 168
        
        # Stock features
        stock_ratio = min(stock_left / 100, 2.0)  # Normalize stock level
        stock_velocity = self.calculate_stock_velocity(product_data.get('product_id', ''))
        
        # Price features
        price_elasticity = self.estimate_price_elasticity(product_data)
        historical_discount = self.get_historical_discount(product_data.get('product_id', ''))
        
        # Market features
        category_demand = self.get_category_demand(product_data.get('category', 'Unknown'))
        seasonal_factor = self.get_seasonal_factor(product_data.get('category', 'Unknown'))
        
        # Competition features
        competitor_price_ratio = self.get_competitor_price_ratio(product_data)
        
        # Urgency features
        urgency_score = self.calculate_urgency_score(days_to_expiry, stock_left)
        
        # Profitability features
        margin_potential = current_price * 0.3  # Assume 30% base margin
        
        features = [
            current_price,
            stock_left,
            days_to_expiry,
            hours_to_expiry,
            stock_ratio,
            stock_velocity,
            price_elasticity,
            historical_discount,
            category_demand,
            seasonal_factor,
            competitor_price_ratio,
            urgency_score,
            margin_potential,
            # Interaction features
            days_to_expiry * stock_ratio,
            current_price * urgency_score,
            stock_velocity * price_elasticity
        ]
        
        return np.array(features).reshape(1, -1)
    
    def calculate_stock_velocity(self, product_id: str) -> float:
        """Calculate how fast stock is moving"""
        if product_id in self.price_history:
            history = self.price_history[product_id]
            if len(history) >= 2:
                recent_stocks = [entry['stock_left'] for entry in history[-5:]]
                if len(recent_stocks) >= 2:
                    velocity = (recent_stocks[0] - recent_stocks[-1]) / len(recent_stocks)
                    return max(0, velocity)  # Positive velocity means stock is decreasing
        return 5.0  # Default velocity
    
    def estimate_price_elasticity(self, product_data: Dict[str, Any]) -> float:
        """Estimate price elasticity based on category and historical data"""
        category = product_data.get('category', 'Unknown').lower()
        
        # Category-based elasticity estimates
        elasticity_map = {
            'fruits & vegetables': -1.2,  # Elastic
            'dairy': -0.8,
            'meat': -0.6,
            'seafood': -0.7,
            'bakery': -1.0,
            'beverages': -0.9,
            'pantry': -0.4  # Inelastic
        }
        
        base_elasticity = elasticity_map.get(category, -0.8)
        
        # Adjust based on price level
        price = float(product_data.get('current_price', 5))
        if price > 15:
            base_elasticity *= 1.2  # More elastic for expensive items
        elif price < 3:
            base_elasticity *= 0.8  # Less elastic for cheap items
        
        return base_elasticity
    
    def get_historical_discount(self, product_id: str) -> float:
        """Get average historical discount for this product"""
        if product_id in self.price_history:
            history = self.price_history[product_id]
            discounts = [entry.get('discount_applied', 0) for entry in history]
            return np.mean(discounts) if discounts else 0
        return 0
    
    def get_category_demand(self, category: str) -> float:
        """Get category demand multiplier"""
        # Time-based demand patterns
        current_hour = datetime.now().hour
        day_of_week = datetime.now().weekday()
        
        demand_multiplier = 1.0
        
        # Peak hours (lunch and dinner)
        if 11 <= current_hour <= 13 or 17 <= current_hour <= 19:
            demand_multiplier *= 1.3
        elif 6 <= current_hour <= 9:  # Breakfast
            demand_multiplier *= 1.1
        
        # Weekend effect
        if day_of_week >= 5:  # Weekend
            demand_multiplier *= 1.2
        
        return demand_multiplier
    
    def get_seasonal_factor(self, category: str) -> float:
        """Get seasonal demand factor"""
        month = datetime.now().month
        category_lower = category.lower()
        
        if 'fruits' in category_lower or 'vegetables' in category_lower:
            # Summer boost for fresh produce
            if 5 <= month <= 8:
                return 1.2
            elif month in [12, 1, 2]:
                return 0.9
        elif 'dairy' in category_lower:
            # Stable year-round
            return 1.0
        elif 'meat' in category_lower or 'seafood' in category_lower:
            # Holiday boost
            if month in [11, 12]:
                return 1.3
        
        return 1.0
    
    def get_competitor_price_ratio(self, product_data: Dict[str, Any]) -> float:
        """Estimate competitor price ratio (mock implementation)"""
        # In production, this would fetch real competitor data
        base_price = float(product_data.get('current_price', 5))
        category = product_data.get('category', 'Unknown').lower()
        
        # Simulate competitor pricing
        if 'premium' in product_data.get('name', '').lower():
            return 0.95  # Slightly below premium competitors
        elif 'organic' in product_data.get('name', '').lower():
            return 1.05  # Organic premium
        else:
            return 1.0  # Market average
    
    def calculate_urgency_score(self, days_to_expiry: int, stock_left: int) -> float:
        """Calculate urgency score for pricing decisions"""
        expiry_urgency = max(0, (7 - days_to_expiry) / 7)  # 0-1 scale
        stock_urgency = min(stock_left / 20, 1.0)  # 0-1 scale, inverted
        stock_urgency = 1 - stock_urgency  # Higher stock = lower urgency
        
        # Combine urgencies with weights
        urgency_score = (expiry_urgency * 0.7) + (stock_urgency * 0.3)
        return urgency_score
    
    def train_model(self, training_data: List[Dict[str, Any]]):
        """Train the pricing model with historical data"""
        if not training_data:
            print("No training data provided")
            return False
        
        print(f"Training pricing model with {len(training_data)} samples...")
        
        # Extract features and targets
        X = []
        y = []
        
        for sample in training_data:
            features = self.extract_features(sample).flatten()
            optimal_price = sample.get('optimal_price', sample.get('current_price', 0))
            
            X.append(features)
            y.append(optimal_price)
        
        X = np.array(X)
        y = np.array(y)
        
        if len(X) == 0:
            print("No valid training samples")
            return False
        
        # Store feature names
        self.feature_names = [
            'current_price', 'stock_left', 'days_to_expiry', 'hours_to_expiry',
            'stock_ratio', 'stock_velocity', 'price_elasticity', 'historical_discount',
            'category_demand', 'seasonal_factor', 'competitor_price_ratio',
            'urgency_score', 'margin_potential', 'expiry_stock_interaction',
            'price_urgency_interaction', 'velocity_elasticity_interaction'
        ]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train ensemble models
        self.rf_model.fit(X_scaled, y)
        self.gb_model.fit(X_scaled, y)
        
        # Calculate model performance
        rf_score = self.rf_model.score(X_scaled, y)
        gb_score = self.gb_model.score(X_scaled, y)
        
        self.model_performance = {
            'random_forest_r2': rf_score,
            'gradient_boosting_r2': gb_score,
            'training_samples': len(X),
            'feature_count': len(self.feature_names)
        }
        
        self.is_trained = True
        self.last_training_time = datetime.now()
        
        print(f"Model training completed:")
        print(f"- Random Forest R²: {rf_score:.3f}")
        print(f"- Gradient Boosting R²: {gb_score:.3f}")
        
        # Save model
        self.save_model()
        
        return True
    
    def predict_optimal_price(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict optimal price for a product"""
        if not self.is_trained:
            return self.fallback_pricing(product_data)
        
        try:
            # Extract features
            features = self.extract_features(product_data)
            features_scaled = self.scaler.transform(features)
            
            # Ensemble prediction
            rf_pred = self.rf_model.predict(features_scaled)[0]
            gb_pred = self.gb_model.predict(features_scaled)[0]
            
            # Weighted ensemble (GB typically performs better for pricing)
            ensemble_pred = (rf_pred * 0.3) + (gb_pred * 0.7)
            
            # Apply business constraints
            current_price = float(product_data.get('current_price', 0))
            min_price = current_price * 0.5  # Maximum 50% discount
            max_price = current_price * 1.2  # Maximum 20% markup
            
            optimal_price = np.clip(ensemble_pred, min_price, max_price)
            
            # Calculate discount
            discount_percent = max(0, (current_price - optimal_price) / current_price * 100)
            
            # Q-learning adjustment
            q_adjustment = self.get_q_learning_adjustment(product_data)
            final_price = optimal_price * (1 + q_adjustment)
            final_price = np.clip(final_price, min_price, max_price)
            
            # Calculate business metrics
            metrics = self.calculate_business_metrics(product_data, final_price)
            
            result = {
                'product_id': product_data.get('product_id', ''),
                'current_price': current_price,
                'predicted_optimal_price': float(optimal_price),
                'q_learning_adjustment': float(q_adjustment),
                'final_recommended_price': float(final_price),
                'discount_percent': float((current_price - final_price) / current_price * 100),
                'confidence_score': self.calculate_confidence(features_scaled),
                'model_performance': self.model_performance,
                'business_metrics': metrics,
                'reasoning': self.generate_reasoning(product_data, final_price),
                'timestamp': datetime.now().isoformat()
            }
            
            # Update price history
            self.update_price_history(product_data.get('product_id', ''), result)
            
            return result
            
        except Exception as e:
            print(f"Error in price prediction: {e}")
            return self.fallback_pricing(product_data)
    
    def get_q_learning_adjustment(self, product_data: Dict[str, Any]) -> float:
        """Get Q-learning based price adjustment"""
        product_id = product_data.get('product_id', '')
        days_to_expiry = int(product_data.get('days_to_expiry', 7))
        stock_left = int(product_data.get('stock_left', 50))
        
        # State representation
        state = (
            min(days_to_expiry, 10),  # Cap at 10 days
            min(stock_left // 20, 5)  # Stock level buckets
        )
        
        if state not in self.q_table:
            self.q_table[state] = {
                'increase': 0.0,
                'maintain': 0.0,
                'decrease_small': 0.0,
                'decrease_large': 0.0
            }
        
        # Epsilon-greedy action selection
        if np.random.random() < self.epsilon:
            action = np.random.choice(list(self.q_table[state].keys()))
        else:
            action = max(self.q_table[state], key=self.q_table[state].get)
        
        # Convert action to price adjustment
        adjustments = {
            'increase': 0.05,
            'maintain': 0.0,
            'decrease_small': -0.05,
            'decrease_large': -0.15
        }
        
        return adjustments.get(action, 0.0)
    
    def calculate_business_metrics(self, product_data: Dict[str, Any], recommended_price: float) -> Dict[str, Any]:
        """Calculate business impact metrics"""
        current_price = float(product_data.get('current_price', 0))
        stock_left = int(product_data.get('stock_left', 0))
        
        # Estimate demand response
        price_change_percent = (recommended_price - current_price) / current_price
        elasticity = self.estimate_price_elasticity(product_data)
        demand_change_percent = elasticity * price_change_percent
        
        # Base demand estimation
        base_demand = min(stock_left * 0.3, 50)  # Conservative estimate
        new_demand = base_demand * (1 + demand_change_percent)
        actual_sales = min(new_demand, stock_left)
        
        # Revenue calculations
        current_revenue = base_demand * current_price
        new_revenue = actual_sales * recommended_price
        revenue_impact = new_revenue - current_revenue
        
        # Waste reduction
        waste_reduction = max(0, actual_sales - base_demand)
        
        return {
            'estimated_demand_change_percent': float(demand_change_percent * 100),
            'estimated_sales_units': float(actual_sales),
            'current_revenue_estimate': float(current_revenue),
            'new_revenue_estimate': float(new_revenue),
            'revenue_impact': float(revenue_impact),
            'waste_reduction_units': float(waste_reduction),
            'margin_impact_percent': float((recommended_price - current_price) / current_price * 100)
        }
    
    def calculate_confidence(self, features_scaled: np.ndarray) -> float:
        """Calculate prediction confidence"""
        if not self.is_trained:
            return 0.5
        
        # Use model variance as confidence indicator
        rf_pred = self.rf_model.predict(features_scaled)[0]
        gb_pred = self.gb_model.predict(features_scaled)[0]
        
        # Lower variance = higher confidence
        variance = abs(rf_pred - gb_pred) / max(rf_pred, gb_pred, 1)
        confidence = max(0.3, 1 - variance)
        
        return float(confidence)
    
    def generate_reasoning(self, product_data: Dict[str, Any], recommended_price: float) -> str:
        """Generate human-readable reasoning for the price recommendation"""
        current_price = float(product_data.get('current_price', 0))
        days_to_expiry = int(product_data.get('days_to_expiry', 7))
        stock_left = int(product_data.get('stock_left', 0))
        
        price_change = recommended_price - current_price
        price_change_percent = (price_change / current_price) * 100
        
        reasoning_parts = []
        
        # Price direction
        if price_change_percent > 5:
            reasoning_parts.append(f"Recommending {price_change_percent:.1f}% price increase")
        elif price_change_percent < -5:
            reasoning_parts.append(f"Recommending {abs(price_change_percent):.1f}% price reduction")
        else:
            reasoning_parts.append("Recommending to maintain current pricing")
        
        # Key factors
        if days_to_expiry <= 3:
            reasoning_parts.append(f"due to urgent expiry in {days_to_expiry} days")
        elif stock_left > 100:
            reasoning_parts.append("to move excess inventory")
        elif stock_left < 20:
            reasoning_parts.append("due to low stock levels")
        
        # Market factors
        urgency_score = self.calculate_urgency_score(days_to_expiry, stock_left)
        if urgency_score > 0.7:
            reasoning_parts.append("with high urgency factors")
        
        return ". ".join(reasoning_parts) + "."
    
    def fallback_pricing(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based pricing when ML model is not available"""
        current_price = float(product_data.get('current_price', 0))
        days_to_expiry = int(product_data.get('days_to_expiry', 7))
        stock_left = int(product_data.get('stock_left', 50))
        
        # Simple rule-based pricing
        discount = 0
        if days_to_expiry <= 1:
            discount = 40
        elif days_to_expiry <= 2:
            discount = 25
        elif days_to_expiry <= 5:
            discount = 15
        elif stock_left > 100:
            discount = 10
        
        recommended_price = current_price * (1 - discount / 100)
        
        return {
            'product_id': product_data.get('product_id', ''),
            'current_price': current_price,
            'final_recommended_price': recommended_price,
            'discount_percent': discount,
            'confidence_score': 0.6,
            'reasoning': f"Rule-based pricing: {discount}% discount based on {days_to_expiry} days to expiry and {stock_left} units in stock",
            'fallback_mode': True,
            'timestamp': datetime.now().isoformat()
        }
    
    def update_price_history(self, product_id: str, recommendation: Dict[str, Any]):
        """Update price history for learning"""
        if product_id not in self.price_history:
            self.price_history[product_id] = []
        
        self.price_history[product_id].append({
            'timestamp': recommendation['timestamp'],
            'recommended_price': recommendation['final_recommended_price'],
            'discount_applied': recommendation['discount_percent'],
            'confidence': recommendation['confidence_score']
        })
        
        # Keep only recent history
        if len(self.price_history[product_id]) > 50:
            self.price_history[product_id] = self.price_history[product_id][-50:]
    
    def save_model(self):
        """Save the trained model to disk"""
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            model_data = {
                'rf_model': self.rf_model,
                'gb_model': self.gb_model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'q_table': self.q_table,
                'price_history': self.price_history,
                'model_performance': self.model_performance,
                'last_training_time': self.last_training_time,
                'is_trained': self.is_trained
            }
            
            with open(self.model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            print(f"Model saved to {self.model_path}")
        except Exception as e:
            print(f"Error saving model: {e}")
    
    def load_model(self) -> bool:
        """Load trained model from disk"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.rf_model = model_data['rf_model']
                self.gb_model = model_data['gb_model']
                self.scaler = model_data['scaler']
                self.feature_names = model_data['feature_names']
                self.q_table = model_data.get('q_table', {})
                self.price_history = model_data.get('price_history', {})
                self.model_performance = model_data.get('model_performance', {})
                self.last_training_time = model_data.get('last_training_time')
                self.is_trained = model_data.get('is_trained', False)
                
                print(f"Model loaded from {self.model_path}")
                print(f"Last training: {self.last_training_time}")
                return True
        except Exception as e:
            print(f"Error loading model: {e}")
        
        return False

# Global model instance
realtime_pricing_model = RealtimePricingModel()

def initialize_pricing_model():
    """Initialize the pricing model"""
    # Try to load existing model
    if not realtime_pricing_model.load_model():
        print("No existing model found, will use fallback pricing until trained")
    
    return realtime_pricing_model

if __name__ == "__main__":
    # Test the pricing model
    model = initialize_pricing_model()
    
    # Test with sample product
    sample_product = {
        'product_id': '01-903-5373',
        'name': 'Organic Bananas',
        'current_price': 2.50,
        'expiry_date': '2024-06-08',
        'stock_left': 156,
        'category': 'Fruits & Vegetables'
    }
    
    recommendation = model.predict_optimal_price(sample_product)
    print("\nPricing Recommendation:")
    print(json.dumps(recommendation, indent=2))
