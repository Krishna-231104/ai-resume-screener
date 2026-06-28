const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const resumeRoutes = require('./routes/resume')
const portfolioRoutes = require('./routes/portfolio')
const recruiterRoutes = require('./routes/recruiter')
const chatbotRoutes = require('./routes/chatbot')

dotenv.config()
connectDB()

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL, // e.g. https://ai-resume-screener.vercel.app
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true
}))
app.options('*', cors()) // Handle preflight requests

app.use(morgan('dev'))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/recruiter', recruiterRoutes)
app.use('/api/chatbot', chatbotRoutes)
app.get('/test', (req, res) => {
  res.json({ message: 'test route works' })
})

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})