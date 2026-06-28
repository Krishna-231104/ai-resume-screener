import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function Portfolio() {
  const { username } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/portfolio/${username}`)
        const data = await res.json()
        if (!res.ok) { setError(data.message); setLoading(false); return }
        setPortfolio(data)
        setLoading(false)
      } catch {
        setError('Something went wrong')
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [username])

  if (loading) return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(249,115,22,0.2)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '18px', color: '#f87171' }}>⚠️ {error}</p>
      <Link to="/" style={{ color: 'var(--accent)', fontSize: '14px' }}>← Go Home</Link>
    </div>
  )

  const name = portfolio.userId?.name || 'Developer'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">ResumeAI</div>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-ghost">Sign in</button>
        </Link>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(249,115,22,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)', padding: '64px 24px 48px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '28px', alignItems: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: '#fff',
            boxShadow: '0 0 40px rgba(249,115,22,0.3)'
          }}>
            {initials}
          </div>
          <div className="animate-fade-up">
            <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.5px' }}>{name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px', maxWidth: '560px' }}>
              {portfolio.bio || 'No bio provided yet.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {portfolio.skills?.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Projects */}
        {portfolio.projects?.length > 0 && (
          <div className="animate-fade-up">
            <p className="section-title">Projects</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {portfolio.projects.map((proj, i) => (
                <div key={i} className="glass glass-hover metal-top" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 8px', color: 'var(--text-primary)' }}>{proj.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 16px' }}>{proj.description}</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                        GitHub →
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                        Live Demo →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {portfolio.experience?.length > 0 && (
          <div className="animate-fade-up">
            <p className="section-title">Experience</p>
            <div className="glass metal-top" style={{ padding: '8px 0' }}>
              {portfolio.experience.map((exp, i) => (
                <div key={i} style={{
                  padding: '20px 28px',
                  borderBottom: i < portfolio.experience.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '20px'
                }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                    boxShadow: '0 0 12px rgba(249,115,22,0.4)'
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>{exp.role}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                      {exp.company} · {exp.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {portfolio.education?.length > 0 && (
          <div className="animate-fade-up">
            <p className="section-title">Education</p>
            <div className="glass metal-top" style={{ padding: '8px 0' }}>
              {portfolio.education.map((edu, i) => (
                <div key={i} style={{
                  padding: '20px 28px',
                  borderBottom: i < portfolio.education.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '20px'
                }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                    boxShadow: '0 0 12px rgba(249,115,22,0.4)'
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>{edu.degree}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                      {edu.institution} · {edu.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio