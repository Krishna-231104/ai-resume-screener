const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    console.error('Check: 1) Network Access 0.0.0.0/0 on Atlas  2) Cluster is not paused  3) Correct password in MONGO_URI')
    process.exit(1)
  }
}

module.exports = connectDB
