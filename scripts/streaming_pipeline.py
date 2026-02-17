import pathway as pw
import pandas as pd
import json
import time
from typing import Dict, Any
import os

class InventoryStreamProcessor:
    def __init__(self, csv_path: str = "public/data/grocery-inventory.csv"):
        self.csv_path = csv_path
        self.schema = pw.Schema.from_pandas(pd.read_csv(csv_path).head(0))
        
    def setup_stream(self):
        """Setup Pathway stream from CSV file"""
        # Create a streaming table from CSV
        inventory_table = pw.io.csv.read(
            self.csv_path,
            schema=self.schema,
            mode="streaming"
        )
        
        # Add processing logic
        processed_table = inventory_table.select(
            product_id=inventory_table.product_id,
            name=inventory_table.name,
            current_price=inventory_table.current_price,
            expiry_date=inventory_table.expiry_date,
            stock_left=inventory_table.stock_left,
            category=inventory_table.category,
            timestamp=pw.this.time
        )
        
        # Output to JSON for API consumption
        pw.io.jsonlines.write(processed_table, "data/live_inventory.jsonl")
        
        return processed_table
    
    def run_pipeline(self):
        """Start the streaming pipeline"""
        print("Starting Pathway streaming pipeline...")
        processed_table = self.setup_stream()
        
        # Run the computation
        pw.run()

if __name__ == "__main__":
    processor = InventoryStreamProcessor()
    processor.run_pipeline()
