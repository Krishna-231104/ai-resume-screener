import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RecruiterDashboard() {
  const [jobDescription, setJobDescription] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sendingInterest, setSendingInterest] = useState(null)
  const [interestMsg, setInterestMsg] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleSearch = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    setSearched(false)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recruiter/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ jobDescription })
      })
      const data = await res.json()
      setCandidates(data)
      setSearched(true)
    } catch {}
    setLoading(false)
  }

  const handleExpressInterest = async (candidateId, candidateName) => {
    setSendingInterest(candidateId)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recruiter/express-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ candidateId, jobTitle: jobDescription.split('\n')[0] })
      })
      setInterestMsg(res.ok ? `✅ Interest sent to ${candidateName}!` : '❌ Failed to send email')
      setTimeout(() => setInterestMsg(''), 3500)
    } catch {
      setInterestMsg('❌ Error sending email')
    }
    setSendingInterest(null)
  }

  const scoreColor = (score) => {
    if (score >= 80) return { color: '#4ade80', glow: 'rgba(74,222,128,0.2)' }
    if (score >= 60) return { color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' }
    return { color: '#f87171', glow: 'rgba(248,113,113,0.2)' }
  }

  return (
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">ResumeAI</div>
        <button className="btn-danger" onClick={() => { localStorage.clear(); navigate('/login') }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Heading */}
        <div className="animate-fade-up" style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
            Find Candidates with AI
          </h1>
          <div className="accent-line" style={{ width: '60px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Describe the role and AI ranks every candidate by match score.
          </p>
        </div>

        {/* Search Card */}
        <div className="glass metal-top animate-fade-up stagger-1" style={{ padding: '28px', marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Job Description
          </label>
          <textarea
            className="input"
            rows={4} style={{ resize: 'vertical', minHeight: '110px', marginBottom: '16px' }}
            placeholder="e.g. Looking for a React developer with 2+ years of experience in Node.js and MongoDB..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
          <button onClick={handleSearch} disabled={loading || !jobDescription.trim()} className="btn-primary" style={{ padding: '12px 28px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Searching...
              </span>
            ) : '🔍 Search with AI'}
          </button>
        </div>

        {/* Interest notification */}
        {interestMsg && (
          <div style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500',
            background: interestMsg.includes('✅') ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${interestMsg.includes('✅') ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: interestMsg.includes('✅') ? '#4ade80' : '#f87171'
          }}>
            {interestMsg}
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="animate-fade-in">
            <p className="section-title">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {candidates.map((item, i) => {
                const sc = scoreColor(item.score)
                const name = item.portfolio.userId?.name || 'Candidate'
                const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div key={i} className="glass glass-hover metal-top" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #f97316, #ef4444)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: '800', color: '#fff'
                    }}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{name}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: '1.5' }}>
                        {item.portfolio.bio || 'No bio available.'}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {item.portfolio.skills?.slice(0, 7).map((skill, j) => (
                          <span key={j} className="skill-tag" style={{ fontSize: '12px', padding: '3px 10px' }}>{skill}</span>
                        ))}
                        {(item.portfolio.skills?.length || 0) > 7 && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '3px 0' }}>
                            +{item.portfolio.skills.length - 7} more
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => navigate(`/portfolio/${item.portfolio.username}`)}
                          className="btn-ghost"
                          style={{ fontSize: '13px', padding: '7px 16px' }}
                        >
                          View Portfolio →
                        </button>
                        <button
                          onClick={() => handleExpressInterest(item.portfolio.userId._id, name)}
                          disabled={sendingInterest === item.portfolio.userId._id}
                          className="btn-primary"
                          style={{ fontSize: '13px', padding: '7px 16px' }}
                        >
                          {sendingInterest === item.portfolio.userId._id ? 'Sending...' : '✉️ Express Interest'}
                        </button>
                      </div>
                    </div>

                    {/* AI Score */}
                    <div style={{
                      flexShrink: 0, textAlign: 'center', padding: '16px 20px', borderRadius: '14px',
                      background: sc.glow, border: `1px solid ${sc.color}30`,
                      minWidth: '80px'
                    }}>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: sc.color, lineHeight: 1 }}>
                        {item.score}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        AI Score
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecruiterDashboard
