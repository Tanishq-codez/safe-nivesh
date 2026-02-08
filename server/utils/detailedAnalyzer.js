/**
 * detailedAnalyzer.js
 * Provides comprehensive analysis of mutual fund portfolios:
 * - Overlapping shares across funds
 * - Overlapping sectors across funds
 * - Diversification score
 * - Potential sectors to invest in
 * - Fund recommendations for potential sectors
 */

const analyzePortfolioDetailed = (funds) => {
  if (!funds || funds.length === 0) {
    return {
      totalFunds: 0,
      totalInvestment: 0,
      overlappingShares: [],
      overlappingSectors: [],
      diversificationScore: 0,
      potentialSectors: [],
      fundRecommendations: []
    }
  }

  const totalInvestment = funds.reduce((sum, fund) => sum + fund.amount, 0)
  const totalFunds = funds.length

  // ============================================
  // 1. OVERLAPPING SHARES ANALYSIS
  // ============================================
  const shareOccurrences = {}
  const fundsByShare = {}

  funds.forEach(fund => {
    fund.holdings.forEach(holding => {
      const company = holding.company
      if (!shareOccurrences[company]) {
        shareOccurrences[company] = { count: 0, funds: [], totalWeight: 0, totalExposure: 0 }
        fundsByShare[company] = []
      }
      shareOccurrences[company].count += 1
      shareOccurrences[company].funds.push({
        fundName: fund.name,
        weight: holding.weight,
        exposure: (holding.weight / 100) * fund.amount
      })
      shareOccurrences[company].totalWeight += holding.weight
      shareOccurrences[company].totalExposure += (holding.weight / 100) * fund.amount
      fundsByShare[company].push(fund.name)
    })
  })

  // Get overlapping shares (appear in more than 1 fund)
  const overlappingShares = Object.entries(shareOccurrences)
    .filter(([, data]) => data.count > 1)
    .map(([company, data]) => ({
      company,
      numberOfFunds: data.count,
      funds: [...new Set(data.funds.map(f => f.fundName))],
      totalExposurePercent: parseFloat(((data.totalExposure / totalInvestment) * 100).toFixed(2)),
      averageWeight: parseFloat((data.totalWeight / data.count).toFixed(2)),
      fundDetails: data.funds
    }))
    .sort((a, b) => b.numberOfFunds - a.numberOfFunds)

  // ============================================
  // 2. OVERLAPPING SECTORS ANALYSIS
  // ============================================
  const sectorOccurrences = {}
  const fundsBySector = {}

  funds.forEach(fund => {
    const sectorsInFund = new Set()
    fund.holdings.forEach(holding => {
      const sector = holding.sector
      if (!sectorOccurrences[sector]) {
        sectorOccurrences[sector] = { count: 0, funds: [], totalExposure: 0 }
        fundsBySector[sector] = new Set()
      }
      if (!sectorsInFund.has(sector)) {
        sectorOccurrences[sector].count += 1
        sectorsInFund.add(sector)
      }
      sectorOccurrences[sector].totalExposure += (holding.weight / 100) * fund.amount
      fundsBySector[sector].add(fund.name)
    })
  })

  const overlappingSectors = Object.entries(sectorOccurrences)
    .filter(([, data]) => data.count > 1)
    .map(([sector, data]) => ({
      sector,
      numberOfFunds: data.count,
      funds: Array.from(fundsBySector[sector]),
      totalExposurePercent: parseFloat(((data.totalExposure / totalInvestment) * 100).toFixed(2))
    }))
    .sort((a, b) => b.numberOfFunds - a.numberOfFunds)

  // ============================================
  // 3. DIVERSIFICATION SCORE
  // ============================================
  const uniqueSectors = Object.keys(sectorOccurrences)
  const uniqueShares = Object.keys(shareOccurrences)

  // Diversification score based on:
  // - Number of unique sectors (max 30 points)
  // - Number of unique shares (max 40 points)
  // - Sector concentration (max 30 points)
  const sectorCount = Math.min(uniqueSectors.length, 10) // 10 sectors = full score
  const shareCount = Math.min(uniqueShares.length, 30) // 30 shares = full score
  
  const sectorDiversityScore = (sectorCount / 10) * 30
  const shareDiversityScore = (shareCount / 30) * 40

  // Concentration penalty (Herfindahl index)
  const sectorWeights = Object.entries(sectorOccurrences).map(
    ([, data]) => (data.totalExposure / totalInvestment)
  )
  const herfindahl = sectorWeights.reduce((sum, w) => sum + w * w, 0)
  const concentrationScore = Math.max(0, (1 - herfindahl) * 30)

  const diversificationScore = Math.round(sectorDiversityScore + shareDiversityScore + concentrationScore)

  // ============================================
  // 4. POTENTIAL SECTORS TO INVEST IN
  // ============================================
  // Common Indian sectors
  const allCommonSectors = [
    'Financial Services',
    'Information Technology',
    'Banking',
    'Insurance',
    'FMCG',
    'Healthcare',
    'Pharmaceuticals',
    'Utilities',
    'Telecommunications',
    'Consumer Discretionary',
    'Real Estate',
    'Energy',
    'Oil & Gas',
    'Infrastructure',
    'Industrial Manufacturing',
    'Materials',
    'Metals',
    'Automobiles',
    'Construction',
    'Media & Entertainment'
  ]

  const currentSectors = new Set(uniqueSectors)
  const potentialSectors = allCommonSectors
    .filter(sector => !currentSectors.has(sector))
    .map(sector => ({
      sector,
      reason: `Currently not represented in portfolio`
    }))

  // ============================================
  // 5. FUND RECOMMENDATIONS
  // ============================================
  // Recommendations catering to potential sectors
  const fundRecommendations = potentialSectors.slice(0, 5).map(ps => ({
    sector: ps.sector,
    recommendation: `Explore mutual funds focused on ${ps.sector} to add diversification`,
    rationale: `${ps.sector} is not currently in your portfolio and can diversify your risk`,
    fundType: determineFundType(ps.sector),
    expectedCharacteristics: getExpectedCharacteristics(ps.sector)
  }))

  return {
    totalFunds,
    totalInvestment,
    uniqueSectors: uniqueSectors.length,
    uniqueShares: uniqueShares.length,
    overlappingShares,
    overlappingSectors,
    diversificationScore: {
      overall: diversificationScore,
      sectorDiversity: Math.round(sectorDiversityScore),
      shareDiversity: Math.round(shareDiversityScore),
      concentrationScore: Math.round(concentrationScore),
      assessment: assessDiversification(diversificationScore)
    },
    potentialSectors,
    fundRecommendations
  }
}

