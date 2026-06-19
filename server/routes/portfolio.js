 const express = require('express')
const router = express.Router()
const Portfolio = require('../models/Portfolio')
const Resume = require('../models/Resume')
const verifyToken = require('../middleware/verifyToken')

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { username, bio, projects, experience, education } = req.body

    const existing = await Portfolio.findOne({ username })
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' })
    }

    const resume = await Resume.findOne({ userId: req.user.id })
    const skills = resume ? resume.skills : []

    const portfolio = await Portfolio.create({
      userId: req.user.id,
      username,
      bio,
      skills,
      projects: projects || [],
      experience: experience || [],
      education: education || []
    })

    res.status(201).json({ message: 'Portfolio created', portfolio })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/me', verifyToken, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id })
    if (!portfolio) {
      return res.status(404).json({ message: 'No portfolio found' })
    }
    res.json(portfolio)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/update', verifyToken, async (req, res) => {
  try {
    const { bio, projects, experience, education } = req.body

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user.id },
      { bio, projects, experience, education },
      { new: true }
    )

    res.json({ message: 'Portfolio updated', portfolio })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:username', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ username: req.params.username })
      .populate('userId', 'name email')

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' })
    }

    res.json(portfolio)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
