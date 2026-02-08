const express = require('express')
const Fund = require('../models/Fund')
const User = require('../models/User')
const portfolioAnalyzer = require('../utils/portfolioAnalyzer')
const { analyzePortfolioDetailed } = require('../utils/detailedAnalyzer')
const router = express.Router()

router.get('/analyze', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const funds = await Fund.find({ userId: decoded.userId })
    const user = await User.findById(decoded.userId)

    if (funds.length === 0) {
      return res.json({
        totalInvestment: 0,
        sectorDistribution: [],
        companyExposure: [],
        warnings: [],
        riskProfile: user.riskProfile
      })
    }

    const analysis = portfolioAnalyzer.analyzePortfolio(funds, user.riskProfile)
    res.json(analysis)
  } catch (error) {
    console.error('Portfolio analysis error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

/**
 * Detailed portfolio analysis endpoint
 * Provides: overlapping shares, overlapping sectors, diversification score,
 * potential sectors to invest in, and fund recommendations
 */
router.post('/detailed-analysis', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get funds from database
    const funds = await Fund.find({ userId: decoded.userId })
    const user = await User.findById(decoded.userId)

    if (funds.length === 0) {
      return res.json({
        totalFunds: 0,
        totalInvestment: 0,
        overlappingShares: [],
        overlappingSectors: [],
        diversificationScore: { overall: 0, assessment: { level: 'None', description: 'No portfolio to analyze' } },
        potentialSectors: [],
        fundRecommendations: []
      })
    }

    // Get detailed analysis
    const detailedAnalysis = analyzePortfolioDetailed(funds)
    
    // Also include basic portfolio analysis for context
    const basicAnalysis = portfolioAnalyzer.analyzePortfolio(funds, user.riskProfile)

    res.json({
      ...detailedAnalysis,
      riskProfile: user.riskProfile,
      basicAnalysis: {
        sectorDistribution: basicAnalysis.sectorDistribution,
        companyExposure: basicAnalysis.companyExposure,
        warnings: basicAnalysis.warnings
      }
    })
  } catch (error) {
    console.error('Detailed analysis error:', error)
    res.status(500).json({ message: 'Failed to generate detailed analysis' })
  }
})

module.exports = router