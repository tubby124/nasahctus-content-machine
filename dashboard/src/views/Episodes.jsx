import { useState } from 'react'
import { C, statusColor, statusDim, pillarColor, personaLabel, personaColor } from '../App.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import BlotatoModal from '../components/BlotatoModal.jsx'

const STATUSES = ['', 'IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED']

export default function Episodes({ data }) {
  const eps = data.episodes || []
  const clusters = data.clusters || []

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCluster, setFilterCluster] = useState('all')
  const [selected, setSelected] = useState(null)
  const [scheduleEp, setScheduleEp] = useState(null)

  const filtered = eps.filter(ep => {
    if (search && !ep.title.toLowerCase().includes(search.toLowerCase()) && !ep.id.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && ep.status !== filterStatus) return false
    if (filterCluster !== 'all' && ep.cluster_id !== filterCluster) return false
    return true
  })

  const selectedEp = selected ? eps.find(e => e.id === selected) : null

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* List panel */}
      <div style={{
        flex: selectedEp ? '0 0 340px' : 1,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        borderRight: selectedEp ? `1px solid ${C.border}` : 'none',
        transition: 'flex 300ms ease',
      }} className={selectedEp ? 'list-with-panel' : ''}>
        {/* Search + filters */}
        <div style={{
          padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
          background: C.surface, flexShrink: 0,
        }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search episodes..."
            style={{
              width: '100%', padding: '9px 12px', marginBottom: 10,
              background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.text, fontSize: 13,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <FilterSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={STATUSES.map(s => ({ value: s, label: s || 'All Status' }))}
            />
            <FilterSelect
              value={filterCluster}
              onChange={setFilterCluster}
              options={[{ value: 'all', label: 'All Clusters' }, ...clusters.map(c => ({ value: c.id, label: c.name }))]}
            />
            <span style={{ fontSize: 11, color: C.textDim, alignSelf: 'center', marginLeft: 4 }}>
              {filtered.length} ep{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Episode list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(ep => (
            <EpisodeRow
              key={ep.id}
              ep={ep}
              selected={selected === ep.id}
              onClick={() => setSelected(selected === ep.id ? null : ep.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: C.textDim, fontSize: 13 }}>
              No episodes match your filters
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedEp && (
        <DetailPanel
          ep={selectedEp}
          clusters={clusters}
          onClose={() => setSelected(null)}
          onSchedule={() => setScheduleEp(selectedEp)}
        />
      )}

      {/* Blotato modal */}
      {scheduleEp && (
        <BlotatoModal episode={scheduleEp} onClose={() => setScheduleEp(null)} />
      )}

      <style>{`
        @media (max-width: 767px) {
          .list-with-panel { flex: 0 0 100% !important; display: ${selectedEp ? 'none' : 'flex'} !important; }
        }
      `}</style>
    </div>
  )
}

function EpisodeRow({ ep, selected, onClick }) {
  const sc = statusColor(ep.status)
  const pc = pillarColor(ep.pillar)

  return (
    <div onClick={onClick} style={{
      padding: '12px 16px',
      borderBottom: `1px solid ${C.border}`,
      background: selected ? C.surface2 : 'transparent',
      cursor: 'pointer',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      position: 'relative',
      transition: 'background 150ms',
    }}
    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = `${C.surface}` }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      {selected && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: C.brand,
        }} />
      )}
      {/* Pillar dot */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc, marginTop: 4, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</span>
          <StatusBadge status={ep.status} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.35 }}>{ep.title}</div>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{ep.cluster_name}</div>
      </div>
    </div>
  )
}

