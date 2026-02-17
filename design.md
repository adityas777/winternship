# Smart Dynamic Pricing Engine - Design Document

## 1. System Architecture Overview

### 1.1 High-Level Architecture
The Smart Dynamic Pricing Engine follows a modern full-stack architecture with real-time capabilities:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   ML Engine     │
│   (Next.js)     │◄──►│   (Node.js)      │◄──►│   (Python)      │
│                 │    │                  │    │                 │
│ • React UI      │    │ • REST APIs      │    │ • Q-Learning    │
│ • WebSocket     │    │ • WebSocket      │    │ • Pathway       │
│ • Real-time     │    │ • File Upload    │    │ • Vector Store  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Data Layer     │
                    │                  │
                    │ • CSV Files      │
                    │ • In-Memory      │
                    │ • Vector Store   │
                    └──────────────────┘
```

### 1.2 Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: React 18 with Radix UI components
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React hooks and context
- **Real-time**: Socket.io client
- **Charts**: Recharts library
- **Build Tool**: Next.js built-in bundler

#### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API routes
- **Language**: TypeScript
- **Real-time**: Socket.io server
- **File Processing**: Built-in Node.js modules
- **HTTP Client**: Fetch API

#### Machine Learning
- **Language**: Python
- **Framework**: Pathway for stream processing
- **Algorithm**: Q-learning for pricing optimization
- **Data Processing**: Pandas, NumPy
- **Vector Store**: Custom implementation

## 2. System Components

### 2.1 Frontend Architecture

#### Component Hierarchy
```
App (page.tsx)
├── Header Section
│   ├── Title & Controls
│   ├── Day Navigation
│   └── Export Button
├── Status Alerts
├── Product Selection
├── Real-time Metrics
├── Tab Navigation
│   ├── Dashboard Tab (PricingDashboard)
│   ├── Camera Tab (CameraDetectionTab)
│   ├── Replenishment Tab (ReplenishmentTab)
│   ├── Demand Tab (DemandCurveTab)
│   ├── Sustainability Tab (SustainabilityTab)
│   ├── Maps Tab (IndiaMapSection)
│   └── Upload Tab (DataUploadTab)
├── Live Dashboard Overlay
└── Live Alerts Ticker
```

#### Key Components

**PricingDashboard**
- Displays pricing recommendations
- Shows product details and metrics
- Renders charts and visualizations
- Handles loading states

**CameraDetectionTab**
- Integrates with object detection API
- Provides real-time camera feed
- Matches detected objects with inventory
- Triggers pricing recommendations

**Real-time Components**
- LiveDashboardOverlay: Full-screen live metrics
- LiveAlertsTicker: Scrolling alerts banner
- RealTimeMetrics: Live product metrics

### 2.2 Backend Architecture

#### API Structure
```
/api/
├── data-status/          # Check data availability
├── detect-object/        # Object detection endpoint
├── export-report/        # Report generation
│   └── custom/          # Custom data reports
├── live-dashboard/       # Live dashboard data
├── live-stream/         # WebSocket endpoint
├── pricing-recommendation/ # Pricing calculations
│   └── custom/          # Custom data pricing
├── products/            # Product data endpoints
│   ├── custom/          # Custom uploaded data
│   └── live/            # Live product updates
├── realtime-pricing/    # Real-time pricing updates
├── upload-csv/          # File upload handling
├── vector-search/       # Similarity search
└── websocket/           # WebSocket server
```

#### API Design Patterns

**RESTful Endpoints**
- GET /api/products - Retrieve product list
- POST /api/pricing-recommendation - Calculate pricing
- POST /api/upload-csv - Upload inventory data
- GET /api/export-report - Generate reports

**WebSocket Events**
- `product-update` - Real-time product changes
- `pricing-update` - Live pricing recommendations
- `alert` - System alerts and notifications
- `dashboard-metrics` - Live dashboard data

### 2.3 Data Layer Design

#### Data Models

**ProductData Interface**
```typescript
interface ProductData {
  Product_Name: string
  Catagory: string
  Supplier_Name: string
  Warehouse_Location: string
  Status: string
  Product_ID: string
  Supplier_ID: string
  Date_Received: string
  Last_Order_Date: string
  Expiration_Date: string
  Stock_Quantity: number
  Reorder_Level: number
  Reorder_Quantity: number
  Unit_Price: number
  Sales_Volume: number
  Inventory_Turnover_Rate: number
  percentage: string
  Days_to_Expiry: number
  Turnover_Rate: number
  Stock_Value: number
}
```

**PricingRecommendation Interface**
```typescript
interface PricingRecommendation {
  productName: string
  predictedPrice: number
  discountPercent: number
  discountedPrice: number
  estimatedRevenue: number
  wasteReduction: number
  confidence: number
  reasoning: string
}
```

#### Data Flow Architecture
```
CSV Upload → Validation → Processing → Storage → API → Frontend
     ↓
Live Stream → Pathway → ML Engine → WebSocket → Real-time UI
     ↓
