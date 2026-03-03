import { C, statusColor, statusDim } from '../App.jsx'

export default function StatusBadge({ status, size = 'sm' }) {
  const sc = statusColor(status)
  const sd = statusDim(status)
  const pad = size === 'sm' ? '2px 7px' : '4px 10px'
  const fs = size === 'sm' ? 10 : 11

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pad, borderRadius: 20,
      background: sd, border: `1px solid ${sc}22`,
      color: sc, fontSize: fs, fontWeight: 600, letterSpacing: '0.5px',
      fontFamily: "'JetBrains Mono', monospace",
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc, flexShrink: 0 }} />
      {status}
    </span>
  )
}
