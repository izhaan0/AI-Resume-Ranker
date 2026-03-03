import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, FileText, Briefcase, GraduationCap, Trophy } from 'lucide-react'
import ScoreMeter from './ScoreMeter.jsx'
import SkillBadges from './SkillBadges.jsx'
import { cn } from './ui/cn.js'

const rankBadge = (rank) => {
  if (rank === 1) return { label: '🥇 #1', cls: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' }
  if (rank === 2) return { label: '🥈 #2', cls: 'bg-gray-400/15 text-gray-300 border-gray-400/30' }
  if (rank === 3) return { label: '🥉 #3', cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30' }
  return { label: `#${rank}`, cls: 'bg-white/5 text-gray-400 border-white/10' }
}

export default function CandidateCard({ candidate, rank, delay = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const { label, cls } = rankBadge(rank)

  const {
    name = 'Unknown',
    filename,
    ats_score = 0,
    matched_skills = [],
    missing_skills = [],
    experience_years,
    education,
    summary,
  } = candidate

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card glass-hover group"
    >
      <div className="flex items-start gap-5">
        {/* Score meter */}
        <div className="shrink-0">
          <ScoreMeter score={ats_score} size={84} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('text-xs font-mono px-2 py-0.5 rounded-md border', cls)}>
              {label}
            </span>
            <h3 className="font-display font-semibold text-gray-100 text-lg leading-tight truncate">
              {name}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-mono">
            <span className="flex items-center gap-1">
              <FileText size={11} />
              {filename}
            </span>
            {experience_years != null && (
              <span className="flex items-center gap-1">
                <Briefcase size={11} />
                {experience_years} yr{experience_years !== 1 ? 's' : ''} exp
              </span>
            )}
            {education && (
              <span className="flex items-center gap-1">
                <GraduationCap size={11} />
                {education}
              </span>
            )}
          </div>

          <SkillBadges matched={matched_skills} missing={missing_skills} maxShow={7} />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn-ghost p-2 shrink-0 mt-1"
          aria-label="Toggle details"
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.div>
        </button>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
              {summary && (
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1.5">AI Summary</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Trophy size={10} className="text-brand-400" /> All Matched Skills
                  </p>
                  <SkillBadges matched={matched_skills} missing={[]} maxShow={matched_skills.length} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">Missing Skills</p>
                  <SkillBadges matched={[]} missing={missing_skills} maxShow={missing_skills.length} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
