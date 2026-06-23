import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    if (parsedUser.role === 'recruiter') {
      navigate('/recruiter')
      return
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setResumeFile(file)
    setUploading(true)
    setUploadMessage('')

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers: {
          'authorization': localStorage.getItem('token')
        },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setUploadMessage(`✅ Resume uploaded! Skills extracted: ${data.resume.skills.join(', ')}`)
      } else {
        setUploadMessage(`❌ ${data.message}`)
      }
    } catch (err) {
      setUploadMessage('❌ Upload failed')
    }
    setUploading(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">AI Resume Screener</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">👋 {user.name}</span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{user.role}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 px-4">
        {user.role === 'developer' ? (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-2">Welcome, {user.name}!</h2>
            <p className="text-gray-500 mb-6">Build your portfolio and get discovered by recruiters.</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="border rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
                <p className="text-2xl">📄</p>
                <p className="font-medium mt-2">Upload Resume</p>
                <p className="text-sm text-gray-400">{resumeFile ? resumeFile.name : 'PDF only'}</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <div
                onClick={() => navigate('/portfolio-editor')}
                className="border rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
                <p className="text-2xl">🎨</p>
                <p className="font-medium mt-2">Edit Portfolio</p>
                <p className="text-sm text-gray-400">Click to edit</p>
              </div>
            </div>
            {uploadMessage && (
              <p className={`mt-4 text-sm ${uploadMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {uploadMessage}
              </p>
            )}
            {uploading && <p className="mt-4 text-sm text-gray-500">Uploading & parsing resume...</p>}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-2">Recruiter Dashboard</h2>
            <p className="text-gray-500 mb-6">Search and rank candidates using AI.</p>
            <div className="border rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
              <p className="text-2xl">🔍</p>
              <p className="font-medium mt-2">Search Candidates</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard