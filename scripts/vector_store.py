import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import pickle
from datetime import datetime
from typing import Dict, List, Any, Optional
import os

class ProductVectorStore:
    def __init__(self, store_path="data/vector_store.pkl"):
        self.store_path = store_path
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.product_vectors = None
        self.product_index = {}
        self.products_data = []
        self.last_update = None
        
    def create_product_features(self, product: Dict[str, Any]) -> str:
        """Create searchable text features from product data"""
        features = []
        
        # Product name and category
        if 'name' in product:
            features.append(product['name'])
        if 'category' in product:
            features.append(product['category'])
        
        # Price range categorization
        price = float(product.get('current_price', 0))
        if price < 5:
            features.append('budget affordable cheap')
        elif price < 15:
            features.append('moderate mid-range')
        else:
            features.append('premium expensive high-end')
        
        # Stock level categorization
        stock = int(product.get('stock_left', 0))
        if stock < 20:
            features.append('low-stock urgent limited')
        elif stock < 100:
            features.append('moderate-stock available')
        else:
            features.append('high-stock abundant overstocked')
        
        # Expiry urgency
        if 'expiry_date' in product:
            try:
                expiry_date = pd.to_datetime(product['expiry_date'])
                days_to_expiry = (expiry_date - pd.Timestamp.now()).days
                
                if days_to_expiry <= 2:
                    features.append('urgent expiring soon clearance')
                elif days_to_expiry <= 7:
                    features.append('short-term perishable')
                else:
                    features.append('fresh long-lasting')
            except:
                pass
        
        return ' '.join(features)
    
    def index_products(self, products: List[Dict[str, Any]]):
        """Index products into the vector store"""
        print(f"Indexing {len(products)} products...")
        
        # Store product data
        self.products_data = products
        
        # Create feature text for each product
        feature_texts = []
        self.product_index = {}
        
        for i, product in enumerate(products):
            feature_text = self.create_product_features(product)
            feature_texts.append(feature_text)
            
            # Create index mapping
            product_id = product.get('product_id', f"product_{i}")
            self.product_index[product_id] = i
        
        # Create TF-IDF vectors
        if feature_texts:
            self.product_vectors = self.vectorizer.fit_transform(feature_texts)
            self.last_update = datetime.now()
            
            print(f"Vector store created with {self.product_vectors.shape[0]} products")
            print(f"Feature dimensions: {self.product_vectors.shape[1]}")
            
            # Save to disk
            self.save_store()
        else:
            print("No products to index")
    
    def search_products(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for products using vector similarity"""
        if self.product_vectors is None:
            print("Vector store not initialized")
            return []
        
        # Transform query to vector
        query_vector = self.vectorizer.transform([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, self.product_vectors).flatten()
        
        # Get top-k results
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0:  # Only return relevant results
                product = self.products_data[idx].copy()
                product['similarity_score'] = float(similarities[idx])
                results.append(product)
        
        return results
    
    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get product by ID"""
        if product_id in self.product_index:
            idx = self.product_index[product_id]
            return self.products_data[idx]
        return None
    
    def get_similar_products(self, product_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Find similar products to a given product"""
        if product_id not in self.product_index:
            return []
        
        product_idx = self.product_index[product_id]
        product_vector = self.product_vectors[product_idx]
        
        # Calculate similarities with all other products
        similarities = cosine_similarity(product_vector, self.product_vectors).flatten()
        
        # Exclude the product itself
        similarities[product_idx] = -1
        
        # Get top-k similar products
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0:
                product = self.products_data[idx].copy()
                product['similarity_score'] = float(similarities[idx])
                results.append(product)
        
        return results
    
    def get_products_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get all products in a specific category"""
        results = []
        for product in self.products_data:
            if product.get('category', '').lower() == category.lower():
                results.append(product)
        return results
    
    def get_expiring_products(self, days_threshold: int = 7) -> List[Dict[str, Any]]:
        """Get products expiring within threshold days"""
        results = []
        current_date = pd.Timestamp.now()
        
        for product in self.products_data:
            if 'expiry_date' in product:
                try:
                    expiry_date = pd.to_datetime(product['expiry_date'])
                    days_to_expiry = (expiry_date - current_date).days
                    
                    if 0 <= days_to_expiry <= days_threshold:
                        product_copy = product.copy()
                        product_copy['days_to_expiry'] = days_to_expiry
                        results.append(product_copy)
                except:
                    continue
        
        # Sort by expiry urgency
        results.sort(key=lambda x: x.get('days_to_expiry', 999))
        return results
    
    def get_low_stock_products(self, stock_threshold: int = 20) -> List[Dict[str, Any]]:
        """Get products with low stock levels"""
        results = []
        for product in self.products_data:
            stock = int(product.get('stock_left', 0))
            if stock <= stock_threshold:
                product_copy = product.copy()
                product_copy['stock_urgency'] = 'critical' if stock < 5 else 'low'
                results.append(product_copy)
        
        # Sort by stock level (lowest first)
        results.sort(key=lambda x: int(x.get('stock_left', 0)))
        return results
    
    def save_store(self):
        """Save vector store to disk"""
        try:
            os.makedirs(os.path.dirname(self.store_path), exist_ok=True)
            
            store_data = {
                'vectorizer': self.vectorizer,
                'product_vectors': self.product_vectors,
                'product_index': self.product_index,
                'products_data': self.products_data,
                'last_update': self.last_update
            }
            
            with open(self.store_path, 'wb') as f:
                pickle.dump(store_data, f)
            
            print(f"Vector store saved to {self.store_path}")
        except Exception as e:
            print(f"Error saving vector store: {e}")
    
    def load_store(self) -> bool:
        """Load vector store from disk"""
        try:
            if os.path.exists(self.store_path):
                with open(self.store_path, 'rb') as f:
                    store_data = pickle.load(f)
                
                self.vectorizer = store_data['vectorizer']
                self.product_vectors = store_data['product_vectors']
                self.product_index = store_data['product_index']
                self.products_data = store_data['products_data']
                self.last_update = store_data['last_update']
                
                print(f"Vector store loaded from {self.store_path}")
                print(f"Last updated: {self.last_update}")
                print(f"Products indexed: {len(self.products_data)}")
                return True
        except Exception as e:
            print(f"Error loading vector store: {e}")
        
        return False
    
    def update_product(self, product_id: str, updated_data: Dict[str, Any]):
        """Update a single product in the vector store"""
        if product_id in self.product_index:
            idx = self.product_index[product_id]
            self.products_data[idx].update(updated_data)
            
            # Re-index all products (in production, this could be optimized)
            self.index_products(self.products_data)
            print(f"Updated product {product_id}")
        else:
            print(f"Product {product_id} not found in vector store")
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get analytics about the vector store"""
        if not self.products_data:
            return {}
        
        # Category distribution
        categories = {}
        total_stock = 0
        total_value = 0
        expiring_soon = 0
        
        for product in self.products_data:
            # Category count
            category = product.get('category', 'Unknown')
            categories[category] = categories.get(category, 0) + 1
            
            # Stock and value
            stock = int(product.get('stock_left', 0))
            price = float(product.get('current_price', 0))
            total_stock += stock
            total_value += stock * price
            
            # Expiring products
            if 'expiry_date' in product:
                try:
                    expiry_date = pd.to_datetime(product['expiry_date'])
                    days_to_expiry = (expiry_date - pd.Timestamp.now()).days
                    if days_to_expiry <= 7:
                        expiring_soon += 1
                except:
                    pass
        
        return {
            'total_products': len(self.products_data),
            'categories': categories,
            'total_stock_units': total_stock,
            'total_inventory_value': round(total_value, 2),
            'products_expiring_soon': expiring_soon,
            'last_update': self.last_update.isoformat() if self.last_update else None
        }

# Global vector store instance
vector_store = ProductVectorStore()

def initialize_vector_store_from_csv(csv_path="public/data/grocery-inventory.csv"):
    """Initialize vector store from CSV data"""
    try:
        df = pd.read_csv(csv_path)
        products = df.to_dict('records')
        vector_store.index_products(products)
        return True
    except Exception as e:
        print(f"Error initializing vector store from CSV: {e}")
        return False

if __name__ == "__main__":
    # Test the vector store
    print("Testing Product Vector Store...")
    
    # Initialize with sample data
    sample_products = [
        {
            'product_id': '01-903-5373',
            'name': 'Organic Bananas',
            'current_price': 2.50,
            'expiry_date': '2024-06-08',
            'stock_left': 156,
            'category': 'Fruits & Vegetables'
        },
        {
            'product_id': '02-445-1122',
            'name': 'Greek Yogurt',
            'current_price': 4.99,
            'expiry_date': '2024-06-12',
            'stock_left': 78,
            'category': 'Dairy'
        },
        {
            'product_id': '03-778-9900',
            'name': 'Fresh Salmon Fillet',
            'current_price': 18.99,
            'expiry_date': '2024-06-03',
            'stock_left': 32,
            'category': 'Seafood'
        }
    ]
    
    vector_store.index_products(sample_products)
    
    # Test search
    print("\nTesting search:")
    results = vector_store.search_products("fresh fruit", top_k=3)
    for result in results:
        print(f"- {result['name']} (score: {result['similarity_score']:.3f})")
    
    # Test analytics
    print("\nAnalytics:")
    analytics = vector_store.get_analytics()
    print(json.dumps(analytics, indent=2))
