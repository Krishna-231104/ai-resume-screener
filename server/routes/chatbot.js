const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { ragChatbot, embedPortfolios } = require('../services/pinecone')
const Portfolio = require('../models/Portfolio')

// Chat endpoint (RAG)
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message required' })
    }

    const response = await ragChatbot(message, req.user.id)
    res.json(response)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Admin: Sync portfolios to Pinecone (call this periodically)
router.post('/sync-portfolios', verifyToken, async (req, res) => {
  try {
    // Only admins can sync
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' })
    }

    const portfolios = await Portfolio.find().populate('userId', 'name email')
    await embedPortfolios(portfolios)
    
    res.json({ 
      message: `Synced ${portfolios.length} portfolios to Pinecone`,
      count: portfolios.length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
