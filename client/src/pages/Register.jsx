import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'developer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="logo" style={{ fontSize: '32px', marginBottom: '8px' }}>ResumeAI</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Create your free account</p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '24px', border: '1px solid var(--border)' }}>
          {['developer', 'recruiter'].map(r => (
            <button
              key={r} type="button"
              onClick={() => setFormData({ ...formData, role: r })}
              style={{
                flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontWeight: '600', fontSize: '14px',
                transition: 'all 0.2s',
                background: formData.role === r ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'transparent',
                color: formData.role === r ? '#fff' : 'var(--text-secondary)',
                boxShadow: formData.role === r ? '0 4px 15px rgba(249,115,22,0.3)' : 'none'
              }}
            >
              {r === 'developer' ? '👨‍💻 Developer' : '🔍 Recruiter'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="glass metal-top" style={{ padding: '36px' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
              color: '#f87171', fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Full Name</label>
              <input id="reg-name" type="text" name="name" placeholder="Krishna Sharma"
                value={formData.name} onChange={handleChange} required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email address</label>
              <input id="reg-email" type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Password</label>
              <input id="reg-password" type="password" name="password" placeholder="Min. 8 characters"
                value={formData.password} onChange={handleChange} required className="input" />
            </div>

            <button id="reg-submit" type="submit" disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '13px' }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register