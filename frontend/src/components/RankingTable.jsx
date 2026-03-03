import { motion } from 'framer-motion'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import ScoreMeter from './ScoreMeter.jsx'
import SkillBadges from './SkillBadges.jsx'
import { cn } from './ui/cn.js'

export default function RankingTable({ candidates = [] }) {
  const { sortBy, setSortBy } = useStore()

  const sorted = [...candidates].sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
    if (sortBy === 'experience') return (b.experience_years || 0) - (a.experience_years || 0)
    return b.ats_score - a.ats_score
  })

  const ColHeader = ({ field, label }) => {
    const active = sortBy === field
    return (
      <th
        className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-gray-500
                   cursor-pointer hover:text-gray-300 select-none transition-colors"
        onClick={() => setSortBy(field)}
      >
        <span className="flex items-center gap-1.5">
          {label}
          {active ? <ArrowUp size={11} className="text-brand-400" /> : <ArrowUpDown size={11} />}
        </span>
      </th>
    )
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-gray-500 w-12">#</th>
            <ColHeader field="name" label="Candidate" />
            <ColHeader field="score" label="ATS Score" />
            <ColHeader field="experience" label="Experience" />
            <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-gray-500">Skills</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.map((c, i) => (
            <motion.tr
              key={c.filename + i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="hover:bg-white/2 transition-colors group"
            >
              <td className="px-4 py-4 text-xs font-mono text-gray-600">{i + 1}</td>
              <td className="px-4 py-4">
                <p className="font-display font-semibold text-gray-200 text-sm">{c.name || 'Unknown'}</p>
                <p className="text-xs text-gray-600 font-mono mt-0.5 truncate max-w-[180px]">{c.filename}</p>
              </td>
              <td className="px-4 py-4">
                <ScoreMeter score={c.ats_score} size={52} strokeWidth={5} />
              </td>
              <td className="px-4 py-4 text-sm text-gray-400 font-mono">
                {c.experience_years != null ? `${c.experience_years} yr${c.experience_years !== 1 ? 's' : ''}` : '—'}
              </td>
              <td className="px-4 py-4 max-w-[240px]">
                <SkillBadges matched={c.matched_skills || []} missing={c.missing_skills || []} maxShow={4} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
