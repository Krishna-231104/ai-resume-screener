 const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String
  },
  fileUrl: {
    type: String
  },
  rawText: {
    type: String
  },
  skills: [String],
  experience: {
    type: String
  },
  education: {
    type: String
  }
}, { timestamps: true })

module.exports = mongoose.model('Resume', resumeSchema)
