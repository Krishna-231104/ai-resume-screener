const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { ragChatbot, embedPortfolios } = require('../services/pinecone')
const { answerCareerQuestion } = require('../services/langchain')
const Portfolio = require('../models/Portfolio')
const Resume = require('../models/Resume')

// Career advice chatbot — uses user's own resume as context
router.post('/ask', verifyToken, async (req, res) => {
  try {
    const { question } = req.body

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' })
    }

    // Auto-fetch user's resume from DB for context
    const resume = await Resume.findOne({ userId: req.user.id })

    let resumeContext = 'No resume uploaded yet.'
    if (resume && resume.rawText) {
      // Use skills + raw text snippet as context (keep it concise for token limits)
      resumeContext = `Skills: ${resume.skills.join(', ')}\n\nResume Text (excerpt):\n${resume.rawText.slice(0, 3000)}`
    }

    const answer = await answerCareerQuestion(question, resumeContext)
    res.json({ answer })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// RAG-based chat using Pinecone vector search (existing endpoint — untouched)
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
