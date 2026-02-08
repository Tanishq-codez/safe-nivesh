# Mutual Fund Analysis Feature

## Overview

This feature provides comprehensive AI-powered analysis of mutual fund portfolios for both new investors and existing customers. The analysis uses Google Gemini AI to provide personalized insights based on detailed portfolio overlap detection, sector diversification scoring, and fund recommendations.

## Key Features

### 1. **Overlapping Shares Analysis**
- Detects companies that appear across multiple mutual funds
- Shows the number of funds each company appears in
- Calculates total exposure percentage for overlapping holdings
- Helps identify concentration risks from duplicate holdings

### 2. **Overlapping Sectors Analysis**
- Identifies sectors present across multiple funds
- Shows sector exposure percentages
- Highlights sector concentration risks
- Helps users understand sector-level concentration

### 3. **Diversification Score**
- Calculates overall diversification score (0-100)
- Components:
  - **Sector Diversity Score**: Based on number of unique sectors (max 30 points)
  - **Share Diversity Score**: Based on number of unique holdings (max 40 points)
  - **Concentration Score**: Based on Herfindahl index (max 30 points)
- Provides assessment level: Excellent, Good, Fair, or Poor
- Includes specific suggestions for improvement

### 4. **Potential Sectors to Invest In**
- Lists sectors not currently represented in the portfolio
- Recommends 20+ Indian market sectors for diversification
- Includes sectors like: Financial Services, IT, Healthcare, FMCG, Real Estate, Energy, Infrastructure, etc.

### 5. **Fund Recommendations**
- Suggests fund types and categories for recommended sectors
- Provides expected characteristics for each sector
- No specific fund names (educational guidance only)
- Catered to user's risk profile

## Backend Architecture

### New Files Created

1. **`server/utils/detailedAnalyzer.js`**
   - Core analysis engine
   - Functions:
     - `analyzePortfolioDetailed(funds)`: Main analysis function
     - `determineFundType(sector)`: Maps sectors to fund types
     - `getExpectedCharacteristics(sector)`: Sector characteristics
     - `assessDiversification(score)`: Score interpretation

2. **Updated `server/services/geminiService.js`**
   - Enhanced to support detailed analysis parameters
   - New functions:
     - `buildDetailedPrompt()`: Generates detailed analysis prompts
     - `formatOverlappingShares()`: Formats share overlap data
     - `formatOverlappingSectors()`: Formats sector overlap data
     - `formatDiversificationScore()`: Formats diversification metrics
     - `formatPotentialSectors()`: Formats sector recommendations

### New/Updated Routes

