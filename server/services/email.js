const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

const sendInterestEmail = async (candidateEmail, candidateName, recruiterName, jobTitle) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `${recruiterName} is interested in you for ${jobTitle}! 🎉`,
      html: `
        <h2>Great News, ${candidateName}!</h2>
        <p><strong>${recruiterName}</strong> is interested in your profile for the role of <strong>${jobTitle}</strong>.</p>
        <p>Check your dashboard to see more details!</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Interest</a>
        <br><br>
        <p>Best regards,<br>AI Resume Screener Team</p>
      `
    })
    console.log('Interest email sent to:', candidateEmail)
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

const sendPortfolioUpdateEmail = async (recruiterEmail, recruiterName, developerName, portfolioUsername) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recruiterEmail,
      subject: `${developerName} updated their portfolio 📝`,
      html: `
        <h2>Portfolio Update Alert</h2>
        <p><strong>${developerName}</strong> has updated their portfolio!</p>
        <a href="${process.env.CLIENT_URL}/portfolio/${portfolioUsername}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Updated Portfolio</a>
        <br><br>
        <p>Best regards,<br>AI Resume Screener Team</p>
      `
    })
    console.log('Portfolio update email sent to:', recruiterEmail)
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

const sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to AI Resume Screener! 👋',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for joining AI Resume Screener.</p>
        <p>Get started by completing your profile and start discovering amazing opportunities!</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        <br><br>
        <p>Best regards,<br>AI Resume Screener Team</p>
      `
    })
    console.log('Welcome email sent to:', email)
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

module.exports = { sendInterestEmail, sendPortfolioUpdateEmail, sendWelcomeEmail }
