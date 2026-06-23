 const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const Portfolio = require('../models/Portfolio')
const Resume = require('../models/Resume')
const User = require('../models/User')
const { scoreCandidate } = require('../services/langchain')
const { sendInterestEmail } = require('../services/email')

router.get('/candidates', verifyToken, async (req, res) => {
  try {
    const portfolios = await Portfolio.find().populate('userId', 'name email')
    res.json(portfolios)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/search', verifyToken, async (req, res) => {
  try {
    const { jobDescription } = req.body

    const portfolios = await Portfolio.find().populate('userId', 'name email')
    
    const scoredCandidates = await Promise.all(
      portfolios.map(async (portfolio) => {
        const resume = await Resume.findOne({ userId: portfolio.userId._id })
        const resumeText = resume ? resume.rawText : portfolio.skills.join(', ')
        const score = await scoreCandidate(jobDescription, resumeText)
        return {
          portfolio,
          score
        }
      })
    )

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
