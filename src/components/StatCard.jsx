import { useEffect, useState } from 'react'

export default function StatCard({ label, value, note, icon: Icon, tone = 'sage', trend }) {
  const numericValue = Number(String(value).replaceAll(',', ''))
  const [displayValue, setDisplayValue] = useState(Number.isFinite(numericValue) ? 0 : value)

  useEffect(() => {
    if (!Number.isFinite(numericValue)) {
      setDisplayValue(value)
      return undefined
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(numericValue)
      return undefined
    }

    const duration = 650
    let frameId
    let startTime
    const animate = (time) => {
      if (startTime === undefined) startTime = time
      const progress = Math.min((time - startTime) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      setDisplayValue(Math.round(numericValue * easedProgress))
      if (progress < 1) frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frameId)
  }, [numericValue, value])

  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-topline"><span>{label}</span><span className="stat-icon"><Icon size={18} strokeWidth={1.9} /></span></div>
      <div className="stat-value" aria-label={String(value)}>{Number.isFinite(numericValue) ? displayValue.toLocaleString('en-US') : displayValue}</div>
      <div className="stat-note">{trend && <span className="stat-trend">{trend}</span>}{note}</div>
    </article>
  )
}
