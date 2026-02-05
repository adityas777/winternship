import streamlit as st
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns

# Load and preprocess data
@st.cache_data
def load_data():
    df = pd.read_csv("Grocery_Inventory new v1 (1).csv")
    df["Expiration_Date"] = pd.to_datetime(df["Expiration_Date"], errors='coerce')
    df["Date_Received"] = pd.to_datetime(df["Date_Received"], errors='coerce')
    df["Unit_Price"] = df["Unit_Price"].replace('[\$,]', '', regex=True).astype(float)

    simulated_date = pd.to_datetime("2023-06-01")
    df["Days_to_Expiry"] = (df["Expiration_Date"] - simulated_date).dt.days
    df["Turnover_Rate"] = df["Sales_Volume"] / (df["Stock_Quantity"] + 1)
    df["Stock_Value"] = df["Stock_Quantity"] * df["Unit_Price"]
    df = df.dropna()
    df = df[df["Days_to_Expiry"] >= 0]

    return df

df = load_data()

# Train regression model
feature_cols = ["Days_to_Expiry", "Turnover_Rate", "Sales_Volume", "Inventory_Turnover_Rate", "Stock_Quantity"]
X = df[feature_cols]
y = df["Unit_Price"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
reg_model = RandomForestRegressor(n_estimators=100, random_state=42)
reg_model.fit(X_train, y_train)

# Q-learning logic
days_to_expiry_bins = [0, 2, 5, 10, 30, 100]
stock_bins = [0, 10, 20, 50, 100, 1000]

def get_state(days_left, stock):
    d = np.digitize(days_left, days_to_expiry_bins)
    s = np.digitize(stock, stock_bins)
    return (d, s)

# Load or create mock Q-table
try:
    q_table = np.load("q_table.npy")
except:
    q_table = np.random.rand(len(days_to_expiry_bins)+1, len(stock_bins)+1, 3)

# Streamlit UI
st.title("🛒 Dynamic Pricing for Perishable Goods")

st.sidebar.header("Select Product")
selected_product = st.sidebar.selectbox("Choose a product", df["Product_Name"].unique())
product_data = df[df["Product_Name"] == selected_product].iloc[0]

# Predict with regression
input_features = np.array([[product_data[col] for col in feature_cols]])
predicted_price = reg_model.predict(input_features)[0]

# Q-learning logic
days_left = int(product_data['Days_to_Expiry'])
stock_level = int(product_data['Stock_Quantity'])
state = get_state(days_left, stock_level)
q_action = np.argmax(q_table[state])
discount_percent = q_action * 10
discounted_price = predicted_price * (1 - discount_percent / 100)

# Simulated demand
simulated_demand = min(20, stock_level)
q_sales = min(simulated_demand, stock_level)
q_revenue = q_sales * discounted_price
q_waste = max(0, stock_level - q_sales)

# Display Results
st.subheader("📊 Product & Pricing Recommendations")
st.markdown(f"**Product:** {product_data['Product_Name']}")
st.markdown(f"**Days to Expiry:** {days_left}")
st.markdown(f"**Stock Level:** {stock_level}")
st.markdown(f"**Regression-Suggested Price:** ${predicted_price:.2f}")
st.markdown(f"**Q-Learning Discount:** {discount_percent}%")
st.markdown(f"**Discounted Price:** ${discounted_price:.2f}")

st.subheader("📉 Revenue & Waste Simulation")
st.markdown(f"**Estimated Revenue (Q-learning):** ${q_revenue:.2f}")
st.markdown(f"**Estimated Waste (units):** {q_waste}")

# Visualization: Price vs Days to Expiry
st.subheader("📈 Unit Price vs Days to Expiry")
fig, ax = plt.subplots()
sns.scatterplot(data=df, x="Days_to_Expiry", y="Unit_Price", hue="Catagory", alpha=0.6, ax=ax)
plt.axvline(days_left, color='red', linestyle='--', label='Selected Product')
plt.title("Unit Price vs Days to Expiry")
plt.legend()
st.pyplot(fig)

# Visualization: Q-Learning Policy Heatmap
st.subheader("🧠 Q-Learning Discount Policy")
policy = np.argmax(q_table, axis=2)
plt.figure(figsize=(8, 6))
sns.heatmap(policy.T, cmap='coolwarm', xticklabels=days_to_expiry_bins + [">"], yticklabels=stock_bins + [">"])
plt.xlabel("Days to Expiry Bin")
plt.ylabel("Stock Level Bin")
plt.title("Learned Discount Policy (Q-Learning)")
st.pyplot(plt)
