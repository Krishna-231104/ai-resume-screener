import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1, type: 'bot',
      text: "👋 Hi! I'm your AI assistant — think of me like ChatGPT. Ask me anything: coding help, career advice, debugging, interview prep, salary tips, or any general question. I also have access to your resume for personalized advice!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => { if (!token) navigate('/login') }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const question = input.trim()
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: question }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: data.answer }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: '❌ Something went wrong. Please make sure the server is running.' }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
  }

  return (
    <div className="page-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Back
          </Link>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <span className="logo" style={{ fontSize: '20px' }}>🤖 AI Assistant</span>
        </div>
        <button className="btn-danger" onClick={() => { localStorage.clear(); navigate('/login') }}>Sign out</button>
      </nav>

      {/* Chat container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '780px', width: '100%', margin: '0 auto', padding: '24px 24px 0', overflow: 'hidden' }}>

        {/* Messages scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-start' }}>
              {msg.type === 'bot' && (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                  background: 'linear-gradient(135deg, #f97316, #ef4444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '12px 18px',
                borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                fontSize: '15px',
                lineHeight: '1.65',
                whiteSpace: 'pre-wrap',
                background: msg.type === 'user'
                  ? 'linear-gradient(135deg, #f97316, #ef4444)'
                  : 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: msg.type === 'user' ? 'none' : '1px solid var(--border)',
                backdropFilter: 'blur(10px)',
                boxShadow: msg.type === 'user' ? '0 4px 20px rgba(249,115,22,0.25)' : 'none'
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
              }}>🤖</div>
              <div style={{
                padding: '16px 20px', borderRadius: '18px 18px 18px 4px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                display: 'flex', gap: '6px', alignItems: 'center'
              }}>
                {[0, 150, 300].map((delay, i) => (
                  <span key={i} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                    animation: `bounce-dot 1.2s ${delay}ms ease-in-out infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="glass metal-top" style={{ margin: '16px 0 24px', padding: '4px 4px 4px 20px', borderRadius: '16px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask me anything — coding, career, interviews..."
            disabled={loading} rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontSize: '15px',
              resize: 'none', padding: '12px 0', maxHeight: '120px',
              lineHeight: '1.5'
            }}
          />
          <button
            onClick={handleSend} disabled={loading || !input.trim()}
            className="btn-primary"
            style={{ borderRadius: '12px', padding: '12px 20px', flexShrink: 0 }}
          >
            Send
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', paddingBottom: '16px', marginTop: '-8px' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default Chatbot
