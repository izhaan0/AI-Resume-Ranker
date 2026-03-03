import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Zap, Users, TrendingUp, Clock, ArrowRight, FileSearch } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import ScoreMeter from '../components/ScoreMeter.jsx'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
})

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  return (
    <motion.div {...fadeUp(0.1)} className="card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${color === 'brand' ? 'bg-brand-500/15' : color === 'yellow' ? 'bg-yellow-500/15' : 'bg-purple-500/15'}`}>
        <Icon size={18} className={
          color === 'brand' ? 'text-brand-400' : color === 'yellow' ? 'text-yellow-400' : 'text-purple-400'
        } />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-gray-100">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-600 font-mono mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { results, history } = useStore()

  const candidates = results?.ranked_candidates || []
  const topCandidate = candidates[0]
  const avgScore = candidates.length
    ? Math.round(candidates.reduce((s, c) => s + c.ats_score, 0) / candidates.length)
    : 0

  // Score distribution buckets
  const buckets = [
    { range: '0–20',  count: 0, color: '#f87171' },
    { range: '21–40', count: 0, color: '#fb923c' },
    { range: '41–60', count: 0, color: '#facc15' },
    { range: '61–80', count: 0, color: '#4ade80' },
    { range: '81–100',count: 0, color: '#24a265' },
  ]
  candidates.forEach((c) => {
    const idx = Math.min(4, Math.floor(c.ats_score / 20))
    buckets[idx].count++
  })

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs font-mono">
        <p className="text-gray-300">{label}: <span className="text-brand-300">{payload[0].value} candidates</span></p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

      {/* Hero */}
      <motion.div {...fadeUp(0)} className="text-center py-8">
        <h1 className="font-display text-5xl font-extrabold tracking-tight mb-3">
          Resume <span className="text-gradient">Intelligence</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Instantly rank candidates with AI-powered semantic matching. Upload a job description, drop in resumes, get results in seconds.
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/upload')}
          className="btn-primary mt-6 inline-flex items-center gap-2 text-base px-8 py-3"
        >
          <Zap size={16} />
          Start Analyzing
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users}     label="Candidates Ranked"  value={candidates.length || '—'} sub="current session" color="brand" />
        <StatCard icon={TrendingUp} label="Avg ATS Score"     value={candidates.length ? `${avgScore}%` : '—'} sub="across all resumes" color="yellow" />
        <StatCard icon={Clock}     label="Sessions Run"       value={history.length}            sub="stored locally" color="purple" />
      </div>

      {/* Main content */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top candidate spotlight */}
          <motion.div {...fadeUp(0.2)} className="card lg:col-span-1 flex flex-col items-center text-center gap-4">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500">🏆 Top Candidate</p>
            <ScoreMeter score={topCandidate.ats_score} size={110} strokeWidth={9} />
            <div>
              <p className="font-display font-bold text-xl text-gray-100">{topCandidate.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{topCandidate.filename}</p>
            </div>
            <button
              onClick={() => navigate('/results')}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              View All Results <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Score distribution chart */}
          <motion.div {...fadeUp(0.25)} className="card lg:col-span-2">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-5">Score Distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={buckets} barSize={36}>
                <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {buckets.map((b, i) => <Cell key={i} fill={b.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      ) : (
        /* Empty state */
        <motion.div {...fadeUp(0.2)} className="card flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center">
            <FileSearch size={28} className="text-brand-500/60" />
          </div>
          <div>
            <p className="font-display font-semibold text-gray-300 text-lg">No analysis yet</p>
            <p className="text-gray-500 text-sm mt-1">Upload resumes and a job description to get started</p>
          </div>
          <button onClick={() => navigate('/upload')} className="btn-primary flex items-center gap-2 text-sm">
            <Zap size={14} /> New Analysis
          </button>
        </motion.div>
      )}
    </div>
  )
}
