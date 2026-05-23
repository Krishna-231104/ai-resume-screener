const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const verifyToken = require('./middleware/verifyToken')

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})