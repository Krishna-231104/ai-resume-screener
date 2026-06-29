const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const Portfolio = require('../models/Portfolio')
const Resume = require('../models/Resume')
const User = require('../models/User')
const { scoreCandidate } = require('../services/langchain')
const { semanticSearch } = require('../services/pinecone')
const { sendInterestEmail } = require('../services/email')

router.get('/candidates', verifyToken, async (req, res) => {
  try {
    const portfolios = await Portfolio.find().populate('userId', 'name email')
    res.json(portfolios)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Hybrid search: Pinecone semantic search + Groq AI scoring
router.post('/search', verifyToken, async (req, res) => {
  try {
    const { jobDescription } = req.body

    // Step 1: Pinecone semantic search — finds top candidates by vector similarity
    let pineconeResults = []
    try {
      pineconeResults = await semanticSearch(jobDescription, 20)
      console.log(`🔵 Pinecone returned ${pineconeResults.length} semantic matches`)
    } catch (pineconeErr) {
      console.warn('⚠️ Pinecone search failed, falling back to full DB scan:', pineconeErr.message)
    }

    let scoredCandidates = []

    if (pineconeResults.length > 0) {
      // Step 2a: Use Pinecone results — fetch full portfolio from MongoDB for each match
      scoredCandidates = await Promise.all(
        pineconeResults.map(async (result) => {
          const portfolio = await Portfolio.findById(result.portfolioId).populate('userId', 'name email')
          if (!portfolio || !portfolio.userId) return null

          // Use Pinecone's vector similarity score (0–100) + optional AI boost
          const resume = await Resume.findOne({ userId: portfolio.userId._id })
          let aiScore = result.score
          try {
            const resumeText = resume ? resume.rawText : portfolio.skills.join(', ')
            aiScore = await scoreCandidate(jobDescription, resumeText)
          } catch {}

          // Hybrid score: 60% AI + 40% semantic similarity
          const hybridScore = Math.round(aiScore * 0.6 + result.score * 0.4)

          return {
            portfolio,
            score: hybridScore,
            semanticScore: result.score,
            searchMethod: 'semantic+ai'
          }
        })
      )
      scoredCandidates = scoredCandidates.filter(Boolean)
    } else {
      // Step 2b: Fallback — full DB scan with AI scoring only
      const portfolios = await Portfolio.find().populate('userId', 'name email')
      scoredCandidates = await Promise.all(
        portfolios
          .filter(p => p.userId)
          .map(async (portfolio) => {
            const resume = await Resume.findOne({ userId: portfolio.userId._id })
            const resumeText = resume ? resume.rawText : portfolio.skills.join(', ')
            const score = await scoreCandidate(jobDescription, resumeText)
            return { portfolio, score, searchMethod: 'ai-only' }
          })
      )
    }

    const ranked = scoredCandidates.sort((a, b) => b.score - a.score)
    res.json(ranked)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/express-interest', verifyToken, async (req, res) => {
  try {
    const { candidateId, jobTitle } = req.body
    const recruiter = await User.findById(req.user.id)
    const candidate = await User.findById(candidateId)

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' })
    }

    await sendInterestEmail(candidate.email, candidate.name, recruiter.name, jobTitle)
    res.json({ message: 'Interest email sent successfully!' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
