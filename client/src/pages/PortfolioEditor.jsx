 import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function PortfolioEditor() {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    projects: [{ title: '', description: '', githubUrl: '', liveUrl: '' }],
    experience: [{ company: '', role: '', duration: '' }],
    education: [{ institution: '', degree: '', year: '' }]
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isUpdate, setIsUpdate] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/portfolio/me', {
          headers: { authorization: token }
        })
        if (res.ok) {
          const data = await res.json()
          setFormData({
            username: data.username,
            bio: data.bio,
            projects: data.projects.length ? data.projects : [{ title: '', description: '', githubUrl: '', liveUrl: '' }],
            experience: data.experience.length ? data.experience : [{ company: '', role: '', duration: '' }],
            education: data.education.length ? data.education : [{ institution: '', degree: '', year: '' }]
          })
          setIsUpdate(true)
        }
      } catch (err) {}
    }
    fetchExisting()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const url = isUpdate
      ? 'http://localhost:5000/api/portfolio/update'
      : 'http://localhost:5000/api/portfolio/create'
    const method = isUpdate ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          authorization: token
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      setMessage(data.message)
      setLoading(false)
      if (!isUpdate) navigate(`/portfolio/${formData.username}`)
    } catch (err) {
      setMessage('Something went wrong')
      setLoading(false)
    }
  }

  const updateProject = (i, field, value) => {
    const updated = [...formData.projects]
    updated[i][field] = value
    setFormData({ ...formData, projects: updated })
  }

  const updateExperience = (i, field, value) => {
    const updated = [...formData.experience]
    updated[i][field] = value
    setFormData({ ...formData, experience: updated })
  }

  const updateEducation = (i, field, value) => {
    const updated = [...formData.education]
    updated[i][field] = value
    setFormData({ ...formData, education: updated })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">
          {isUpdate ? 'Update Portfolio' : 'Create Portfolio'}
        </h1>

        {message && <p className="text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">Basic Info</h2>
            <input
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Username (e.g. krishna)"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              disabled={isUpdate}
              required
            />
            <textarea
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Short bio"
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">Projects</h2>
            {formData.projects.map((proj, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Title" value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Description" value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="GitHub URL" value={proj.githubUrl} onChange={e => updateProject(i, 'githubUrl', e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Live URL" value={proj.liveUrl} onChange={e => updateProject(i, 'liveUrl', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={() => setFormData({ ...formData, projects: [...formData.projects, { title: '', description: '', githubUrl: '', liveUrl: '' }] })}
              className="text-blue-600 text-sm font-medium">+ Add Project</button>
          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">Experience</h2>
            {formData.experience.map((exp, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Company" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Role" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Duration (e.g. 2023 - Present)" value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={() => setFormData({ ...formData, experience: [...formData.experience, { company: '', role: '', duration: '' }] })}
              className="text-blue-600 text-sm font-medium">+ Add Experience</button>
          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">Education</h2>
            {formData.education.map((edu, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Institution" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Degree" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Year" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={() => setFormData({ ...formData, education: [...formData.education, { institution: '', degree: '', year: '' }] })}
              className="text-blue-600 text-sm font-medium">+ Add Education</button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
            {loading ? 'Saving...' : isUpdate ? 'Update Portfolio' : 'Create Portfolio'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PortfolioEditor
