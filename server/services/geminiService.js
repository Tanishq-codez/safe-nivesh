const { GoogleGenerativeAI } = require("@google/generative-ai")

/**
 * generateInsights:
 * - userType: "existing" | "new"
 * - answers: object for new users
 * - portfolioData: object for existing users
 * - analysisData: detailed analysis from detailedAnalyzer (for existing users with deep analysis)
 */
const generateInsights = async ({
  userType,
  answers = {},
  portfolioData = {},
  analysisData = {}
}) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return mockResponse(userType, answers, portfolioData, analysisData)
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.3 }
    })

    const prompt = userType === "existing" && analysisData.totalFunds
      ? buildDetailedPrompt(userType, analysisData, portfolioData)
      : buildPrompt(userType, answers, portfolioData)

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return JSON.parse(text)
  } catch (err) {
    console.error("Gemini error:", err)
    return mockResponse(userType, answers, portfolioData, analysisData)
  }
}

/**
 * Detailed prompt for portfolios with overlap and diversification analysis
 */
const buildDetailedPrompt = (userType, analysisData = {}, portfolioData = {}) => {
  const formattedShares = formatOverlappingShares(analysisData.overlappingShares)
  const formattedSectors = formatOverlappingSectors(analysisData.overlappingSectors)
  const formattedDivScore = formatDiversificationScore(analysisData.diversificationScore)
  const formattedPotentialSectors = formatPotentialSectors(analysisData.potentialSectors)

  return `
You are a financial advisor analyzing a REAL mutual fund portfolio with detailed overlap analysis.

DETAILED PORTFOLIO DATA:
- Total Funds: ${analysisData.totalFunds || "unknown"}
- Total Investment: ₹${portfolioData.totalInvestment ? Number(portfolioData.totalInvestment).toLocaleString() : "unknown"}
- Risk Profile: ${portfolioData.riskProfile || "unknown"}
- Unique Sectors: ${analysisData.uniqueSectors || "unknown"}
- Unique Holdings: ${analysisData.uniqueShares || "unknown"}

OVERLAPPING SHARES (Concentration Risk):
${formattedShares}

OVERLAPPING SECTORS:
${formattedSectors}

DIVERSIFICATION ASSESSMENT:
${formattedDivScore}

POTENTIAL SECTORS TO ADD:
${formattedPotentialSectors}

CRITICAL INSTRUCTIONS:
- Reference SPECIFIC shares and sectors from the analysis
- Explain HOW the overlaps reduce benefits of diversification
- Use the diversification score to assess portfolio quality (0-100)
- Recommend adding the listed potential sectors ONLY
- Each response section should be 3-4 sentences minimum
- No fund names - only fund categories and types
- No future return predictions
- Educational, retail-investor friendly tone

Return ONLY valid JSON in this exact format:
{
  "portfolioHealth": "assessment of overall portfolio health with specific reference to overlaps",
  "overlappingHoldings": "detailed explanation of which shares appear in multiple funds and impact",
  "overlappingSharesDetail": [
    {
      "company": "Company Name",
      "numberOfFunds": 3,
      "funds": ["Fund1", "Fund2", "Fund3"],
      "totalExposurePercent": 15
    }
  ],
  "sectorCongestion": "specific analysis of overlapping sectors and concentration",
  "overlappingSectorsDetail": [
    {
      "sector": "Sector Name",
      "numberOfFunds": 3,
      "funds": ["Fund1", "Fund2", "Fund3"],
      "totalExposurePercent": 35
    }
  ],
  "diversificationAssessment": "detailed assessment based on diversification score with suggestions",
  "diversificationScoreDetail": {
    "overall": 65,
    "level": "Good",
    "sectorDiversity": 20,
    "shareDiversity": 26,
    "concentrationScore": 19
  },
  "riskWarnings": [
    {
      "title": "specific risk with numbers",
      "message": "2-3 sentence explanation with examples from the data"
    }
  ],
  "potentialSectors": [
    {
      "sector": "Sector Name",
      "reason": "This sector is underrepresented in your portfolio",
      "expectedCharacteristics": ["Growth", "Stability"]
    }
  ],
  "suggestedAdjustments": "step-by-step rebalancing guidance including which sectors to add",
  "fundRecommendations": "specific fund types and categories for the recommended sectors",
  "fundRecommendationsDetail": [
    {
      "sector": "Sector Name",
      "fundType": "Sector-Specific Mutual Fund",
      "recommendation": "Add a fund focused on...",
      "rationale": "..."
    }
  ],
  "riskAlignment": "assessment of portfolio vs risk profile"
}
`
}

