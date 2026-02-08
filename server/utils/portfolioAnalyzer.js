const analyzePortfolio = (funds, riskProfile) => {
  const totalInvestment = funds.reduce((sum, fund) => sum + fund.amount, 0)
  
  const sectorExposure = {}
  const companyExposure = {}
  const companyOverlap = {}
  
  funds.forEach(fund => {
    fund.holdings.forEach(holding => {
      const sectorValue = (holding.weight / 100) * fund.amount
      sectorExposure[holding.sector] = (sectorExposure[holding.sector] || 0) + sectorValue
      
      const companyValue = (holding.weight / 100) * fund.amount
      companyExposure[holding.company] = (companyExposure[holding.company] || 0) + companyValue
      
      if (!companyOverlap[holding.company]) {
        companyOverlap[holding.company] = { fundCount: 0, exposure: 0 }
      }
      companyOverlap[holding.company].fundCount += 1
      companyOverlap[holding.company].exposure += companyValue
    })
  })

  const sectorDistribution = Object.entries(sectorExposure).map(([sector, value]) => ({
    name: sector,
    value: parseFloat(((value / totalInvestment) * 100).toFixed(1))
  })).sort((a, b) => b.value - a.value)

  const companyExposureArray = Object.entries(companyExposure).map(([company, exposure]) => ({
    name: company,
    exposure: parseFloat(((exposure / totalInvestment) * 100).toFixed(2))
  })).sort((a, b) => b.exposure - a.exposure)

  const overlapWarnings = Object.entries(companyOverlap)
    .filter(([company, data]) => data.fundCount > 1)
    .map(([company, data]) => ({
      company,
      fundCount: data.fundCount,
      exposure: parseFloat(((data.exposure / totalInvestment) * 100).toFixed(2))
    }))

  const warnings = generateWarnings(sectorExposure, overlapWarnings, riskProfile, totalInvestment)

  return {
    totalInvestment,
    sectorDistribution,
    companyExposure: companyExposureArray,
    sectorExposure: Object.fromEntries(
      Object.entries(sectorExposure).map(([sector, value]) => [
        sector, 
        parseFloat(((value / totalInvestment) * 100).toFixed(1))
      ])
    ),
    overlapWarnings,
    warnings,
    riskProfile
  }
}

const generateWarnings = (sectorExposure, overlapWarnings, riskProfile, totalInvestment) => {
  const warnings = []
  
  const sectorLimits = {
    'Conservative': { max: 30, sectors: ['Banking', 'IT'] },
    'Balanced': { max: 40, sectors: ['Banking', 'IT', 'Energy'] },
    'Aggressive': { max: 50, sectors: ['Banking', 'IT', 'Energy', 'FMCG'] }
  }
  
  const limits = sectorLimits[riskProfile] || sectorLimits['Balanced']
  
  Object.entries(sectorExposure).forEach(([sector, value]) => {
    const percentage = (value / totalInvestment) * 100
    if (percentage > limits.max) {
      warnings.push({
        type: 'sector',
        title: `High ${sector} Exposure`,
        message: `${sector} sector represents ${percentage.toFixed(1)}% of your portfolio, which exceeds the recommended ${limits.max}% for ${riskProfile.toLowerCase()} investors.`
      })
    }
  })
  
  overlapWarnings.forEach(warning => {
    if (warning.exposure > 10) {
      warnings.push({
        type: 'overlap',
        title: `Company Overlap: ${warning.company}`,
        message: `${warning.company} appears in ${warning.fundCount} funds with ${warning.exposure}% total exposure, reducing diversification benefits.`
      })
    }
  })
  
  if (Object.keys(sectorExposure).length < 5) {
    warnings.push({
      type: 'diversification',
      title: 'Limited Sector Diversification',
      message: `Your portfolio spans only ${Object.keys(sectorExposure).length} sectors. Consider adding funds in other sectors for better diversification.`
    })
  }
  
  return warnings
}

module.exports = {
  analyzePortfolio
}