1. **`POST /portfolio/detailed-analysis`**
   - Endpoint: `server/routes/portfolio.js`
   - Authentication: Required (JWT token)
   - Request: No body needed (fetches user's funds from DB)
   - Response: Detailed analysis object including:
     ```json
     {
       "totalFunds": number,
       "totalInvestment": number,
       "uniqueSectors": number,
       "uniqueShares": number,
       "overlappingShares": [...],
       "overlappingSectors": [...],
       "diversificationScore": {...},
       "potentialSectors": [...],
       "fundRecommendations": [...]
     }
     ```

2. **Enhanced `POST /ai/insights`**
   - Endpoint: `server/routes/ai.js`
   - Request body:
     ```json
     {
       "userType": "new" | "existing",
       "answers": {...},           // For new users only
       "portfolioData": {...},     // For existing users
       "analysisData": {...}       // For existing users with detailed analysis
     }
     ```
   - Handles both new and existing user scenarios
   - Automatically fetches detailed analysis for existing users

## Frontend Integration

### Updated Components

**`client/src/pages/AIInsights.jsx`**
- Two user types:
  1. **New Investors**: Fill out form with financial readiness questions
  2. **Existing Investors**: Analyze their current portfolio

#### For Existing Investors
- Calls `/ai/insights` with `userType: "existing"`
- Backend automatically fetches and analyzes portfolio
- Receives personalized insights including:
  - Portfolio health assessment
  - Overlapping holdings analysis
  - Sector concentration details
  - Diversification assessment
  - Risk warnings with specific examples
  - Suggested adjustments with fund recommendations
  - Risk profile alignment analysis

#### For New Investors
- Collects answers to onboarding questions
- Calls `/ai/insights` with `userType: "new"` and user answers
- Receives guidance on:
  - Financial readiness assessment
  - Priority checklist (insurance, emergency fund, investment timeline)
  - Investment guidance with suggested allocations
  - Next steps

## Data Flow

### Existing Investor Analysis Flow

```
User clicks "Analyze My Portfolio"
          ↓
frontend: POST /ai/insights (userType: "existing")
          ↓
backend: Verify JWT token
          ↓
backend: Fetch user's funds from MongoDB
          ↓
backend: Run analyzePortfolioDetailed(funds)
          ↓
backend: Run analyzePortfolio() for basic analysis
          ↓
backend: Call geminiService.generateInsights()
          ↓
geminiService: Build detailed prompt with overlap/diversification data
          ↓
geminiService: Call Gemini API (or fallback to mock)
          ↓
Parse JSON response with insights
          ↓
Return insights to frontend
          ↓
frontend: Display analysis results to user
```

### New Investor Guidance Flow

```
User selects "I am new"
          ↓
User fills form (insurance, emergency fund, investment amount, risk appetite, horizon)
          ↓
frontend: POST /ai/insights (userType: "new", answers)
          ↓
backend: Call geminiService.generateInsights(userType: "new", answers)
          ↓
geminiService: Build new investor prompt
          ↓
geminiService: Call Gemini API (or fallback to mock)
          ↓
Parse JSON response with new investor guidance
          ↓
Return guidance to frontend
          ↓
frontend: Display priority checklist, allocation suggestions, next steps
```

## Gemini API Integration

### Prompt Strategy

1. **For Existing Investors**: Detailed prompt includes:
   - Specific overlapping shares with fund counts and exposure percentages
   - Specific overlapping sectors with concentration data
   - Diversification score with assessment level
   - List of potential sectors to add
   - Instructions to reference specific data points

2. **For New Investors**: Educational prompt includes:
   - User's financial details
   - Questions about insurance status
   - Emergency fund status
   - Monthly investment capacity
   - Risk appetite and investment horizon
   - Instructions for beginner-friendly, non-aggressive language

### Fallback Mock Response

If Gemini API is unavailable or GEMINI_API_KEY is not set:
- Returns meaningful mock data based on portfolio structure or new investor parameters
- Personalizes responses using actual portfolio data
- Maintains consistent response format

## Environment Configuration

Required in `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

The system will use mock responses if the API key is not provided.

## User-Facing Insights

### For Existing Investors, the analysis displays:

1. **Portfolio Health**: Overall assessment of portfolio quality and risk
2. **Overlapping Holdings**: Which companies appear in multiple funds and their impact
3. **Sector Congestion**: Which sectors are over-represented
4. **Diversification Assessment**: Score and specific improvement suggestions
5. **Risk Warnings**: Specific risks with numbers and impacts
6. **Suggested Adjustments**: Step-by-step rebalancing guidance
7. **Fund Recommendations**: Types and categories of funds to consider
8. **Risk Alignment**: Whether portfolio matches user's risk profile

### For New Investors, the guidance includes:

1. **Financial Readiness**: Honest assessment of investment readiness
2. **Priority Checklist**: Actions to take before investing (insurance, emergency fund)
3. **Investment Guidance**: Suggested allocations by risk appetite
4. **Next Steps**: Clear 2-3 action items to start investing

## Technical Implementation Details

### Diversification Score Calculation

```javascript
sectorDiversityScore = (uniqueSectors / 10) * 30  // Max 30 points
shareDiversityScore = (uniqueShares / 30) * 40    // Max 40 points
herfindahl = sum of (sector_weight)²
concentrationScore = (1 - herfindahl) * 30        // Max 30 points
diversificationScore = sectorDiversityScore + shareDiversityScore + concentrationScore
```

### Score Interpretation

- **80-100**: Excellent diversification
- **60-79**: Good diversification
- **40-59**: Fair diversification (needs improvement)
- **0-39**: Poor diversification (significant improvement needed)

## Fund Data Structure

The analysis works with MongoDB Fund documents:

```javascript
{
  userId: ObjectId,
  name: String,          // Fund name
  amount: Number,        // Investment amount
  holdings: [{
    company: String,     // Stock symbol/name
    sector: String,      // Sector classification
    weight: Number       // % weight in fund (0-100)
  }]
}
```

## Security Considerations

1. **Authentication**: All endpoints require JWT token in Authorization header
2. **Authorization**: Users can only access their own portfolio data
3. **Rate Limiting**: Consider implementing rate limits for Gemini API calls
4. **Error Handling**: Sensitive server errors are not exposed to frontend

## Future Enhancements

1. **Comparison Analysis**: Compare portfolio with benchmark indices
2. **Historical Trends**: Track diversification score over time
3. **Weighted Analysis**: Account for fund sizes in overlap calculations
4. **Custom Sector Lists**: Allow users to define custom sector groupings
5. **Portfolio Recommendations**: AI-generated fund combinations for new users
6. **Rebalancing Suggestions**: Specific fund replacements to improve diversification
7. **Multi-portfolio Support**: Analyze multiple separate portfolios

## Testing Recommendations

1. Test with portfolios of varying sizes (1-10 funds)
2. Test with high overlap (same companies across multiple funds)
3. Test with high sector concentration
4. Test with new users of different risk profiles
5. Test Gemini API fallback to mock responses
6. Test with invalid/expired JWT tokens
7. Test with users having no funds

## Notes for Developers

- All Gemini prompts are instructed to return only valid JSON
- Mock responses are carefully crafted to match expected JSON structure
- Overlapping companies are sorted by number of funds (descending)
- Sectors are identified during fund holdings analysis
- Fund recommendations are based on portfolio gaps, not specific funds
- All explanations avoid future return predictions or guarantees