function DetailPanel({ ep, clusters, onClose, onSchedule }) {
  const cluster = clusters.find(c => c.id === ep.cluster_id)
  const pc = pillarColor(ep.pillar)

  return (
    <div style={{
      flex: 1, overflow: 'auto',
      background: C.surface,
      display: 'flex', flexDirection: 'column',
    }} className="detail-panel">
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</span>
            <StatusBadge status={ep.status} size="md" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{ep.title}</div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textDim, fontSize: 20, padding: 4, flexShrink: 0,
        }}>×</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        {/* Metadata grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, marginBottom: 20,
        }}>
          <MetaCard label="Cluster" value={ep.cluster_name} />
          <MetaCard label="Pillar" value={`P${ep.pillar} — ${ep.pillar_name}`} color={pc} />
          <MetaCard label="Persona" value={personaLabel(ep.persona)} color={personaColor(ep.persona)} />
          <MetaCard label="Hook Formula" value={ep.hook_formula || '—'} />
          {cluster && <MetaCard label="Data Ready" value={cluster.data_ready ? 'Yes' : 'No'} color={cluster.data_ready ? C.pos : C.warn} />}
          {cluster && <MetaCard label="Lyra Needed" value={cluster.lyra_needed ? `Yes — ${cluster.lyra_prompt || ''}` : 'No'} color={cluster.lyra_needed ? C.warn : C.pos} />}
        </div>

        {/* Notes */}
        {ep.notes && (
          <div style={{ marginBottom: 20 }}>
            <Label>Notes</Label>
            <div style={{
              padding: '12px 14px', background: C.surface2,
              border: `1px solid ${C.border}`, borderRadius: 10,
              fontSize: 13, color: C.text, lineHeight: 1.6,
            }}>{ep.notes}</div>
          </div>
        )}

        {/* File */}
        {ep.file && (
          <div style={{ marginBottom: 20 }}>
            <Label>File</Label>
            <div style={{
              padding: '10px 12px', background: C.surface2,
              border: `1px solid ${C.border}`, borderRadius: 8,
              fontSize: 12, color: C.brand, fontFamily: "'JetBrains Mono', monospace",
            }}>{ep.file}</div>
          </div>
        )}

        {/* Performance metrics */}
        {ep.status === 'POSTED' && (
          <div style={{ marginBottom: 20 }}>
            <Label>Performance</Label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
            }}>
              <MetricCard label="Plays" value={ep.plays} color={C.brand} />
              <MetricCard label="Likes" value={ep.likes} color={C.pos} />
              <MetricCard label="Saves" value={ep.saves} color={C.warn} />
            </div>
            {ep.posted_date && (
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
                Posted: {ep.posted_date}
              </div>
            )}
          </div>
        )}

        {/* Status history */}
        <div style={{ marginBottom: 20 }}>
          <Label>Pipeline Position</Label>
          <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
            {['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED'].map((s, i, arr) => {
              const statuses = ['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED']
              const epIdx = statuses.indexOf(ep.status)
              const sIdx = statuses.indexOf(s)
              const done = sIdx <= epIdx
              const active = s === ep.status
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    flex: 1, height: 3,
                    background: done ? statusColor(s) : C.border,
                    display: i === 0 ? 'none' : 'block',
                    transition: 'background 300ms',
                  }} />
                  <div style={{
                    width: active ? 10 : 8, height: active ? 10 : 8,
                    borderRadius: '50%',
                    background: done ? statusColor(s) : C.border,
                    border: active ? `2px solid ${statusColor(s)}` : 'none',
                    flexShrink: 0, transition: 'all 300ms',
                  }} />
                  {i < arr.length - 1 && (
                    <div style={{
                      flex: 1, height: 3,
                      background: sIdx < epIdx ? statusColor(arr[i + 1]) : C.border,
                      transition: 'background 300ms',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED'].map(s => (
              <span key={s} style={{
                fontSize: 8, color: s === ep.status ? statusColor(s) : C.textFaint,
                fontWeight: s === ep.status ? 700 : 400, letterSpacing: '0.3px',
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule button */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onSchedule} style={{
          width: '100%', padding: '12px',
          background: C.brandDim, border: `1px solid ${C.brand}`,
          borderRadius: 10, color: C.brand,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          transition: 'all 200ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = C.brand; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = C.brandDim; e.currentTarget.style.color = C.brand }}
        >
          Schedule with Blotato →
        </button>
        <div style={{ fontSize: 10, color: C.textDim, textAlign: 'center', marginTop: 6 }}>
          {import.meta.env.VITE_BLOTATO_KEY ? 'API key configured' : 'Configure VITE_BLOTATO_KEY in Vercel to enable'}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .detail-panel {
            position: fixed; inset: 0; z-index: 50;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: '0.7px', marginBottom: 8 }}>
      {children}
    </div>
  )
}

function MetaCard({ label, value, color }) {
  return (
    <div style={{
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '10px 12px',
    }}>
      <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: color || C.text, lineHeight: 1.3 }}>{value}</div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '12px', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 22, fontWeight: 800,
        color: value != null ? color : C.textFaint,
        fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
        marginBottom: 6,
      }}>
        {value != null ? (value >= 1000 ? `${(value/1000).toFixed(1)}k` : value) : '—'}
      </div>
      <div style={{ fontSize: 10, color: C.textDim }}>{label}</div>
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
