import { C, statusColor, statusDim } from '../theme.js'

const STATUS_ICONS = {
  IDEA:     '◦',
  SCRIPTED: '✍',
  FILMED:   '⬡',
  EDITED:   '◈',
  POSTED:   '✓',
}

export default function StatusBadge({ status, size = 'sm' }) {
  const sc = statusColor(status)
  const sd = statusDim(status)
  const isLg = size === 'lg' || size === 'md'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: isLg ? '4px 10px' : '2px 7px',
      borderRadius: 20,
      background: sd,
      border: `1px solid ${sc}28`,
      color: sc,
      fontSize: isLg ? 11 : 10,
      fontWeight: 600,
      letterSpacing: '0.4px',
      fontFamily: "'JetBrains Mono', monospace",
      whiteSpace: 'nowrap',
      boxShadow: status === 'POSTED' || status === 'EDITED' ? `0 0 8px ${sc}22` : 'none',
    }}>
      <span style={{
        width: isLg ? 5 : 4, height: isLg ? 5 : 4,
        borderRadius: '50%',
        background: sc,
        flexShrink: 0,
        boxShadow: (status === 'POSTED' || status === 'EDITED') ? `0 0 4px ${sc}` : 'none',
      }} />
      {status}
    </span>
  )
}
