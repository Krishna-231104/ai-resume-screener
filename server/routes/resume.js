const express = require('express')
const router = express.Router()
const multer = require('multer')
const { PdfReader } = require('pdfreader')
const Resume = require('../models/Resume')
const verifyToken = require('../middleware/verifyToken')
const { extractSkillsFromResume } = require('../services/langchain')

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

    let rawText = ''
    await new Promise((resolve, reject) => {
      new PdfReader().parseBuffer(req.file.buffer, (err, item) => {
        if (err) reject(err)
        else if (!item) resolve()
        else if (item.text) rawText += item.text + ' '
      })
    })

    const skills = await extractSkillsFromResume(rawText)

    const resume = await Resume.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      rawText,
      fileUrl: 'local',
      skills,
    })

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume
    })

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