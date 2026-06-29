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

const corsOptions = {
  origin: (origin, callback) => {
    // Allow: no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true)
    // Allow: localhost dev
    if (origin.startsWith('http://localhost')) return callback(null, true)
    // Allow: any vercel.app subdomain (production + preview URLs)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    // Allow: explicit CLIENT_URL from env (e.g. custom domain)
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return callback(null, true)
    // Block everything else
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions)) // Handle preflight for all routes



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