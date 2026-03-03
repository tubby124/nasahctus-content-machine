import { useState } from 'react'
import { C, statusColor, statusDim, pillarColor, personaLabel, personaColor } from '../App.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const STATUSES = ['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED']
const STATUS_LABELS = { IDEA: 'Ideas', SCRIPTED: 'Scripted', FILMED: 'Filmed', EDITED: 'Edited', POSTED: 'Posted' }
const STATUS_EMOJI = { IDEA: '💡', SCRIPTED: '✍️', FILMED: '🎬', EDITED: '✂️', POSTED: '✅' }

export default function Pipeline({ data }) {
  const eps = data.episodes || []
  const clusters = data.clusters || []

  const [filterCluster, setFilterCluster] = useState('all')
  const [filterPillar, setFilterPillar] = useState('all')
  const [filterPersona, setFilterPersona] = useState('all')

  const pillars = [...new Set(eps.map(e => e.pillar))].sort()
  const personas = [...new Set(eps.map(e => e.persona))]

  const filtered = eps.filter(ep => {
    if (filterCluster !== 'all' && ep.cluster_id !== filterCluster) return false
    if (filterPillar !== 'all' && String(ep.pillar) !== filterPillar) return false
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
        padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
        background: C.surface, flexShrink: 0,
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <FilterSelect
          value={filterCluster}
          onChange={setFilterCluster}
          options={[{ value: 'all', label: 'All Clusters' }, ...clusters.map(c => ({ value: c.id, label: c.name }))]}
        />
        <FilterSelect
          value={filterPillar}
          onChange={setFilterPillar}
          options={[{ value: 'all', label: 'All Pillars' }, ...pillars.map(p => ({ value: String(p), label: `Pillar ${p}` }))]}
        />
        <FilterSelect
          value={filterPersona}
          onChange={setFilterPersona}
          options={[{ value: 'all', label: 'All Personas' }, ...personas.map(p => ({ value: p, label: personaLabel(p) }))]}
        />
        <div style={{ fontSize: 11, color: C.textDim, marginLeft: 'auto' }}>
          {filtered.length} episodes
        </div>
      </div>

      {/* Kanban columns — horizontal scroll on mobile */}
      <div style={{
        flex: 1, overflow: 'auto',
        display: 'flex',
        padding: '16px',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        {STATUSES.map(status => {
          const col = byStatus[status]
          const sc = statusColor(status)
          return (
            <div key={status} style={{
              minWidth: 240, width: 240, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Column header */}
              <div style={{
                padding: '10px 12px',
                background: statusDim(status),
                border: `1px solid ${sc}30`,
                borderRadius: '10px 10px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{STATUS_EMOJI[status]}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sc }}>{STATUS_LABELS[status]}</span>
                </div>
                <span style={{
                  fontSize: 11, color: sc, background: `${sc}20`,
                  padding: '1px 7px', borderRadius: 10,
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                }}>{col.length}</span>
              </div>

              {/* Cards */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                padding: '8px',
                background: `${C.surface}88`,
                border: `1px solid ${C.border}`,
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                minHeight: 120,
                flex: 1,
              }}>
                {col.length === 0 && (
                  <div style={{
                    padding: '20px 8px', textAlign: 'center',
                    color: C.textFaint, fontSize: 11,
                    border: `1px dashed ${C.border}`, borderRadius: 8,
                  }}>Empty</div>
                )}
                {col.map(ep => <KanbanCard key={ep.id} ep={ep} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KanbanCard({ ep }) {
  const pc = pillarColor(ep.pillar)
  const sc = statusColor(ep.status)

  return (
    <div style={{
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '10px 10px 10px 13px',
      position: 'relative', overflow: 'hidden',
      transition: 'all 150ms',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderBright }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border }}
    >
      {/* Pillar bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: pc, borderRadius: '8px 0 0 8px',
      }} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 5,
      }}>
        <span style={{
          fontSize: 9, color: C.textDim,
          fontFamily: "'JetBrains Mono', monospace",
        }}>{ep.id}</span>
        <span style={{
          fontSize: 9, color: pc, background: `${pc}18`,
          padding: '1px 5px', borderRadius: 3, fontWeight: 600,
        }}>P{ep.pillar}</span>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.35, marginBottom: 6 }}>
        {ep.title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          fontSize: 9, color: personaColor(ep.persona),
          background: `${personaColor(ep.persona)}15`,
          padding: '1px 5px', borderRadius: 3, fontWeight: 500,
        }}>{personaLabel(ep.persona)}</span>
      </div>

      {ep.notes && (
        <div style={{
          marginTop: 6, fontSize: 9, color: C.warn, lineHeight: 1.3,
        }}>⚡ {ep.notes}</div>
      )}
    </div>
  )
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '6px 10px', background: C.surface2,
        border: `1px solid ${C.border}`, borderRadius: 8,
        color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
