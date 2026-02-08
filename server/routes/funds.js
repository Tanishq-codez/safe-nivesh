const express = require('express')
const Fund = require('../models/Fund')
const zerodhaService = require('../services/zerodhaService')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const funds = await Fund.find({ userId: decoded.userId })
    res.json({ funds })
  } catch (error) {
    console.error('Fetch funds error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { name, amount } = req.body

    const holdings = await zerodhaService.getFundHoldings(name)
    
    const fund = new Fund({
      userId: decoded.userId,
      name,
      amount,
      holdings
    })

    await fund.save()
    res.status(201).json({ message: 'Fund added successfully', fund })
  } catch (error) {
    console.error('Add fund error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const fund = await Fund.findOneAndDelete({ 
      _id: req.params.id, 
      userId: decoded.userId 
    })

    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' })
    }

    res.json({ message: 'Fund deleted successfully' })
  } catch (error) {
    console.error('Delete fund error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router