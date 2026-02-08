const express = require("express");
const Fund = require("../models/Fund");
const User = require("../models/User");
const geminiService = require("../services/geminiService");
const portfolioAnalyzer = require("../utils/portfolioAnalyzer");
const { analyzePortfolioDetailed } = require("../utils/detailedAnalyzer");

const router = express.Router();

/**
 * AI Insights endpoint
 * Handles both new and existing users
 * - New users send answers from onboarding form
 * - Existing users send portfolioData and optionally analysisData for detailed analysis
 */
router.post("/insights", async (req, res) => {
  console.log("Received request for AI insights, userType:", req.body.userType);
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userType = req.body.userType;

    if (userType === "new") {
      // New investor: Just need answers
      const insights = await geminiService.generateInsights({
        userType: "new",
        answers: req.body.answers || {}
      });
      res.json(insights);
    } else if (userType === "existing") {
      // Existing investor: Get portfolio and detailed analysis
      const funds = await Fund.find({ userId: decoded.userId });
      const user = await User.findById(decoded.userId);

      if (funds.length === 0) {
        return res.status(400).json({ message: "No funds found for analysis" });
      }

      // Get basic portfolio analysis
      const portfolioData = portfolioAnalyzer.analyzePortfolio(
        funds,
        user.riskProfile
      );

      // Get detailed analysis
      const analysisData = analyzePortfolioDetailed(funds);

      // Generate insights using both data
      const insights = await geminiService.generateInsights({
        userType: "existing",
        portfolioData,
        analysisData
      });

      res.json(insights);
    } else {
      return res.status(400).json({ message: "Invalid userType" });
    }
  } catch (error) {
    console.error("AI insights error:", error);
    res.status(500).json({ message: "Failed to generate AI insights" });
  }
});

module.exports = router;

