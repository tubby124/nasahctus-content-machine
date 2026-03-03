import { C, statusColor, statusDim, pillarColor, personaColor, personaLabel } from '../theme.js'
import StatusBadge from './StatusBadge.jsx'

export default function EpisodeCard({ ep, onClick, compact = false }) {
  const pc = pillarColor(ep.pillar)

  return (
    <div onClick={onClick} style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: compact ? '10px 12px' : '14px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 200ms ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = C.borderBright; e.currentTarget.style.background = C.surface2 } }}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface } }}
    >
      {/* Pillar color bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: pc, borderRadius: '10px 0 0 10px',
      }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: compact ? 4 : 8 }}>
          <div style={{
            fontSize: compact ? 10 : 10, color: C.textDim,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
          }}>{ep.id}</div>
          <StatusBadge status={ep.status} />
        </div>

        {/* Title */}
        <div style={{
          fontSize: compact ? 12 : 13, fontWeight: 600, color: C.text,
          lineHeight: 1.35, marginBottom: compact ? 4 : 8,
        }}>{ep.title}</div>

        {compact ? null : (
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6, lineHeight: 1.4 }}>
            {ep.cluster_name}
          </div>
        )}

        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          {/* Pillar */}
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 4,
            background: `${pc}18`, color: pc, fontWeight: 600,
          }}>P{ep.pillar}</span>

          {/* Persona */}
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 4,
            background: `${personaColor(ep.persona)}18`,
            color: personaColor(ep.persona), fontWeight: 500,
          }}>{personaLabel(ep.persona)}</span>

          {/* Hook formula */}
          {ep.hook_formula && !compact && (
            <span style={{ fontSize: 9, color: C.textFaint }}>{ep.hook_formula}</span>
          )}
        </div>

        {/* Notes */}
        {ep.notes && !compact && (
          <div style={{
            marginTop: 8, fontSize: 10, color: C.textDim,
            background: C.surface2, padding: '5px 8px', borderRadius: 6,
            borderLeft: `2px solid ${C.borderBright}`,
          }}>{ep.notes}</div>
        )}

        {/* Metrics (if posted) */}
        {ep.status === 'POSTED' && (ep.plays != null || ep.likes != null) && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {ep.plays != null && <Metric label="Plays" value={ep.plays} color={C.brand} />}
            {ep.likes != null && <Metric label="Likes" value={ep.likes} color={C.pos} />}
            {ep.saves != null && <Metric label="Saves" value={ep.saves} color={C.warn} />}
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
      </div>
      <div style={{ fontSize: 9, color: C.textDim, marginTop: 1 }}>{label}</div>
    </div>
  )
}
