import { useEffect, useRef } from 'react'
import { cn } from './ui/cn.js'

function scoreColor(score) {
  if (score >= 80) return { stroke: '#24a265', text: 'score-excellent' }
  if (score >= 65) return { stroke: '#facc15', text: 'score-good' }
  if (score >= 45) return { stroke: '#fb923c', text: 'score-average' }
  return { stroke: '#f87171', text: 'score-low' }
}

/**
 * Circular SVG ATS score meter.
 * @param {{ score: number, size?: number, strokeWidth?: number }} props
 */
export default function ScoreMeter({ score = 0, size = 88, strokeWidth = 7 }) {
  const circleRef = useRef(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const { stroke, text } = scoreColor(score)

  useEffect(() => {
    if (!circleRef.current) return
    circleRef.current.style.setProperty('--target-offset', offset)
    circleRef.current.style.strokeDashoffset = circumference
    // force reflow then animate
    void circleRef.current.getBoundingClientRect()
    circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)'
    circleRef.current.style.strokeDashoffset = offset
  }, [score, offset, circumference])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ filter: `drop-shadow(0 0 6px ${stroke}80)` }}
        />
      </svg>
      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-display font-bold leading-none', text, size > 70 ? 'text-2xl' : 'text-lg')}>
          {Math.round(score)}
        </span>
        <span className="text-gray-500 text-xs font-mono mt-0.5">ATS</span>
      </div>
    </div>
  )
}
