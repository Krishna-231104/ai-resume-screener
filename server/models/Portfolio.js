 const mongoose = require('mongoose')

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  bio: {
    type: String
  },
  skills: [String],
  projects: [
    {
      title: String,
      description: String,
      githubUrl: String,
      liveUrl: String
    }
  ],
  experience: [
    {
      company: String,
      role: String,
      duration: String
    }
  ],
  education: [
    {
      institution: String,
      degree: String,
      year: String
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('Portfolio', portfolioSchema)
