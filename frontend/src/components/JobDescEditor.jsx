import { useStore } from '../store/useStore.js'
import { cn } from './ui/cn.js'

const MAX_CHARS = 5000

export default function JobDescEditor() {
  const { jobDescription, setJobDescription } = useStore()
  const len = jobDescription.length
  const pct = Math.min(100, (len / MAX_CHARS) * 100)

  return (
    <div className="space-y-2">
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_CHARS))}
        placeholder={`Paste the job description here…\n\nExample:\nWe are looking for a Senior ML Engineer with experience in Python, FastAPI, and transformer models…`}
        rows={12}
        className={cn(
          'input-base w-full resize-none leading-relaxed text-sm',
          len > MAX_CHARS * 0.9 && 'border-orange-500/40 focus:border-orange-500/60'
        )}
      />

      {/* Character counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-600 font-mono">
          {len === 0 ? 'Start typing or paste a JD…' : `${len.toLocaleString()} characters`}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                pct > 90 ? 'bg-orange-400' : 'bg-brand-500'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={cn('text-xs font-mono', pct > 90 ? 'text-orange-400' : 'text-gray-600')}>
            {MAX_CHARS - len} left
          </span>
        </div>
      </div>
    </div>
  )
}
