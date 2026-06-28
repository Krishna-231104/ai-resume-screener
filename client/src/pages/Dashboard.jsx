import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [resume, setResume] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [extractedSkills, setExtractedSkills] = useState([])
  const [portfolioUsername, setPortfolioUsername] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const tok = localStorage.getItem('token')
    if (!storedUser || !tok) { navigate('/login'); return }
    const parsed = JSON.parse(storedUser)
    setUser(parsed)
    if (parsed.role === 'recruiter') { navigate('/recruiter'); return }

    // Fetch existing resume
    const fetchResume = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/resume/me`, { headers: { authorization: tok } })
        if (res.ok) {
          const data = await res.json()
          setResume(data)
          setExtractedSkills(data.skills || [])
        }
      } catch {}
    }
    fetchResume()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadMessage('Please upload a PDF file only.')
      setUploadStatus('error')
      return
    }
    setUploading(true)
    setUploadStatus('extracting')
    setUploadMessage('🤖 AI is parsing your resume and building your portfolio...')
    const fd = new FormData()
    fd.append('resume', file)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/resume/upload`, {
        method: 'POST', headers: { authorization: token }, body: fd
      })
      const data = await res.json()
      if (!res.ok) { setUploadMessage(data.message || 'Upload failed.'); setUploadStatus('error'); setUploading(false); return }
      setUploadStatus('done')
      setUploadMessage('Portfolio auto-populated! Redirecting to editor...')
      setExtractedSkills(data.resume?.skills || [])
      setPortfolioUsername(data.portfolio?.username || '')
      setResume(data.resume)
      setTimeout(() => navigate('/portfolio-editor'), 2000)
    } catch {
      setUploadMessage('Something went wrong. Please try again.')
      setUploadStatus('error')
    }
    setUploading(false)
  }

  const navCards = [
    { to: '/portfolio-editor', icon: '✏️', title: 'Portfolio Editor', sub: 'Edit your AI-generated portfolio' },
    { to: '/recruiter', icon: '🔍', title: 'Recruiter View', sub: 'See how you appear to recruiters' },
    { to: '/chatbot', icon: '🤖', title: 'AI Assistant', sub: 'Ask anything — career, coding, advice' },
  ]

  return (
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">ResumeAI</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Hey, <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user.name}</span>
            </span>
          )}
          <button className="btn-danger" onClick={() => { localStorage.clear(); navigate('/login') }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero heading */}
        <div className="animate-fade-up" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
            Your AI Career Hub
          </h1>
          <div className="accent-line" style={{ width: '80px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '4px' }}>
            Upload your resume — AI handles the rest.
          </p>
        </div>

        {/* Upload Card */}
        <div className="glass metal-top animate-fade-up stagger-1" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '20px' }}>📄</span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                {resume ? 'Re-upload Resume' : 'Upload Your Resume'}
              </h2>
              {resume && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Current: {resume.originalName}
                </p>
              )}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]) }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            style={{
              border: `2px dashed ${dragOver ? 'rgba(249,115,22,0.6)' : uploadStatus === 'done' ? 'rgba(34,197,94,0.4)' : uploadStatus === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '14px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: dragOver ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.25s',
              boxShadow: dragOver ? '0 0 30px rgba(249,115,22,0.12)' : 'none'
            }}
          >
            {uploading ? (
              <div>
                <div style={{
                  width: '48px', height: '48px', border: '3px solid rgba(249,115,22,0.2)',
                  borderTopColor: '#f97316', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>{uploadMessage}</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                  {uploadStatus === 'done' ? '✅' : uploadStatus === 'error' ? '❌' : '☁️'}
                </div>
                <p style={{ fontWeight: '600', fontSize: '16px', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Drag & drop your PDF, or click to browse
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>PDF files only</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files[0])} />

          {uploadMessage && !uploading && (
            <p style={{
              marginTop: '14px', fontSize: '14px', fontWeight: '500',
              color: uploadStatus === 'done' ? '#4ade80' : '#f87171'
            }}>
              {uploadMessage}
            </p>
          )}
        </div>

        {/* Extracted Skills */}
        {extractedSkills.length > 0 && (
          <div className="glass metal-top animate-fade-up stagger-2" style={{ padding: '28px', marginBottom: '24px' }}>
            <p className="section-title">🎯 Skills Extracted from Resume</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {extractedSkills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Nav Cards */}
        <div className="animate-fade-up stagger-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {navCards.map((card, i) => (
            <Link key={i} to={card.to} style={{ textDecoration: 'none' }}>
              <div className="glass glass-hover metal-top" style={{ padding: '28px', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px', marginBottom: '14px' }}>{card.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{card.sub}</p>
                <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: '600', color: 'var(--accent)' }}>
                  Open →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Portfolio Live Link */}
        {portfolioUsername && (
          <div className="glass animate-fade-up stagger-4" style={{
            padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid rgba(74,222,128,0.2)', borderRadius: '14px',
            background: 'rgba(74,222,128,0.05)'
          }}>
            <div>
              <p style={{ fontWeight: '700', color: '#4ade80', margin: '0 0 2px' }}>🎉 Your portfolio is live!</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                resumeai.com/portfolio/{portfolioUsername}
              </p>
            </div>
            <Link to={`/portfolio/${portfolioUsername}`}
              style={{ textDecoration: 'none' }}
              className="btn-primary">
              View →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard