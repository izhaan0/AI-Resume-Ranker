import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Upload from './pages/Upload.jsx'
import Results from './pages/Results.jsx'
import History from './pages/History.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-grid-pattern">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/upload"   element={<Upload />} />
          <Route path="/results"  element={<Results />} />
          <Route path="/history"  element={<History />} />
        </Routes>
      </main>
    </div>
  )
}
