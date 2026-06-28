import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function PortfolioEditor() {
  const [formData, setFormData] = useState({
    username: '', bio: '',
    projects: [{ title: '', description: '', githubUrl: '', liveUrl: '' }],
    experience: [{ company: '', role: '', duration: '' }],
    education: [{ institution: '', degree: '', year: '' }]
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isUpdate, setIsUpdate] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/portfolio/me`, { headers: { authorization: token } })
        if (res.ok) {
          const data = await res.json()
          setFormData({
            username: data.username || '',
            bio: data.bio || '',
            projects: data.projects?.length ? data.projects : [{ title: '', description: '', githubUrl: '', liveUrl: '' }],
            experience: data.experience?.length ? data.experience : [{ company: '', role: '', duration: '' }],
            education: data.education?.length ? data.education : [{ institution: '', degree: '', year: '' }]
          })
          setIsUpdate(true)
        }
      } catch {}
    }
    fetchExisting()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    const url = isUpdate ? `${import.meta.env.VITE_API_URL}/api/portfolio/update` : `${import.meta.env.VITE_API_URL}/api/portfolio/create`
    try {
      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      setMessage({ text: data.message, type: res.ok ? 'success' : 'error' })
      if (res.ok && !isUpdate) navigate(`/portfolio/${formData.username}`)
    } catch {
      setMessage({ text: 'Something went wrong', type: 'error' })
    }
    setLoading(false)
  }

  const updateArr = (key, i, field, value) => {
    const updated = [...formData[key]]
    updated[i][field] = value
    setFormData({ ...formData, [key]: updated })
  }

  const addItem = (key, template) => setFormData({ ...formData, [key]: [...formData[key], template] })
  const removeItem = (key, i) => {
    const updated = formData[key].filter((_, idx) => idx !== i)
    setFormData({ ...formData, [key]: updated.length ? updated : [formData[key][0]] })
  }

  const sectionStyle = { marginBottom: '20px' }
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }

  return (
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>← Dashboard</Link>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <div className="logo" style={{ fontSize: '20px' }}>ResumeAI</div>
        </div>
        <button className="btn-danger" onClick={() => { localStorage.clear(); navigate('/login') }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>
        <div className="animate-fade-up" style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
            {isUpdate ? 'Edit Portfolio' : 'Create Portfolio'}
          </h1>
          <div className="accent-line" style={{ width: '60px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            {isUpdate ? 'Your portfolio was auto-populated from your resume. Refine it here.' : 'Build your public developer profile.'}
          </p>
        </div>

        {message.text && (
          <div style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '500',
            background: message.type === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${message.type === 'success' ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: message.type === 'success' ? '#4ade80' : '#f87171'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Basic Info */}
          <div className="glass metal-top animate-fade-up stagger-1" style={{ padding: '28px' }}>
            <p className="section-title">Basic Info</p>
            <div style={sectionStyle}>
              <label style={labelStyle}>Username (your portfolio URL)</label>
              <input className="input" placeholder="e.g. krishna" value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                disabled={isUpdate} required />
              {isUpdate && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Username cannot be changed after creation.</p>}
            </div>
            <div>
              <label style={labelStyle}>Professional Bio</label>
              <textarea className="input" placeholder="Write a short professional summary..." rows={3}
                value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                style={{ resize: 'vertical', minHeight: '90px' }} />
            </div>
          </div>

          {/* Projects */}
          <div className="glass metal-top animate-fade-up stagger-2" style={{ padding: '28px' }}>
            <p className="section-title">Projects</p>
            {formData.projects.map((proj, i) => (
              <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Project {i + 1}</span>
                  {formData.projects.length > 1 && (
                    <button type="button" onClick={() => removeItem('projects', i)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>
                      Remove
                    </button>
                  )}
                </div>
                <input className="input" placeholder="Project title" value={proj.title} onChange={e => updateArr('projects', i, 'title', e.target.value)} />
                <input className="input" placeholder="Short description" value={proj.description} onChange={e => updateArr('projects', i, 'description', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input className="input" placeholder="GitHub URL" value={proj.githubUrl} onChange={e => updateArr('projects', i, 'githubUrl', e.target.value)} />
                  <input className="input" placeholder="Live URL" value={proj.liveUrl} onChange={e => updateArr('projects', i, 'liveUrl', e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addItem('projects', { title: '', description: '', githubUrl: '', liveUrl: '' })}
              style={{ background: 'none', border: '1px dashed rgba(249,115,22,0.35)', borderRadius: '10px', color: 'var(--accent)', cursor: 'pointer', padding: '10px', width: '100%', fontFamily: 'DM Sans, sans-serif', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }}>
              + Add Project
            </button>
          </div>

          {/* Experience */}
          <div className="glass metal-top animate-fade-up stagger-3" style={{ padding: '28px' }}>
            <p className="section-title">Experience</p>
            {formData.experience.map((exp, i) => (
              <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Role {i + 1}</span>
                  {formData.experience.length > 1 && (
                    <button type="button" onClick={() => removeItem('experience', i)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>Remove</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input className="input" placeholder="Company" value={exp.company} onChange={e => updateArr('experience', i, 'company', e.target.value)} />
                  <input className="input" placeholder="Your Role" value={exp.role} onChange={e => updateArr('experience', i, 'role', e.target.value)} />
                </div>
                <input className="input" placeholder="Duration (e.g. 2022 – Present)" value={exp.duration} onChange={e => updateArr('experience', i, 'duration', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={() => addItem('experience', { company: '', role: '', duration: '' })}
              style={{ background: 'none', border: '1px dashed rgba(249,115,22,0.35)', borderRadius: '10px', color: 'var(--accent)', cursor: 'pointer', padding: '10px', width: '100%', fontFamily: 'DM Sans, sans-serif', fontWeight: '600', fontSize: '14px' }}>
              + Add Experience
            </button>
          </div>

          {/* Education */}
          <div className="glass metal-top animate-fade-up stagger-4" style={{ padding: '28px' }}>
            <p className="section-title">Education</p>
            {formData.education.map((edu, i) => (
              <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Entry {i + 1}</span>
                  {formData.education.length > 1 && (
                    <button type="button" onClick={() => removeItem('education', i)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>Remove</button>
                  )}
                </div>
                <input className="input" placeholder="Institution / University" value={edu.institution} onChange={e => updateArr('education', i, 'institution', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input className="input" placeholder="Degree & Field" value={edu.degree} onChange={e => updateArr('education', i, 'degree', e.target.value)} />
                  <input className="input" placeholder="Graduation Year" value={edu.year} onChange={e => updateArr('education', i, 'year', e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addItem('education', { institution: '', degree: '', year: '' })}
              style={{ background: 'none', border: '1px dashed rgba(249,115,22,0.35)', borderRadius: '10px', color: 'var(--accent)', cursor: 'pointer', padding: '10px', width: '100%', fontFamily: 'DM Sans, sans-serif', fontWeight: '600', fontSize: '14px' }}>
              + Add Education
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ padding: '16px', fontSize: '16px', borderRadius: '14px' }}>
            {loading ? 'Saving...' : isUpdate ? '💾 Save Changes' : '🚀 Create Portfolio'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PortfolioEditor
