import { CheckCircle2, XCircle } from 'lucide-react'

export default function SkillBadges({ matched = [], missing = [], maxShow = 6 }) {
  const allSkills = [
    ...matched.slice(0, maxShow).map((s) => ({ label: s, type: 'matched' })),
    ...missing.slice(0, Math.max(0, maxShow - matched.length)).map((s) => ({ label: s, type: 'missing' })),
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {allSkills.map(({ label, type }) => (
        <span
          key={label}
          className={type === 'matched' ? 'skill-matched flex items-center gap-1' : 'skill-missing flex items-center gap-1'}
        >
          {type === 'matched'
            ? <CheckCircle2 size={10} className="text-brand-400 shrink-0" />
            : <XCircle size={10} className="text-red-400 shrink-0" />
          }
          {label}
        </span>
      ))}
      {(matched.length + missing.length) > maxShow && (
        <span className="text-xs text-gray-500 font-mono px-2 py-1">
          +{(matched.length + missing.length) - maxShow} more
        </span>
      )}
    </div>
  )
}
