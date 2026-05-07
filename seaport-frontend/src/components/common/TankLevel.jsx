import { useEffect, useRef } from 'react'

const FUEL_COLOR = (v) => {
  if (v < 30) return { fill: '#ef4444', wave: '#dc2626', label: '#7f1d1d' }
  if (v < 70) return { fill: '#f59e0b', wave: '#d97706', label: '#78350f' }
  return { fill: '#22c55e', wave: '#16a34a', label: '#14532d' }
}

const WATER_COLOR = (v) => {
  if (v < 30) return { fill: '#93c5fd', wave: '#60a5fa', label: '#1e3a5f' }
  if (v < 70) return { fill: '#3b82f6', wave: '#2563eb', label: '#1e3a5f' }
  return { fill: '#1d4ed8', wave: '#1e40af', label: '#1e3a8a' }
}

export default function TankLevel({ type = 'combustivel', value = 0, label }) {
  const progressRef = useRef(null)
  const pct = Math.max(0, Math.min(100, value ?? 0))
  const colors = type === 'combustivel' ? FUEL_COLOR(pct) : WATER_COLOR(pct)
  const displayLabel = label ?? (type === 'combustivel' ? 'Combustível' : 'Água')

  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    el.style.setProperty('--tank-fill', `${pct}%`)
  }, [pct])

  return (
    <div className="tank-wrapper">
      <div className="tank-label">{displayLabel}</div>
      <div className="tank-body" style={{ '--tank-color': colors.fill, '--tank-wave': colors.wave }}>
        <div className="tank-fill" ref={progressRef} style={{ '--tank-fill': `${pct}%` }}>
          <div className="tank-wave" />
        </div>
        <span className="tank-pct" style={{ color: pct > 50 ? '#fff' : colors.label }}>
          {pct}%
        </span>
      </div>
      <div className="tank-scale">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
