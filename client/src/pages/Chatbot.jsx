import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '👋 Hi! I\'m your AI career assistant. Ask me anything about finding opportunities, improving your profile, or connecting with recruiters!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCandidates, setShowCandidates] = useState(false)
  const [candidates, setCandidates] = useState([])
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMsg = { id: Date.now(), type: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': token
        },
        body: JSON.stringify({ message: input })
      })

      const data = await res.json()
      
      // Add bot response
      const botMsg = { id: Date.now() + 1, type: 'bot', text: data.message }
      setMessages(prev => [...prev, botMsg])

      // Show candidates if found
      if (data.candidates && data.candidates.length > 0) {
        setCandidates(data.candidates)
        setShowCandidates(true)
      }
    } catch (err) {
      const errorMsg = { id: Date.now() + 1, type: 'bot', text: '❌ Sorry, something went wrong.' }
      setMessages(prev => [...prev, errorMsg])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">🤖 AI Career Assistant</h1>
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

      <div className="flex flex-1">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-sm">✍️ Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything... e.g., 'How do I improve my portfolio?' or 'Find React developers'"
                disabled={loading}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Candidates Sidebar */}
        {showCandidates && candidates.length > 0 && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Matched Candidates</h3>
            <div className="space-y-3">
              {candidates.map((candidate, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-sm">{candidate.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Score: <span className="font-bold text-blue-600">{(candidate.score * 100).toFixed(0)}%</span>
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.skills.slice(0, 3).map((skill, j) => (
                      <span key={j} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCandidates(false)}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chatbot