/**
 * Determine fund type based on sector
 */
const determineFundType = (sector) => {
  const sectorToType = {
    'Financial Services': 'Sector Fund / Focused Fund',
    'Information Technology': 'Sector Fund / Tech Fund',
    'Banking': 'Sector Fund / Banking Fund',
    'Insurance': 'Sector Fund / Financial Services Fund',
    'FMCG': 'Sector Fund / FMCG Fund',
    'Healthcare': 'Sector Fund / Healthcare Fund',
    'Pharmaceuticals': 'Sector Fund / Healthcare Fund',
    'Utilities': 'Sector Fund / Infrastructure Fund',
    'Telecommunications': 'Sector Fund / Telecom Fund',
    'Consumer Discretionary': 'Thematic Fund',
    'Real Estate': 'Sector Fund / Realty Fund',
    'Energy': 'Sector Fund / Energy Fund',
    'Oil & Gas': 'Sector Fund / Energy Fund',
    'Infrastructure': 'Sector Fund / Infrastructure Fund',
    'Industrial Manufacturing': 'Sector Fund',
    'Materials': 'Sector Fund / Commodities Fund',
    'Metals': 'Thematic Fund / Commodities Fund',
    'Automobiles': 'Sector Fund / Auto Fund',
    'Construction': 'Sector Fund / Construction Fund',
    'Media & Entertainment': 'Thematic Fund'
  }
  return sectorToType[sector] || 'Sector Fund'
}

/**
 * Get expected characteristics for a sector
 */
const getExpectedCharacteristics = (sector) => {
  const characteristics = {
    'Financial Services': ['Growth potential', 'Cyclical', 'Market-sensitive'],
    'Information Technology': ['High growth', 'Volatile', 'Global exposure'],
    'Banking': ['Stable returns', 'Dividend-paying', 'Interest rate sensitive'],
    'Insurance': ['Stable earnings', 'Growth potential', 'Regulatory sensitive'],
    'FMCG': ['Defensive', 'Stable', 'Inflation hedge'],
    'Healthcare': ['Growth', 'Defensive', 'Regulatory risks'],
    'Pharmaceuticals': ['Growth', 'Quality earnings', 'Global demand'],
    'Utilities': ['Defensive', 'Dividend-paying', 'Regular returns'],
    'Telecommunications': ['Stable', 'Cyclical', 'Infrastructure'],
    'Consumer Discretionary': ['Cyclical', 'Growth', 'Discretionary spending'],
    'Real Estate': ['Cyclical', 'Growth', 'Interest-rate sensitive'],
    'Energy': ['Cyclical', 'Commodity-dependent', 'High volatility'],
    'Oil & Gas': ['Commodity-dependent', 'High volatility', 'Capital intensive'],
    'Infrastructure': ['Growth', 'Long-term', 'Policy dependent'],
    'Industrial Manufacturing': ['Cyclical', 'Economic growth dependent', 'Volatile'],
    'Materials': ['Cyclical', 'Commodity-dependent', 'Global demand'],
    'Metals': ['Commodity-dependent', 'Inflation hedge', 'Volatile'],
    'Automobiles': ['Cyclical', 'Growth potential', 'Economic sensitive'],
    'Construction': ['Cyclical', 'Growth', 'Policy dependent'],
    'Media & Entertainment': ['Cyclical', 'Growth', 'Discretionary spending']
  }
  return characteristics[sector] || ['Growth potential', 'Diversification']
}

/**
 * Assess diversification quality
 */
const assessDiversification = (score) => {
  if (score >= 80) {
    return {
      level: 'Excellent',
      description: 'Your portfolio is very well-diversified across sectors and holdings with low concentration risk',
      suggestion: 'Maintain current diversification and rebalance periodically'
    }
  } else if (score >= 60) {
    return {
      level: 'Good',
      description: 'Your portfolio has reasonable diversification but can be improved',
      suggestion: 'Consider adding 1-2 funds in underrepresented sectors'
    }
  } else if (score >= 40) {
    return {
      level: 'Fair',
      description: 'Your portfolio shows concentration in certain sectors or stocks',
      suggestion: 'Diversify into new sectors and reduce overlap with existing holdings'
    }
  } else {
    return {
      level: 'Poor',
      description: 'Your portfolio is concentrated with high overlap and limited sector diversity',
      suggestion: 'Prioritize adding funds in new sectors and replacing overlapping funds'
    }
  }
}

module.exports = {
  analyzePortfolioDetailed
}