Vector Store → Similarity Search → Recommendations → Dashboard
```

## 3. Machine Learning Design

### 3.1 Q-Learning Algorithm

#### State Space
- Days to expiry (0-30 days)
- Stock level (Low, Medium, High)
- Product category
- Historical sales velocity

#### Action Space
- Discount percentages (0%, 5%, 10%, 15%, 20%, 25%, 30%)
- Price adjustments
- Promotional strategies

#### Reward Function
```python
reward = (revenue_increase * 0.6) + (waste_reduction * 0.4)
```

#### Feature Engineering
```python
features = {
    'days_to_expiry': normalize(days_to_expiry),
    'stock_ratio': current_stock / max_stock,
    'turnover_rate': sales_volume / stock_quantity,
    'price_elasticity': historical_price_sensitivity,
    'seasonality': seasonal_demand_factor
}
```

### 3.2 Pathway Integration

#### Stream Processing Pipeline
```python
# Pathway streaming pipeline
inventory_stream = pw.io.csv.read("inventory.csv", mode="streaming")
pricing_stream = inventory_stream.select(
    product_name=pw.this.Product_Name,
    days_to_expiry=pw.this.Days_to_Expiry,
    stock_quantity=pw.this.Stock_Quantity
).with_columns(
    pricing_recommendation=apply_ml_model(pw.this)
)
```

#### Real-time Processing
- Continuous data ingestion from CSV files
- Real-time feature calculation
- Live model inference
- WebSocket broadcasting of results

## 4. User Interface Design

### 4.1 Design System

#### Color Palette
- Primary: Purple (#8B5CF6)
- Secondary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Background: Dark theme (#0F172A, #1E293B)

#### Typography
- Primary Font: Geist (system font)
- Headings: Bold weights
- Body: Regular weights
- Code: Monospace

#### Component Library
- Built on Radix UI primitives
- Custom styled with Tailwind CSS
- Consistent spacing and sizing
- Accessible by default

### 4.2 Layout Design

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Title, Controls, Day Navigation, Export         │
├─────────────────────────────────────────────────────────┤
│ Alerts: Status messages and notifications              │
├─────────────────────────────────────────────────────────┤
│ Product Selection: Dropdown with search                │
├─────────────────────────────────────────────────────────┤
│ Real-time Metrics: Live product data                   │
├─────────────────────────────────────────────────────────┤
│ Tab Navigation: Dashboard, Camera, etc.                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Tab Content: Dynamic content based on selection        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid system
- Touch-friendly interactions

### 4.3 Interactive Elements

#### Animations and Transitions
- Smooth transitions (300ms ease-in-out)
- Loading spinners and skeletons
- Hover effects and micro-interactions
- Glow effects for premium feel

#### Real-time Updates
- Live data indicators
- Smooth chart animations
- Real-time counters
- Status change animations

## 5. Security Design

### 5.1 Frontend Security
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure WebSocket connections (WSS)

### 5.2 Backend Security
- File upload validation
- Request rate limiting
- Error handling without information leakage
- Secure headers

### 5.3 Data Security
- Data validation at all entry points
- Secure data transmission
- No sensitive data in client-side storage
- Audit logging for data access

## 6. Performance Design

### 6.1 Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Efficient re-rendering with React

### 6.2 Backend Optimization
- Efficient data processing
- Caching strategies
- Connection pooling
- Optimized algorithms

### 6.3 Real-time Performance
- WebSocket connection management
- Efficient data serialization
- Debounced updates
- Connection recovery

## 7. Error Handling Design

### 7.1 Frontend Error Handling
```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  // Handle component errors gracefully
}

// API error handling
const handleApiError = (error: Error) => {
  // Show user-friendly error messages
  // Log errors for debugging
  // Provide recovery options
}
```

### 7.2 Backend Error Handling
```typescript
// Centralized error handling
const errorHandler = (error: Error, req: Request, res: Response) => {
  // Log error details
  // Return appropriate HTTP status
  // Provide helpful error messages
}
```

### 7.3 Graceful Degradation
- Fallback to demo data when custom data fails
- Offline mode for cached data
- Progressive enhancement
- Retry mechanisms for failed requests

## 8. Testing Strategy

### 8.1 Frontend Testing
- Unit tests for components
- Integration tests for user flows
- E2E tests for critical paths
- Visual regression testing

### 8.2 Backend Testing
- API endpoint testing
- Data processing validation
- WebSocket connection testing
- Performance testing

### 8.3 ML Model Testing
- Algorithm accuracy validation
- Performance benchmarking
- Edge case handling
- Model drift detection

## 9. Deployment Architecture

### 9.1 Production Environment
- Vercel deployment for frontend
- Serverless functions for API
- CDN for static assets
- Environment-based configuration

### 9.2 Development Workflow
- Git-based version control
- Feature branch workflow
- Automated testing pipeline
- Continuous deployment

### 9.3 Monitoring and Logging
- Application performance monitoring
- Error tracking and alerting
- User analytics
- System health checks

## 10. Scalability Considerations

### 10.1 Horizontal Scaling
- Stateless API design
- Load balancing capabilities
- Database scaling strategies
- Microservices architecture potential

### 10.2 Performance Scaling
- Caching layers
- Database optimization
- CDN utilization
- Efficient algorithms

### 10.3 Data Scaling
- Partitioning strategies
- Data archiving
- Efficient indexing
- Stream processing optimization

## 11. Integration Points

### 11.1 External APIs
- Object detection services
- Weather data APIs
- Market data feeds
- Payment processing

### 11.2 Third-party Services
- Analytics platforms
- Monitoring services
- CDN providers
- Cloud storage

### 11.3 Future Integrations
- ERP systems
- POS systems
- IoT sensors
- Supply chain platforms

## 12. Maintenance and Updates

### 12.1 Code Maintenance
- Regular dependency updates
- Security patch management
- Performance optimization
- Bug fix procedures

### 12.2 Data Maintenance
- Data quality monitoring
- Backup and recovery
- Data migration procedures
- Archive management

### 12.3 Model Maintenance
- Model retraining schedules
- Performance monitoring
- A/B testing for improvements
- Version control for models