const express = require('express')
const router = express.Router()
const multer = require('multer')
const { PdfReader } = require('pdfreader')
const Resume = require('../models/Resume')
const Portfolio = require('../models/Portfolio')
const User = require('../models/User')
const verifyToken = require('../middleware/verifyToken')
const { parseResumeToPortfolio } = require('../services/langchain')
const { embedSinglePortfolio } = require('../services/pinecone')

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'), false)
    }
  }
})

router.post('/upload', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Extract raw text from PDF
    let rawText = ''
    await new Promise((resolve, reject) => {
      new PdfReader().parseBuffer(req.file.buffer, (err, item) => {
        if (err) reject(err)
        else if (!item) resolve()
        else if (item.text) rawText += item.text + ' '
      })
    })

    // Use Groq to parse full structured portfolio data from resume in one call
    const parsed = await parseResumeToPortfolio(rawText)
    const { bio, skills, experience, education, projects } = parsed

    // Delete old resume and create new one
    await Resume.findOneAndDelete({ userId: req.user.id })
    const resume = await Resume.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      rawText,
      fileUrl: 'local',
      skills,
    })

    // Generate a default username from the user's name
    const user = await User.findById(req.user.id)
    const defaultUsername = user.name.toLowerCase().replace(/\s+/g, '') + Date.now().toString().slice(-4)

    const existingPortfolio = await Portfolio.findOne({ userId: req.user.id })

    let portfolio
    if (existingPortfolio) {
      // Update all fields extracted from resume
      existingPortfolio.bio = bio || existingPortfolio.bio
      existingPortfolio.skills = skills
      existingPortfolio.experience = experience.length ? experience : existingPortfolio.experience
      existingPortfolio.education = education.length ? education : existingPortfolio.education
      existingPortfolio.projects = projects.length ? projects : existingPortfolio.projects
      await existingPortfolio.save()
      portfolio = existingPortfolio
    } else {
      // Create full portfolio from resume data for new users
      portfolio = await Portfolio.create({
        userId: req.user.id,
        username: defaultUsername,
        bio: bio || '',
        skills,
        projects: projects || [],
        experience: experience || [],
        education: education || []
      })
    }

    res.status(201).json({
      message: 'Resume uploaded and portfolio updated successfully',
      resume,
      portfolio
    })

    // Auto-embed portfolio into Pinecone for semantic search (non-blocking)
    try {
      const user = await User.findById(req.user.id)
      await embedSinglePortfolio({
        ...portfolio.toObject(),
        userId: { _id: user._id, name: user.name }
      })
    } catch (embedErr) {
      console.error('⚠️ Pinecone auto-embed failed (non-fatal):', embedErr.message)
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/me', verifyToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id })
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' })
    }
    res.json(resume)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router