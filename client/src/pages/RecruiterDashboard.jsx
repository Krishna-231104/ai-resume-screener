 import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RecruiterDashboard() {
  const [jobDescription, setJobDescription] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sendingInterest, setSendingInterest] = useState(null)
  const [interestMessage, setInterestMessage] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const handleSearch = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/recruiter/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: token
        },
        body: JSON.stringify({ jobDescription })
      })

      const data = await res.json()
      setCandidates(data)
      setSearched(true)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const handleExpressInterest = async (candidateId, candidateName) => {
    setSendingInterest(candidateId)
    try {
      const res = await fetch('http://localhost:5000/api/recruiter/express-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: token
        },
        body: JSON.stringify({ candidateId, jobTitle: jobDescription.split('\n')[0] })
      })

      if (res.ok) {
        setInterestMessage(`✅ Interest email sent to ${candidateName}!`)
        setTimeout(() => setInterestMessage(''), 3000)
      } else {
        setInterestMessage('❌ Failed to send interest email')
      }
    } catch (err) {
      setInterestMessage('❌ Error sending email')
    }
    setSendingInterest(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">AI Resume Screener</h1>
        <button
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
          }}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Find Candidates with AI</h2>
          <p className="text-gray-500 text-sm mb-4">Describe the role and AI will rank candidates for you</p>
          <textarea
            className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            rows={4}
            placeholder="e.g. Looking for a React developer with Node.js and MongoDB experience..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {loading ? 'Searching...' : 'Search with AI'}
          </button>
        </div>

        {searched && (
          <div>
            {interestMessage && (
              <p className={`mb-4 p-3 rounded-lg ${interestMessage.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {interestMessage}
              </p>
            )}
            <h3 className="text-lg font-bold mb-4">
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found
            </h3>
            {candidates.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 mb-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{item.portfolio.userId.name}</h4>
                  <p className="text-gray-500 text-sm mt-1">{item.portfolio.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.portfolio.skills.slice(0, 6).map((skill, j) => (
                      <span key={j} className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">{skill}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/portfolio/${item.portfolio.username}`)}
                    className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                  >
                    View Portfolio →
                  </button>
                  <button
                    onClick={() => handleExpressInterest(item.portfolio.userId._id, item.portfolio.userId.name)}
                    disabled={sendingInterest === item.portfolio.userId._id}
                    className="mt-3 ml-3 bg-green-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {sendingInterest === item.portfolio.userId._id ? 'Sending...' : '✉️ Express Interest'}
                  </button>
                </div>
                <div className="text-center ml-4">
                  <div className={`text-2xl font-bold ${item.score >= 80 ? 'text-green-500' : item.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {item.score}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">AI Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecruiterDashboard
