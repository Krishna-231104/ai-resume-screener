import PortfolioEditor from './pages/PortfolioEditor'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio/:username" element={<Portfolio />} />
        <Route path="/portfolio-editor" element={<PortfolioEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App