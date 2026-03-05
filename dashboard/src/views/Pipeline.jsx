import { useState } from 'react'
import { C, statusColor, statusDim, pillarColor, personaLabel, personaColor } from '../theme.js'
import StatusBadge from '../components/StatusBadge.jsx'

const STATUSES = ['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED']
const STATUS_META = {
  IDEA:     { label: 'Ideas',    icon: '💡', desc: 'Not yet started' },
  SCRIPTED: { label: 'Scripted', icon: '✍️',  desc: 'Script written'  },
  FILMED:   { label: 'Filmed',   icon: '🎬', desc: 'Footage captured' },
  EDITED:   { label: 'Edited',   icon: '✂️',  desc: 'Ready to post'   },
  POSTED:   { label: 'Posted',   icon: '✅', desc: 'Live on socials'  },
}

export default function Pipeline({ data, openCreate }) {
  const eps      = data.episodes || []
  const clusters = data.clusters || []

  const [filterCluster, setFilterCluster] = useState('all')
  const [filterPillar,  setFilterPillar]  = useState('all')
  const [filterPersona, setFilterPersona] = useState('all')

  const pillars  = [...new Set(eps.map(e => e.pillar).filter(Boolean))].sort()
  const personas = [...new Set(eps.map(e => e.persona))]

  const filtered = eps.filter(ep => {
    if (filterCluster !== 'all' && ep.cluster_id !== filterCluster) return false
    if (filterPillar  !== 'all' && String(ep.pillar) !== filterPillar) return false
    if (filterPersona !== 'all' && ep.persona !== filterPersona) return false
    return true
  })

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(e => e.status === s)
    return acc
  }, {})

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Filter bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: 'rgba(5,6,15,0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        flexShrink: 0,
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <GlassSelect
          value={filterCluster}
          onChange={setFilterCluster}
          options={[{ value: 'all', label: 'All Clusters' }, ...clusters.map(c => ({ value: c.id, label: c.name }))]}
        />
        <GlassSelect
          value={filterPillar}
          onChange={setFilterPillar}
          options={[{ value: 'all', label: 'All Pillars' }, ...pillars.map(p => ({ value: String(p), label: `Pillar ${p}` }))]}
        />
        <GlassSelect
          value={filterPersona}
          onChange={setFilterPersona}
          options={[{ value: 'all', label: 'All Personas' }, ...personas.map(p => ({ value: p, label: personaLabel(p) }))]}
        />
        <div style={{
          marginLeft: 'auto',
          fontSize: 11, color: C.textDim,
          fontFamily: "'JetBrains Mono', monospace",
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${C.border}`,
          padding: '4px 10px', borderRadius: 6,
        }}>{filtered.length} ep</div>
      </div>

      {/* Kanban */}
      <div style={{
        flex: 1, overflow: 'auto',
        display: 'flex',
        padding: '16px 16px 24px',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        {STATUSES.map(status => {
          const col = byStatus[status]
          const sc  = statusColor(status)
          const { label, icon } = STATUS_META[status]

          return (
            <div key={status} style={{
              minWidth: 248, width: 248, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Column header */}
              <div style={{
                padding: '11px 14px',
                background: statusDim(status),
                border: `1px solid ${sc}25`,
                borderBottom: 'none',
                borderRadius: '12px 12px 0 0',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sc, letterSpacing: '-0.1px' }}>{label}</span>
                </div>
                <span style={{
                  fontSize: 11, color: sc,
                  background: `${sc}18`,
                  border: `1px solid ${sc}22`,
                  padding: '1px 8px', borderRadius: 10,
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  boxShadow: col.length > 0 ? `0 0 8px ${sc}30` : 'none',
                }}>{col.length}</span>
              </div>

              {/* Cards column */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                padding: '8px',
                background: 'rgba(255,255,255,0.018)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${C.border}`,
                borderTop: `1px solid ${sc}18`,
                borderRadius: '0 0 12px 12px',
                minHeight: 100,
              }}>
                {col.length === 0 && (
                  <div style={{
                    padding: '24px 12px', textAlign: 'center',
                    color: C.textFaint, fontSize: 11,
                    border: `1px dashed rgba(255,255,255,0.06)`,
                    borderRadius: 8,
                  }}>Empty</div>
                )}
                {col.map(ep => <KanbanCard key={ep.id} ep={ep} openCreate={openCreate} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KanbanCard({ ep, openCreate }) {
  const pc = pillarColor(ep.pillar)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => openCreate?.(ep)}
      style={{
        background: hovered ? C.glassMd : C.glass,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? C.borderBright : C.border}`,
        borderRadius: 9,
        padding: '10px 11px 10px 14px',
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${pc}20` : C.shadowSm,
        transition: 'all 150ms ease',
        cursor: openCreate ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pillar left bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${pc}, ${pc}50)`,
        borderRadius: '9px 0 0 9px',
      }} />

      {/* Top row: ID + pillar badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 9, color: C.textDim,
          fontFamily: "'JetBrains Mono', monospace",
        }}>{ep.id}</span>
        <span style={{
          fontSize: 9, color: pc,
          background: `${pc}14`, border: `1px solid ${pc}22`,
          padding: '1px 5px', borderRadius: 3, fontWeight: 600,
        }}>P{ep.pillar}</span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: C.text,
        lineHeight: 1.4, marginBottom: 8,
      }}>{ep.title}</div>

      {/* Persona badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          fontSize: 9, color: personaColor(ep.persona),
          background: `${personaColor(ep.persona)}12`,
          border: `1px solid ${personaColor(ep.persona)}20`,
          padding: '1px 5px', borderRadius: 3, fontWeight: 500,
        }}>{personaLabel(ep.persona)}</span>
        {ep.hook_formula && (
          <span style={{ fontSize: 9, color: C.textFaint }}>{ep.hook_formula}</span>
        )}
      </div>

      {/* Urgent note */}
      {ep.notes && ep.notes.includes('⚡') && (
        <div style={{ marginTop: 7, fontSize: 9, color: C.warn, lineHeight: 1.3 }}>
          ⚡ {ep.notes.replace('⚡ ', '')}
        </div>
      )}
    </div>
  )
}

function GlassSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '6px 10px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${C.border}`,
        borderRadius: 8, color: C.text,
        fontSize: 12, outline: 'none', cursor: 'pointer',
        transition: 'border-color 150ms',
        fontFamily: "'Inter', sans-serif",
      }}
      onFocus={e => { e.target.style.borderColor = C.borderBright }}
      onBlur={e => { e.target.style.borderColor = C.border }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#0b0d16' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
