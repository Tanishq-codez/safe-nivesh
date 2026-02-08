# FundLens - AI-Powered Mutual Fund Portfolio Analysis

![FundLens Logo](https://via.placeholder.com/150x50/1a1a2e/e94560?text=FundLens)

A comprehensive MERN stack application that provides AI-powered mutual fund portfolio analysis using Zerodha Kite Connect API data and Google Gemini API for explainable investment insights.

## 🎯 Problem Statement

Retail investors often invest in multiple mutual funds without understanding:

- **Sector over-concentration** - Too much exposure to specific sectors
- **Company overlap across funds** - Same companies in different funds reducing diversification
- **Risk misalignment with personal profile** - Portfolio doesn't match risk tolerance

## 💡 Solution: FundLens

FundLens solves these problems by:

- 📊 **Visualizing portfolio exposure** with interactive charts
- 🔍 **Detecting overlap risks** across mutual funds
- 🤖 **Using AI to recommend diversification strategies** via Google Gemini

## 🚀 Tech Stack

### Frontend
- **React (Vite)** - Modern, fast development
- **Bootstrap 5** - PayPal/PhonePe-inspired fintech UI
- **Recharts** - Interactive portfolio visualizations
- **Axios** - API communication

### Backend
- **Node.js + Express** - RESTful API server
- **JWT Authentication** - Secure user sessions
- **MongoDB** - User and portfolio data storage
- **In-memory fallback** - Works without database for demos

### External APIs
- **Zerodha Kite Connect API** - Real mutual fund holdings data
- **Google Gemini API** - AI-powered investment insights

## 📱 Features

### 🔐 Authentication & User Profiling
- User registration/login with JWT
- Risk profile collection (Age, Income, Horizon, Risk Appetite)
- Automatic risk classification (Conservative/Balanced/Aggressive)

### 📊 Mutual Fund Management
- Add multiple mutual funds to portfolio
- Edit or remove funds
- Real-time portfolio value tracking

### 📈 Portfolio Analytics
- **Sector Distribution** - Pie chart showing sector-wise exposure
- **Company Exposure** - Bar chart of top holdings
- **Overlap Detection** - Identifies companies appearing in multiple funds
- **Risk Warnings** - Highlights concentration issues

### 🤖 AI Insights (Gemini Powered)
- **One-click analysis** - No chatbot, instant insights
- **Structured output** with sections:
  - 🧠 Portfolio Health Summary
  - ⚠️ Risk & Concentration Warnings
  - ✅ Suggested Adjustments
  - ❌ Areas of Overexposure
  - 📌 Risk Alignment Verdict

### 🎨 Fintech-Grade UI
- Dark theme inspired by PayPal/PhonePe
- Smooth transitions and loading animations
- Responsive design for all devices
- Investor-grade visual storytelling

## 🛠 Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB (optional - uses in-memory fallback)
- Google Gemini API Key (optional - uses mock insights)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd fundlens
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Start the application**
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Environment Variables

```env
# MongoDB (optional - uses in-memory fallback if not provided)
MONGODB_URI=mongodb://localhost:27017/fundlens

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Google Gemini API (optional - uses mock insights if not provided)
GEMINI_API_KEY=your_gemini_api_key_here

# Zerodha Kite Connect (optional - uses mock data if not provided)
KITE_API_KEY=your_kite_api_key
KITE_ACCESS_TOKEN=your_kite_access_token
```

## 📖 Usage Guide

### 1. Create Account & Profile
- Register with email and password
- Provide investment profile details:
  - Age, Monthly Income Range
  - Investment Horizon (Short/Medium/Long)
  - Risk Appetite (Low/Moderate/High)

### 2. Add Mutual Funds
- Click "Add Fund" on dashboard
- Enter fund name and investment amount
- System automatically fetches holdings data

### 3. Analyze Portfolio
- View sector distribution pie chart
- Check company exposure bar chart
- Review portfolio warnings

### 4. Get AI Insights
- Navigate to "AI Insights" page
- Click "Generate AI Insights"
- Receive structured analysis from Gemini

## 🎯 Demo Credentials

For hackathon demo purposes:

**Test User:**
- Email: `demo@fundlens.com`
- Password: `demo123`
- Risk Profile: Balanced
- Sample funds pre-loaded

## 📊 Mock Data

The application includes comprehensive mock data for:

- **5 Popular Mutual Funds** with realistic holdings
- **Company/Sector mappings** for Indian markets
- **AI Insights** that demonstrate full functionality

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Funds
- `GET /api/funds` - Get user's funds
- `POST /api/funds` - Add new fund
- `DELETE /api/funds/:id` - Remove fund

### Portfolio
- `GET /api/portfolio/analyze` - Portfolio analysis

### AI Insights
- `POST /api/ai/insights` - Generate AI insights

## 🎨 UI Components

### Dashboard
- Portfolio overview cards
- Mutual funds table
- Sector distribution pie chart
- Company exposure bar chart
- Real-time warnings

### AI Insights Page
- One-click analysis button
- Structured insight sections
- Risk alignment indicators
- Educational disclaimers

## 🛡 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- API rate limiting
- Input validation and sanitization
- CORS protection

## 📈 Portfolio Analysis Engine

The backend computes:

1. **Sector Analysis**
   - Percentage exposure per sector
   - Absolute money allocation
   - Over-concentration detection

2. **Company Analysis**
   - Company-wise exposure
   - Overlap detection across funds
   - Top holdings identification

3. **Risk Assessment**
   - Profile-based risk limits
   - Diversification metrics
   - Warning generation

## 🤖 Gemini AI Integration

### Prompt Strategy
Gemini receives structured JSON containing:
- Risk profile and user data
- Sector exposure percentages
- Overlap warnings
- Total investment amount

### AI Responsibilities
- Explain portfolio health simply
- Identify concentration risks
- Suggest diversification strategies
- Recommend fund categories (not specific funds)
- Flag risk-profile mismatches

### AI Guardrails
- No future return predictions
- No guaranteed gains language
- Educational disclaimer included
- Non-financial advice only

## 🎯 Hackathon Readiness

### Demo Features
- Pre-populated demo data
- One-click setup
- Mock API responses
- Sample user credentials
- Comprehensive README

### Presentation Points
- Real-world problem solving
- AI integration showcase
- Full-stack demonstration
- Investor-grade UI/UX
- Technical architecture

## 📝 Project Structure

```
fundlens/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Login, Dashboard, AIInsights
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   └── utils/         # Authentication utilities
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── services/         # External API services
│   ├── models/           # MongoDB models
│   ├── utils/            # Portfolio analysis
│   └── package.json
├── README.md
└── .env.example
```

## 🚀 Future Enhancements

- [ ] Real-time portfolio tracking
- [ ] Additional chart types
- [ ] Portfolio simulation tool
- [ ] Export functionality
- [ ] Mobile app development
- [ ] Advanced AI models

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

**FundLens is for educational purposes only.** This is not financial advice. All AI insights are generated for demonstration purposes. Please consult with qualified financial advisors before making investment decisions.

---

**Built with ❤️ for hackathon demo purposes**