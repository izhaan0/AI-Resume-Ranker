import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, LayoutGrid, Table2, Download, ArrowLeft, Trophy } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import CandidateCard from '../components/CandidateCard.jsx'
import RankingTable from '../components/RankingTable.jsx'
import { cn } from '../components/ui/cn.js'

function exportCSV(candidates) {
  const headers = ['Rank', 'Name', 'Filename', 'ATS Score', 'Experience Years', 'Matched Skills', 'Missing Skills']
  const rows = candidates.map((c, i) => [
    i + 1,
    c.name || 'Unknown',
    c.filename,
    c.ats_score,
    c.experience_years ?? '',
    (c.matched_skills || []).join('; '),
    (c.missing_skills || []).join('; '),
  ])
  const csv = [headers, ...rows].map((r) => r.map(String).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ats-results-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Results() {
  const navigate = useNavigate()
  const { results, filterScore, setFilterScore } = useStore()
  const [view, setView] = useState('cards') // 'cards' | 'table'

  const candidates = results?.ranked_candidates || []

  const filtered = candidates.filter((c) => c.ats_score >= filterScore)

  if (!results) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 text-lg">No results yet.</p>
        <button onClick={() => navigate('/upload')} className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={15} /> Start an Analysis
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display font-extrabold text-3xl text-gray-100 flex items-center gap-2">
            <Trophy size={26} className="text-brand-400" />
            Ranked Results
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} analyzed
            {filterScore > 0 && ` · ${filtered.length} above ${filterScore}% threshold`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Score filter */}
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
            <SlidersHorizontal size={13} className="text-gray-500" />
            <label className="text-xs text-gray-500 font-mono whitespace-nowrap">Min Score</label>
            <input
              type="range" min={0} max={90} step={5} value={filterScore}
              onChange={(e) => setFilterScore(Number(e.target.value))}
              className="w-20 accent-brand-500"
            />
            <span className="text-xs font-mono text-brand-400 w-8 text-right">{filterScore}%</span>
          </div>

          {/* View toggle */}
          <div className="flex glass rounded-xl overflow-hidden">
            {[
              { key: 'cards', icon: LayoutGrid },
              { key: 'table', icon: Table2 },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  'px-3 py-2 transition-colors',
                  view === key ? 'bg-brand-500/20 text-brand-300' : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={() => exportCSV(filtered)}
            className="btn-ghost flex items-center gap-1.5 text-sm border border-white/10"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          No candidates meet the minimum score threshold of {filterScore}%.
        </div>
      ) : view === 'cards' ? (
        <div className="space-y-4">
          {filtered.map((c, i) => (
            <CandidateCard key={c.filename + i} candidate={c} rank={i + 1} delay={i * 0.07} />
          ))}
        </div>
      ) : (
        <RankingTable candidates={filtered} />
      )}

      {/* Back */}
      <button
        onClick={() => navigate('/upload')}
        className="btn-ghost flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={14} /> New Analysis
      </button>
    </div>
  )
}
