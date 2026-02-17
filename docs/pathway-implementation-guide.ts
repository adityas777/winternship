1
️⃣ Setup & Install Pathway

Prompt:\
“Add Pathway to my existing Python project. Create a new
namespace streaming_pipeline.py
that
installs
and
imports
Pathway, sets
up
a
simple
stream
from
a
CSV
file in the
data / folder(inventory.csv), and
prints
new rows() as they
appear.Use
Pathway
’s built-in connectors
for streaming CSV updates.
”

2️⃣ Hook Inventory Feed into Pathway

Prompt:
“Modify my current inventory loading logic in pricing_engine.py to use the live data stream from streaming_pipeline.py instead of reading the file once. It should subscribe to the Pathway stream and trigger the pricing model whenever new inventory data arrives.”

3️⃣ Live Index / Vector Store

Prompt:\
“Create a Pathway vector index of all products
with fields
: product_id, name, current_price, expiry_date, stock_left. The index should automatically update when new data arrives from the stream. Provide a
function get_product_info(product_id)
that
always
returns
the
latest
values
from
Pathway.
”
\
4️⃣ Connect Pricing Model

Prompt:
“Wrap my existing RandomForest/Q-learning pricing logic so that every time Pathway receives new inventory data, it recomputes the recommended price and updates the Pathway index
with the new price.
”
\
5️⃣ Live Dashboard API

Prompt:\
“Create a FastAPI endpoint /live-prices/
{
  product_id
}
that
returns
the
latest
price
and
stock
for the product by querying
the
Pathway
index.This
endpoint
should
always
reflect
the
newest
streamed
data.
”
\
6️⃣ Real-Time UI
\
Prompt:\
“In my React dashboard, replace the current static API call
with a WebSocket
or
SSE
subscription
to / live - prices / { product_id }
so
the
price
automatically
updates
whenever
Pathway
pushes
new data.
”
\
7️⃣ Demo Script
\
Prompt:\
“Add a small script simulate_updates.py that appends random rows to data/inventory.csv every few seconds to simulate real-time inventory changes. Make sure the dashboard visibly updates prices as the file changes.”

8️⃣ Chatbot
with RAG (optional bonus)

Prompt:
\
“Create a small chatbot endpoint /ask that uses LangChain + the Pathway vector index to answer questions like ‘Which products are about to expire?’ or ‘Why did the price of item X change?’ The chatbot must always use the latest Pathway data.”
