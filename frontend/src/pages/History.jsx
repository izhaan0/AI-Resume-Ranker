import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, Users, TrendingUp, FileText, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore.js'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function History() {
  const navigate = useNavigate()
  const { history, clearHistory } = useStore()

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display font-extrabold text-3xl text-gray-100 flex items-center gap-2">
            <Clock size={26} className="text-brand-400" />
            Session History
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{history.length} past session{history.length !== 1 ? 's' : ''} saved locally</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="btn-ghost flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/30"
          >
            <Trash2 size={13} /> Clear All
          </button>
        )}
      </motion.div>

      {/* List */}
      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-20 space-y-3"
        >
          <Clock size={32} className="text-gray-600 mx-auto" />
          <p className="font-display font-semibold text-gray-400">No history yet</p>
          <p className="text-sm text-gray-600">Your ranking sessions will appear here.</p>
          <button onClick={() => navigate('/upload')} className="btn-primary text-sm inline-flex items-center gap-2">
            Start Analysis
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ delay: i * 0.04 }}
                className="card glass-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* JD preview */}
                    <p className="text-sm font-display font-semibold text-gray-200 line-clamp-1">
                      {entry.jobDescription || 'No description'}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-2 text-xs font-mono text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {entry.candidateCount} candidate{entry.candidateCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={11} />
                        Top score: <span className="text-brand-400 ml-0.5">{Math.round(entry.topScore)}%</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>

                    {/* File names */}
                    {entry.fileNames?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.fileNames.slice(0, 4).map((f) => (
                          <span key={f} className="flex items-center gap-1 text-xs font-mono text-gray-600 bg-white/4 px-2 py-0.5 rounded-md">
                            <FileText size={9} /> {f}
                          </span>
                        ))}
                        {entry.fileNames.length > 4 && (
                          <span className="text-xs font-mono text-gray-600 px-2 py-0.5">
                            +{entry.fileNames.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/upload')}
                    className="btn-ghost flex items-center gap-1.5 text-xs border border-white/8 shrink-0 mt-1"
                  >
                    <RotateCcw size={12} /> Re-run
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
