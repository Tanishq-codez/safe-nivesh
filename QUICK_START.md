# FundLens - Quick Start Guide

## 🚀 One-Command Setup

```bash
cd "C:\Users\sehaj\Desktop\HackTU Project\fundlens"
npm install
cd server && npm install
cd ../client && npm install
```

## 🎮 Demo Mode (No API Keys Required)

The application works out-of-the-box with:
- ✅ Mock mutual fund data
- ✅ Sample AI insights
- ✅ In-memory data storage
- ✅ Full functionality demonstration

## 🏃‍♂️ Run the Application

### Option 1: Run Both Frontend & Backend
```bash
cd "C:\Users\sehaj\Desktop\HackTU Project\fundlens"
npm run dev
```

### Option 2: Run Separately
```bash
# Backend (Terminal 1)
cd "C:\Users\sehaj\Desktop\HackTU Project\fundlens\server"
npm run dev

# Frontend (Terminal 2)  
cd "C:\Users\sehaj\Desktop\HackTU Project\fundlens\client"
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📱 Quick Demo Flow

1. **Register** a new account (or use demo credentials)
2. **Add Funds** - Try these sample funds:
   - Axis Bluechip Fund
   - HDFC Mid-Cap Opportunities  
   - SBI Small Cap Fund
3. **View Dashboard** - See charts and analysis
4. **Generate AI Insights** - Click for Gemini analysis

## 🎯 Demo Script

1. **Show Problem**: "Investors often don't know their sector concentration"
2. **Show Solution**: "FundLens visualizes portfolio exposure instantly"
3. **Show AI**: "Gemini provides explainable insights in one click"
4. **Show UI**: "Fintech-grade design inspired by PayPal/PhonePe"

## 🔧 Optional API Keys

Add these to `.env` for real data:
- `GEMINI_API_KEY` - Get from Google AI Studio
- `KITE_API_KEY` - Zerodha Kite Connect
- `MONGODB_URI` - MongoDB connection string

## 📊 Sample Data Included

- 5 popular mutual funds with realistic holdings
- Company/sector mappings for Indian markets
- Risk-based portfolio analysis
- AI insight templates

## 🎨 UI Features

- Dark fintech theme
- Responsive Bootstrap design
- Interactive Recharts visualizations
- Smooth animations and transitions
- Loading states and error handling

## 🏆 Hackathon Ready

- ✅ Complete MERN stack
- ✅ AI integration (Gemini)
- ✅ Professional UI/UX
- ✅ Comprehensive documentation
- ✅ Demo-friendly setup
- ✅ Full feature demonstration