/**
 * Standard prompt for basic portfolio analysis
 */
const buildPrompt = (userType, answers = {}, portfolioData = {}) => {
  if (userType === "existing") {
    return `
You are a financial advisor analyzing a REAL mutual fund portfolio.

PORTFOLIO DATA:
- Total Investment: ₹${portfolioData.totalInvestment || "unknown"}
- Risk Profile: ${portfolioData.riskProfile || "unknown"}
- Sector Exposure: ${JSON.stringify(portfolioData.sectorExposure || {})}
- Fund Overlaps: ${JSON.stringify(portfolioData.overlapWarnings || [])}
- Top Holdings: ${JSON.stringify(
      (portfolioData.companyExposure || []).slice(0, 5)
    )}

IMPORTANT INSTRUCTIONS:
- Base your analysis ONLY on the portfolio data above
- Be specific and practical
- Explain WHY something is risky or good
- Each explanation should be at least 3–4 sentences
- Use simple language for retail investors

Return ONLY valid JSON in this exact format:
{
  "portfolioHealth": "detailed explanation",
  "riskWarnings": [
    {
      "title": "clear risk title",
      "message": "2–3 sentence explanation of the risk"
    }
  ],
  "sectorCongestion": "explain which sectors are overexposed and why it matters",
  "suggestedAdjustments": "step-by-step diversification guidance (no fund names)",
  "riskAlignment": "explain if portfolio suits the risk profile"
}

Rules:
- No fund names
- No future return predictions
- Educational, neutral tone
`
  }

  return `
You are a friendly financial mentor guiding a FIRST-TIME investor.

User details:
- Insurance: ${answers.hasInsurance || "unknown"}
- Emergency Fund (6 months): ${answers.hasEmergencyFund || "unknown"}
- Monthly Investment Capacity: ₹${answers.monthlyInvestment || "unknown"}
- Risk Appetite: ${answers.riskAppetite || "unknown"}
- Investment Horizon: ${answers.investmentHorizon || "unknown"}

IMPORTANT:
- Explain concepts clearly and calmly
- Each explanation must be at least 3–4 sentences
- Focus on financial safety first
- No selling or aggressive language

Return ONLY valid JSON:
{
  "financialReadiness": "explain whether the user is ready to invest and why",
  "priorityChecklist": [
    "actionable step with reason",
    "actionable step with reason",
    "actionable step with reason"
  ],
  "investmentGuidance": "how and when the user should start investing",
  "nextSteps": "clear next 2–3 actions"
}

Rules:
- No fund names
- No return promises
- Beginner-friendly, educational tone
`
}

/**
 * Format overlapping shares for the prompt
 */
const formatOverlappingShares = (shares = []) => {
  if (!shares || shares.length === 0) {
    return "No significant overlapping shares detected."
  }
  return shares
    .slice(0, 5)
    .map(
      s =>
        `- ${s.company}: Found in ${s.numberOfFunds} funds (${s.funds.slice(0, 3).join(
          ", "
        )}), Total Exposure: ${s.totalExposurePercent}%`
    )
    .join("\n")
}

/**
 * Format overlapping sectors for the prompt
 */
const formatOverlappingSectors = (sectors = []) => {
  if (!sectors || sectors.length === 0) {
    return "Sectors are well-distributed across funds."
  }
  return sectors
    .slice(0, 5)
    .map(
      s =>
        `- ${s.sector}: Present in ${s.numberOfFunds} funds (${s.funds.slice(0, 3).join(
          ", "
        )}), Total Exposure: ${s.totalExposurePercent}%`
    )
    .join("\n")
}

/**
 * Format diversification score for the prompt
 */
const formatDiversificationScore = (divScore = {}) => {
  if (!divScore || !divScore.overall) {
    return "Diversification data not available."
  }
  const score = divScore.overall || 0
  const level = divScore.assessment?.level || "Unknown"
  const description = divScore.assessment?.description || "No assessment available"
  const suggestion = divScore.assessment?.suggestion || "Consider rebalancing"
  return `Overall Score: ${score}/100 (${level}). ${description}. ${suggestion}`
}

