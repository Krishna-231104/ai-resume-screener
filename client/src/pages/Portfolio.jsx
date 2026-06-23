import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function Portfolio() {
  const { username } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/portfolio/${username}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.message)
          setLoading(false)
          return
        }
        setPortfolio(data)
        setLoading(false)
      } catch (err) {
        setError('Something went wrong')
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [username])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-600">{portfolio.userId.name}</h1>
          <p className="text-gray-500 mt-2">{portfolio.bio}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {portfolio.skills.map((skill, i) => (
              <span key={i} className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">{skill}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Projects</h2>
          {portfolio.projects.map((proj, i) => (
            <div key={i} className="border rounded-lg p-4 mb-3">
              <h3 className="font-semibold">{proj.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{proj.description}</p>
              <div className="flex gap-4 mt-2">
                {proj.githubUrl && <a href={proj.githubUrl} className="text-blue-500 text-sm">GitHub</a>}
                {proj.liveUrl && <a href={proj.liveUrl} className="text-blue-500 text-sm">Live Demo</a>}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Experience</h2>
          {portfolio.experience.map((exp, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4 mb-3">
              <p className="font-semibold">{exp.role}</p>
              <p className="text-gray-500 text-sm">{exp.company} · {exp.duration}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Education</h2>
          {portfolio.education.map((edu, i) => (
            <div key={i} className="border-l-4 border-green-500 pl-4 mb-3">
              <p className="font-semibold">{edu.degree}</p>
              <p className="text-gray-500 text-sm">{edu.institution} · {edu.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Portfolio