/**
 * Format potential sectors for the prompt
 */
const formatPotentialSectors = (sectors = []) => {
  if (!sectors || sectors.length === 0) {
    return "All major sectors are already represented."
  }
  return sectors
    .slice(0, 5)
    .map(s => `- ${s.sector}: ${s.reason}`)
    .join("\n")
}

/**
 * Personalized mockResponse
 */
const mockResponse = (userType, answers = {}, portfolioData = {}, analysisData = {}) => {
  const toNumber = (v) => {
    const n = Number(String(v).replace(/[^0-9.-]+/g, ""))
    return Number.isFinite(n) ? n : null
  }

  if (userType === "existing") {
    const total = portfolioData.totalInvestment
      ? `₹${Number(portfolioData.totalInvestment).toLocaleString()}`
      : "an undisclosed amount"
    const riskProfile = portfolioData.riskProfile || "unknown"
    const overlaps = analysisData.overlappingShares || []
    const sectorOverlaps = analysisData.overlappingSectors || []
    const divScore = analysisData.diversificationScore || {}
    const potentialSectors = analysisData.potentialSectors || []

    const portfolioHealth = `Your portfolio has ${total} across ${analysisData.totalFunds || "multiple"} funds with a ${riskProfile} risk profile. With a diversification score of ${divScore.overall || "N/A"}/100 (${divScore.assessment?.level || ""}), the portfolio has moderate to high concentration risk. Reducing overlaps and adding new sectors will improve portfolio quality.`

    const overlappingHoldings = overlaps.length
      ? `Companies like ${overlaps.slice(0, 2).map(o => o.company).join(", ")} appear across multiple funds, with total exposure of ${overlaps[0].totalExposurePercent}%. This overlap means you're concentrated in the same holdings across different funds, which defeats the purpose of diversification. Consider replacing funds with overlapping holdings.`
      : "Your portfolio shows minimal overlap in individual holdings, which is positive for true diversification."

    const sectorCongestion = sectorOverlaps.length
      ? `Sectors like ${sectorOverlaps.slice(0, 2).map(s => s.sector).join(", ")} appear across ${sectorOverlaps[0].numberOfFunds} or more funds. This concentration increases sector-specific risk—if that sector underperforms, multiple funds will be impacted similarly. Diversify into unrepresented sectors.`
      : "Sectors are generally well-distributed without major concentration."

    const suggestedSectorsList = potentialSectors
      .slice(0, 3)
      .map(s => s.sector)
      .join(", ")

    const diversificationAssessment = `Your diversification score of ${divScore.overall}/100 (${divScore.assessment?.level}) indicates ${divScore.assessment?.description || ""}. To improve: ${divScore.assessment?.suggestion || "add more diverse sectors"}. Specifically, consider adding funds in ${suggestedSectorsList}.`

    const riskWarnings = []
    if (overlaps.length > 0) {
      riskWarnings.push({
        title: "Significant Holding Overlap",
        message: `${overlaps[0].company} appears in ${overlaps[0].numberOfFunds} funds with ${overlaps[0].totalExposurePercent}% exposure. This overlap reduces diversification benefits and increases company-specific risk.`
      })
    }
    if (sectorOverlaps.length > 0) {
      riskWarnings.push({
        title: "Sector Concentration",
        message: `${sectorOverlaps[0].sector} is present across multiple funds with ${sectorOverlaps[0].totalExposurePercent}% total exposure. Sector concentration increases systematic risk. Add unrepresented sectors to reduce this risk.`
      })
    }
    if (divScore.overall && divScore.overall < 50) {
      riskWarnings.push({
        title: "Low Diversification",
        message: "Your portfolio needs significant diversification improvements. Prioritize adding funds in new sectors and replacing overlapping holdings."
      })
    }

    const suggestedAdjustments = `Step 1: Replace 1-2 funds with the highest overlap. Step 2: Add sector funds in ${suggestedSectorsList}. Step 3: Rebalance quarterly and monitor overlap. This will improve your diversification score and reduce concentration risk.`

    const fundRecommendations = `Explore funds focused on ${suggestedSectorsList} such as sector-specific mutual funds or thematic funds. Look for funds with low expense ratios and minimal overlap with your existing holdings. Diversified index funds in new sectors can also add variety.`

    const riskAlignment = `Your portfolio does not fully align with a ${riskProfile} profile due to concentration issues. With the suggested improvements—especially adding new sectors and reducing overlaps—it will better reflect your intended risk appetite.`

    // Detailed structures for frontend display
    const overlappingSharesDetail = overlaps.map(o => ({
      company: o.company,
      numberOfFunds: o.numberOfFunds,
      funds: o.funds,
      totalExposurePercent: o.totalExposurePercent
    }))

    const overlappingSectorsDetail = sectorOverlaps.map(s => ({
      sector: s.sector,
      numberOfFunds: s.numberOfFunds,
      funds: s.funds,
      totalExposurePercent: s.totalExposurePercent
    }))

    const diversificationScoreDetail = divScore.overall ? {
      overall: divScore.overall,
      level: divScore.assessment?.level || "Fair",
      sectorDiversity: Math.round((divScore.overall || 50) * 0.3),
      shareDiversity: Math.round((divScore.overall || 50) * 0.4),
      concentrationScore: Math.round((divScore.overall || 50) * 0.3)
    } : null

    const potentialSectorsFormatted = potentialSectors.slice(0, 5).map(s => ({
      sector: s.sector,
      reason: s.reason,
      expectedCharacteristics: s.expectedCharacteristics || []
    }))

    const fundRecommendationsDetail = potentialSectors.slice(0, 3).map(s => ({
      sector: s.sector,
      fundType: "Sector-Specific Mutual Fund",
      recommendation: `Add a fund focused on ${s.sector} to diversify away from current concentration.`,
      rationale: s.reason || `${s.sector} is underrepresented in your current portfolio.`
    }))

    return {
      portfolioHealth,
      overlappingHoldings,
      overlappingSharesDetail,
      sectorCongestion,
      overlappingSectorsDetail,
      diversificationAssessment,
      diversificationScoreDetail,
      riskWarnings: riskWarnings.length ? riskWarnings : [{ title: "Analysis data incomplete", message: "Unable to assess specific overlaps from available data." }],
      potentialSectors: potentialSectorsFormatted,
      suggestedAdjustments,
      fundRecommendations,
      fundRecommendationsDetail,
      riskAlignment,
      _source: "fallback"
    }
  }

  // NEW USER
  const monthly = toNumber(answers.monthlyInvestment)
  const recommendedEmergency = monthly ? `~₹${(monthly * 6).toLocaleString()}` : "6 months of expenses"
  const hasInsurance = String(answers.hasInsurance || "").toLowerCase()
  const hasEmergencyFund = String(answers.hasEmergencyFund || "").toLowerCase()
  const riskAppetite = answers.riskAppetite || "moderate"

  const financialReadiness = []
  if (hasInsurance !== "no") { financialReadiness.push("You have insurance coverage, which is important.") }
  else { financialReadiness.push("You lack insurance; this is a priority before investing.") }
  if (hasEmergencyFund === "yes") { financialReadiness.push("Your emergency fund is ready, so you can start investing.") }
  else { financialReadiness.push(`Build an emergency fund of about ${recommendedEmergency}.`) }

  const priorityChecklist = []
  if (hasEmergencyFund !== "yes") priorityChecklist.push(`Build emergency fund (${recommendedEmergency})`)
  if (hasInsurance === "no") priorityChecklist.push("Get health and life insurance")
  priorityChecklist.push("Start a small SIP once safety net is in place")

  let allocation = ""
  let sipAmount = 1000
  if (monthly) { sipAmount = Math.round(monthly * 0.1) }
  if (riskAppetite === "low") {
    allocation = `60% debt, 30% equity, 10% balanced. SIP: ₹${sipAmount.toLocaleString()}`
  } else if (riskAppetite === "high") {
    allocation = `70% equity, 20% growth, 10% debt. SIP: ₹${sipAmount.toLocaleString()}`
  } else {
    allocation = `50% equity, 30% debt, 20% hybrid. SIP: ₹${sipAmount.toLocaleString()}`
  }

  return {
    financialReadiness: financialReadiness.join(" "),
    priorityChecklist,
    investmentGuidance: `Suggested allocation: ${allocation}`,
    nextSteps: priorityChecklist.slice(0, 3).join(" Then ")
  }
}

module.exports = { generateInsights }
