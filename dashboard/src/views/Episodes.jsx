import { useState } from 'react'
import { C, statusColor, statusDim, pillarColor, personaLabel, personaColor, fmtNum } from '../theme.js'
import StatusBadge from '../components/StatusBadge.jsx'
import BlotatoModal from '../components/BlotatoModal.jsx'

const STATUSES        = ['', 'IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED']
const STATUS_PIPELINE = ['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED']
const STATUS_LABELS   = { IDEA: '💡 Idea', SCRIPTED: '✍️ Scripted', FILMED: '🎬 Filmed', EDITED: '✂️ Edited', POSTED: '✅ Posted' }

export default function Episodes({ data, onUpdate, onInsert, refresh, isLive }) {
  const eps      = data.episodes || []
  const clusters = data.clusters || []

  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')
  const [filterCluster, setFilterCluster] = useState('all')
  const [selected,      setSelected]      = useState(null)
  const [scheduleEp,    setScheduleEp]    = useState(null)
  const [showAddModal,  setShowAddModal]  = useState(false)

  const filtered = eps.filter(ep => {
    const q = search.toLowerCase()
    if (q && !ep.title.toLowerCase().includes(q) && !ep.id.toLowerCase().includes(q) && !(ep.cluster_name || '').toLowerCase().includes(q)) return false
    if (filterStatus  && ep.status !== filterStatus) return false
    if (filterCluster !== 'all' && ep.cluster_id !== filterCluster) return false
    return true
  })

  const selectedEp = selected ? eps.find(e => e.id === selected) : null

  const handleUpdate = async (id, patch) => {
    if (!onUpdate) return
    const ok = await onUpdate(id, patch)
    if (ok && refresh) await refresh()
  }

  const handleInsert = async (row) => {
    if (!onInsert) return
    await onInsert(row)
    if (refresh) await refresh()
    setShowAddModal(false)
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', position: 'relative' }}>

      {/* ── List panel */}
      <div
        className={selectedEp ? 'ep-list-shrunk' : ''}
        style={{
          flex: selectedEp ? '0 0 320px' : 1,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          borderRight: selectedEp ? `1px solid ${C.border}` : 'none',
          transition: 'flex 280ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Search + filters */}
        <div style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(5,6,15,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          flexShrink: 0,
        }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <div style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              fontSize: 13, color: C.textDim, pointerEvents: 'none',
            }}>⌕</div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search episodes…"
              style={{
                width: '100%',
                padding: '9px 12px 9px 32px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${C.border}`,
                borderRadius: 9, color: C.text,
                fontSize: 13, outline: 'none',
                transition: 'border-color 150ms',
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={e => { e.target.style.borderColor = C.brand }}
              onBlur={e => { e.target.style.borderColor = C.border }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <GlassSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={STATUSES.map(s => ({ value: s, label: s || 'All Status' }))}
            />
            <GlassSelect
              value={filterCluster}
              onChange={setFilterCluster}
              options={[{ value: 'all', label: 'All Clusters' }, ...clusters.map(c => ({ value: c.id, label: c.name }))]}
            />
            <span style={{
              fontSize: 11, color: C.textDim, marginLeft: 'auto',
              fontFamily: "'JetBrains Mono', monospace",
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${C.border}`,
              padding: '3px 8px', borderRadius: 6,
            }}>
              {filtered.length}
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
            <div style={{ padding: 40, textAlign: 'center', color: C.textDim, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>◌</div>
              No episodes match
            </div>
          )}
        </div>
      </div>

      {/* ── Detail panel */}
      {selectedEp && (
        <DetailPanel
          ep={selectedEp}
          clusters={clusters}
          onClose={() => setSelected(null)}
          onSchedule={() => setScheduleEp(selectedEp)}
          onUpdate={handleUpdate}
          isLive={isLive}
        />
      )}

      {/* Blotato modal */}
      {scheduleEp && (
        <BlotatoModal episode={scheduleEp} onClose={() => setScheduleEp(null)} />
      )}

      {/* Add episode modal */}
      {showAddModal && (
        <AddEpisodeModal
          clusters={clusters}
          onClose={() => setShowAddModal(false)}
          onSave={handleInsert}
        />
      )}

      {/* Floating + button */}
      {isLive && (
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            position: 'fixed', bottom: 80, right: 20,
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #a78bfa, #7c6dff)',
            border: 'none', cursor: 'pointer',
            fontSize: 24, color: '#fff', fontWeight: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(124,109,255,0.4), 0 8px 24px rgba(124,109,255,0.45)',
            zIndex: 200,
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124,109,255,0.6), 0 12px 32px rgba(124,109,255,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124,109,255,0.4), 0 8px 24px rgba(124,109,255,0.45)' }}
          title="Add episode idea"
        >+</button>
      )}

      <style>{`
        @media (max-width: 767px) {
          .ep-list-shrunk { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function EpisodeRow({ ep, selected, onClick }) {
  const sc = statusColor(ep.status)
  const pc = pillarColor(ep.pillar)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: selected
          ? 'rgba(124,109,255,0.10)'
          : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'flex-start', gap: 11,
        position: 'relative',
        transition: 'background 150ms',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {selected && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: C.brand, boxShadow: `0 0 8px ${C.brand}`,
        }} />
      )}
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: pc, marginTop: 5, flexShrink: 0,
        boxShadow: selected ? `0 0 5px ${pc}` : 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: C.textFaint, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</span>
          <StatusBadge status={ep.status} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: selected ? C.text : C.textSub, lineHeight: 1.35, marginBottom: 3 }}>{ep.title}</div>
        <div style={{ fontSize: 10, color: C.textDim }}>{ep.cluster_name}</div>
      </div>
    </div>
  )
}

function DetailPanel({ ep, clusters, onClose, onSchedule, onUpdate, isLive }) {
  const cluster = clusters.find(c => c.id === ep.cluster_id)
  const pc      = pillarColor(ep.pillar)
  const epIdx   = STATUS_PIPELINE.indexOf(ep.status)

  const [saving,        setSaving]        = useState(false)
  const [showPosted,    setShowPosted]    = useState(false)
  const [postedDate,    setPostedDate]    = useState(new Date().toISOString().slice(0, 10))
  const [statsPlays,    setStatsPlays]    = useState('')
  const [statsLikes,    setStatsLikes]    = useState('')
  const [statsSaves,    setStatsSaves]    = useState('')
  const [editingStats,  setEditingStats]  = useState(false)
  const [editingScript, setEditingScript] = useState(false)
  const [scriptDraft,   setScriptDraft]   = useState(ep.script || '')
  const [captionDraft,  setCaptionDraft]  = useState(ep.caption || '')

  const handleStatusClick = async (newStatus) => {
    if (newStatus === ep.status) return
    if (newStatus === 'POSTED') {
      setShowPosted(true)
      return
    }
    setSaving(true)
    await onUpdate(ep.id, { status: newStatus })
    setSaving(false)
  }

  const handleMarkPosted = async () => {
    setSaving(true)
    const patch = {
      status: 'POSTED',
      posted_date: postedDate,
      ...(statsPlays ? { plays: parseInt(statsPlays) || null } : {}),
      ...(statsLikes ? { likes: parseInt(statsLikes) || null } : {}),
      ...(statsSaves ? { saves: parseInt(statsSaves) || null } : {}),
    }
    await onUpdate(ep.id, patch)
    setShowPosted(false)
    setSaving(false)
  }

  const handleUpdateStats = async () => {
    setSaving(true)
    const patch = {
      ...(statsPlays !== '' ? { plays: parseInt(statsPlays) || null } : {}),
      ...(statsLikes !== '' ? { likes: parseInt(statsLikes) || null } : {}),
      ...(statsSaves !== '' ? { saves: parseInt(statsSaves) || null } : {}),
    }
    await onUpdate(ep.id, patch)
    setEditingStats(false)
    setSaving(false)
  }

  const handleSaveScript = async () => {
    setSaving(true)
    await onUpdate(ep.id, { script: scriptDraft, caption: captionDraft })
    setEditingScript(false)
    setSaving(false)
  }

  return (
    <div
      className="ep-detail"
      style={{
        flex: 1, overflow: 'auto',
        background: 'rgba(8,10,20,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex', flexDirection: 'column',
        borderLeft: `1px solid ${C.border}`,
        animation: 'fadein 200ms ease',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '18px 22px',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${pc}90, transparent)` }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</span>
              <StatusBadge status={ep.status} size="md" />
              {saving && <span style={{ fontSize: 10, color: C.brand, animation: 'pulse 1s infinite' }}>saving…</span>}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.3, letterSpacing: '-0.3px' }}>{ep.title}</div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`,
            cursor: 'pointer', color: C.textDim, fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = C.text }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.textDim }}
          >✕</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '20px 22px', overflow: 'auto' }}>

        {/* ── Interactive Pipeline Stepper */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Label>Pipeline Stage</Label>
            {!isLive && <span style={{ fontSize: 9, color: C.textFaint }}>Connect Supabase to enable</span>}
          </div>

          {/* Stage buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_PIPELINE.map((s, i) => {
              const isCurrent = s === ep.status
              const isPast    = i < epIdx
              const isFuture  = i > epIdx
              const sc        = statusColor(s)

              return (
                <button
                  key={s}
                  disabled={!isLive || isPast || isCurrent || saving}
                  onClick={() => handleStatusClick(s)}
                  style={{
                    padding: '7px 13px',
                    borderRadius: 8,
                    border: isCurrent
                      ? `1px solid ${sc}`
                      : isPast
                        ? `1px solid ${sc}40`
                        : `1px solid ${C.border}`,
                    background: isCurrent
                      ? `${sc}18`
                      : isPast
                        ? `${sc}08`
                        : 'rgba(255,255,255,0.03)',
                    color: isCurrent ? sc : isPast ? `${sc}60` : C.textDim,
                    fontSize: 11, fontWeight: isCurrent ? 700 : 500,
                    cursor: (isFuture && isLive && !saving) ? 'pointer' : 'default',
                    transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: isCurrent ? `0 0 12px ${sc}25` : 'none',
                    opacity: (isPast || isCurrent) ? 1 : isLive ? 1 : 0.4,
                  }}
                  onMouseEnter={e => {
                    if (isFuture && isLive && !saving) {
                      e.currentTarget.style.background = `${sc}15`
                      e.currentTarget.style.borderColor = `${sc}60`
                      e.currentTarget.style.color = sc
                    }
                  }}
                  onMouseLeave={e => {
                    if (isFuture) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.borderColor = C.border
                      e.currentTarget.style.color = C.textDim
                    }
                  }}
                >
                  <span style={{ fontSize: 12 }}>
                    {isPast ? '✓' : STATUS_LABELS[s].split(' ')[0]}
                  </span>
                  {s}
                  {isFuture && isLive && <span style={{ fontSize: 9, opacity: 0.6 }}>→</span>}
                </button>
              )
            })}
          </div>

          {/* Mark Posted inline form */}
          {showPosted && (
            <div style={{
              marginTop: 14, padding: '14px 16px',
              background: 'rgba(16,217,142,0.06)',
              border: '1px solid rgba(16,217,142,0.2)',
              borderRadius: 10,
              animation: 'fadein 200ms ease',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.pos, marginBottom: 12, letterSpacing: '0.3px' }}>
                ✅ Mark as Posted
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Posted</div>
                  <input
                    type="date"
                    value={postedDate}
                    onChange={e => setPostedDate(e.target.value)}
                    style={inputStyle()}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plays (optional)</div>
                  <input
                    type="number"
                    value={statsPlays}
                    onChange={e => setStatsPlays(e.target.value)}
                    placeholder="0"
                    style={inputStyle()}
                    onWheel={e => e.target.blur()}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Likes</div>
                  <input
                    type="number"
                    value={statsLikes}
                    onChange={e => setStatsLikes(e.target.value)}
                    placeholder="0"
                    style={inputStyle()}
                    onWheel={e => e.target.blur()}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saves</div>
                  <input
                    type="number"
                    value={statsSaves}
                    onChange={e => setStatsSaves(e.target.value)}
                    placeholder="0"
                    style={inputStyle()}
                    onWheel={e => e.target.blur()}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleMarkPosted}
                  disabled={saving}
                  style={{
                    flex: 1, padding: '10px',
                    background: 'rgba(16,217,142,0.2)',
                    border: '1px solid rgba(16,217,142,0.4)',
                    borderRadius: 8, color: C.pos,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {saving ? 'Saving…' : '✅ Confirm Posted'}
                </button>
                <button
                  onClick={() => setShowPosted(false)}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 8, color: C.textDim,
                    fontSize: 12, cursor: 'pointer',
                  }}
                >Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          <MetaCard label="Cluster"      value={ep.cluster_name || '—'} />
          <MetaCard label="Pillar"       value={`P${ep.pillar} — ${ep.pillar_name || ''}`} color={pc} />
          <MetaCard label="Persona"      value={personaLabel(ep.persona)} color={personaColor(ep.persona)} />
          <MetaCard label="Hook Formula" value={ep.hook_formula || '—'} />
          {cluster && <MetaCard label="Data Ready"  value={cluster.data_ready ? 'Yes ✓' : 'No'}  color={cluster.data_ready ? C.pos : C.warn} />}
          {cluster && <MetaCard label="Lyra Needed" value={cluster.lyra_needed ? `Yes — ${cluster.lyra_prompt || ''}` : 'No'} color={cluster.lyra_needed ? C.warn : C.pos} />}
        </div>

        {/* Notes */}
        {ep.notes && (
          <div style={{ marginBottom: 18 }}>
            <Label>Notes</Label>
            <div style={{
              padding: '12px 14px',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 10, fontSize: 13, color: C.text, lineHeight: 1.6,
            }}>{ep.notes}</div>
          </div>
        )}

        {/* File */}
        {ep.file && (
          <div style={{ marginBottom: 18 }}>
            <Label>File</Label>
            <div style={{
              padding: '10px 13px', background: 'rgba(124,109,255,0.06)',
              border: '1px solid rgba(124,109,255,0.18)', borderRadius: 9,
              fontSize: 12, color: C.brand, fontFamily: "'JetBrains Mono', monospace",
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span style={{ opacity: 0.5 }}>◻</span>
              {ep.file}
            </div>
          </div>
        )}

        {/* Performance */}
        {ep.status === 'POSTED' && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <Label>Performance</Label>
              {isLive && !editingStats && (
                <button
                  onClick={() => {
                    setStatsPlays(ep.plays != null ? String(ep.plays) : '')
                    setStatsLikes(ep.likes != null ? String(ep.likes) : '')
                    setStatsSaves(ep.saves != null ? String(ep.saves) : '')
                    setEditingStats(true)
                  }}
                  style={{
                    fontSize: 10, color: C.brand, background: C.brandDim,
                    border: '1px solid rgba(124,109,255,0.25)',
                    padding: '3px 9px', borderRadius: 6, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >Update stats</button>
              )}
            </div>

            {editingStats ? (
              <div style={{
                padding: '14px 16px', background: 'rgba(124,109,255,0.06)',
                border: '1px solid rgba(124,109,255,0.2)', borderRadius: 10,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                  {[['Plays', statsPlays, setStatsPlays], ['Likes', statsLikes, setStatsLikes], ['Saves', statsSaves, setStatsSaves]].map(([label, val, setter]) => (
                    <div key={label}>
                      <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                      <input
                        type="number"
                        value={val}
                        onChange={e => setter(e.target.value)}
                        style={inputStyle()}
                        onWheel={e => e.target.blur()}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleUpdateStats}
                    disabled={saving}
                    style={{
                      flex: 1, padding: '9px',
                      background: C.brandDim, border: '1px solid rgba(124,109,255,0.3)',
                      borderRadius: 8, color: C.brand,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                  >{saving ? 'Saving…' : 'Save Stats'}</button>
                  <button
                    onClick={() => setEditingStats(false)}
                    style={{
                      padding: '9px 14px', background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${C.border}`, borderRadius: 8,
                      color: C.textDim, fontSize: 12, cursor: 'pointer',
                    }}
                  >Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <MetricCard label="Plays" value={ep.plays} color={C.brand} />
                  <MetricCard label="Likes" value={ep.likes} color={C.pos} />
                  <MetricCard label="Saves" value={ep.saves} color={C.warn} />
                </div>
                {ep.posted_date && (
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 8 }}>
                    Posted: {ep.posted_date}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Script */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <Label>Script</Label>
            {isLive && (
              <div style={{ display: 'flex', gap: 6 }}>
                {editingScript ? (
                  <>
                    <button
                      onClick={handleSaveScript}
                      disabled={saving}
                      style={{
                        fontSize: 10, color: C.pos, background: 'rgba(16,217,142,0.12)',
                        border: '1px solid rgba(16,217,142,0.3)',
                        padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >{saving ? 'Saving…' : '✓ Save'}</button>
                    <button
                      onClick={() => { setEditingScript(false); setScriptDraft(ep.script || ''); setCaptionDraft(ep.caption || '') }}
                      style={{
                        fontSize: 10, color: C.textDim, background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${C.border}`,
                        padding: '3px 9px', borderRadius: 6, cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >Cancel</button>
                  </>
                ) : (
                  <button
                    onClick={() => { setScriptDraft(ep.script || ''); setCaptionDraft(ep.caption || ''); setEditingScript(true) }}
                    style={{
                      fontSize: 10, color: C.brand, background: C.brandDim,
                      border: '1px solid rgba(124,109,255,0.25)',
                      padding: '3px 9px', borderRadius: 6, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >{ep.script ? 'Edit script' : '+ Add script'}</button>
                )}
              </div>
            )}
          </div>

          {editingScript ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                value={scriptDraft}
                onChange={e => setScriptDraft(e.target.value)}
                placeholder="Paste or type your full script here…&#10;&#10;## Hook&#10;&#10;## Body&#10;&#10;## CTA"
                rows={16}
                style={{
                  ...inputStyle(),
                  resize: 'vertical', lineHeight: 1.65,
                  fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                  padding: '13px 14px',
                }}
              />
              <div>
                <div style={{ fontSize: 9, color: C.textDim, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Caption (IG/TikTok)</div>
                <textarea
                  value={captionDraft}
                  onChange={e => setCaptionDraft(e.target.value)}
                  placeholder="Caption text + hashtags…"
                  rows={4}
                  style={{
                    ...inputStyle(),
                    resize: 'vertical', lineHeight: 1.6,
                    fontSize: 12,
                  }}
                />
              </div>
            </div>
          ) : ep.script ? (
            <div>
              <ScriptViewer text={ep.script} />
              {ep.caption && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 9, color: C.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Caption</div>
                  <div style={{
                    padding: '11px 13px',
                    background: 'rgba(124,109,255,0.05)', border: '1px solid rgba(124,109,255,0.15)',
                    borderRadius: 9, fontSize: 12, color: C.textSub, lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>{ep.caption}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: '20px 14px', textAlign: 'center',
              border: `1px dashed ${C.border}`, borderRadius: 10,
              color: C.textFaint, fontSize: 12,
            }}>
              {isLive ? 'No script yet — tap "+ Add script" to paste one' : 'Connect Supabase to add scripts'}
            </div>
          )}
        </div>
      </div>

      {/* Schedule button */}
      <div style={{ padding: '16px 22px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button
          onClick={onSchedule}
          style={{
            width: '100%', padding: '12px',
            background: C.brandDim, border: `1px solid rgba(124,109,255,0.3)`,
            borderRadius: 10, color: C.brand,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'all 200ms', fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.1px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #a78bfa, #7c6dff)'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(124,109,255,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = C.brandDim
            e.currentTarget.style.color = C.brand
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Schedule with Blotato →
        </button>
        {!import.meta.env.VITE_BLOTATO_KEY && (
          <div style={{ fontSize: 10, color: C.textFaint, textAlign: 'center', marginTop: 6 }}>
            Configure VITE_BLOTATO_KEY to enable
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .ep-detail {
            position: fixed; inset: 0; z-index: 50;
            border-radius: 0; border-left: none !important;
          }
        }
      `}</style>
    </div>
  )
}

// ── Add Episode Modal
function AddEpisodeModal({ clusters, onClose, onSave }) {
  const [title,     setTitle]     = useState('')
  const [clusterId, setClusterId] = useState(clusters[0]?.id || '')
  const [persona,   setPersona]   = useState('ftb')
  const [saving,    setSaving]    = useState(false)

  const selectedCluster = clusters.find(c => c.id === clusterId)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    const id = `EP-${Date.now().toString().slice(-6)}`
    await onSave({
      id,
      title: title.trim(),
      cluster_id: clusterId,
      cluster_name: selectedCluster?.name || '',
      pillar: selectedCluster?.pillar || 1,
      persona,
      status: 'IDEA',
    })
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(3,4,10,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadein 200ms ease',
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(12,14,26,0.98)',
        border: `1px solid ${C.border}`,
        borderRadius: '16px 16px 0 0',
        padding: '24px 22px 32px',
        width: '100%', maxWidth: 480,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        animation: 'fadein 200ms ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.15)',
          margin: '-12px auto 20px',
        }} />

        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>
          💡 New Episode Idea
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title *</div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Your hook / episode title…"
            autoFocus
            style={{
              ...inputStyle(),
              fontSize: 14, padding: '12px 14px',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && title.trim()) handleSave() }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cluster</div>
            <select
              value={clusterId}
              onChange={e => setClusterId(e.target.value)}
              style={{ ...inputStyle(), cursor: 'pointer' }}
            >
              {clusters.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0b0d16' }}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Persona</div>
            <select
              value={persona}
              onChange={e => setPersona(e.target.value)}
              style={{ ...inputStyle(), cursor: 'pointer' }}
            >
              <option value="ont" style={{ background: '#0b0d16' }}>Ontario Transplant</option>
              <option value="sk"  style={{ background: '#0b0d16' }}>Saskatoon Local</option>
              <option value="ftb" style={{ background: '#0b0d16' }}>First-Time Buyer</option>
              <option value="inv" style={{ background: '#0b0d16' }}>Calgary Investor</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            style={{
              flex: 1, padding: '13px',
              background: title.trim() ? 'linear-gradient(135deg, #a78bfa, #7c6dff)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 10,
              color: title.trim() ? '#fff' : C.textDim,
              fontSize: 13, fontWeight: 700, cursor: title.trim() ? 'pointer' : 'default',
              boxShadow: title.trim() ? '0 4px 20px rgba(124,109,255,0.4)' : 'none',
              transition: 'all 200ms',
              fontFamily: "'Inter', sans-serif",
            }}
          >{saving ? 'Adding…' : '+ Add to Pipeline'}</button>
          <button
            onClick={onClose}
            style={{
              padding: '13px 18px', background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${C.border}`, borderRadius: 10,
              color: C.textDim, fontSize: 13, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Script viewer — renders markdown headings + paragraphs
function ScriptViewer({ text }) {
  const lines = text.split('\n')
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      maxHeight: 420, overflowY: 'auto',
    }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <div key={i} style={{
              fontSize: 11, fontWeight: 700, color: C.brand,
              textTransform: 'uppercase', letterSpacing: '0.8px',
              marginTop: i === 0 ? 0 : 16, marginBottom: 6,
            }}>{line.replace('## ', '')}</div>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <div key={i} style={{
              fontSize: 13, fontWeight: 800, color: C.text,
              marginTop: i === 0 ? 0 : 20, marginBottom: 8,
            }}>{line.replace('# ', '')}</div>
          )
        }
        if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
        return (
          <div key={i} style={{
            fontSize: 12.5, color: C.textSub, lineHeight: 1.7,
            marginBottom: 2,
          }}>{line}</div>
        )
      })}
    </div>
  )
}

// ── Shared helpers
function inputStyle() {
  return {
    width: '100%', padding: '9px 11px',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text,
    fontSize: 13, outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 150ms',
  }
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: C.textDim,
      letterSpacing: '0.7px', textTransform: 'uppercase',
      marginBottom: 9,
    }}>{children}</div>
  )
}

function MetaCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
      borderRadius: 9, padding: '10px 12px',
    }}>
      <div style={{ fontSize: 9, color: C.textDim, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: color || C.text, lineHeight: 1.3 }}>{value}</div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{
      background: `${color}08`, border: `1px solid ${color}18`,
      borderRadius: 9, padding: '13px 12px', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 24, fontWeight: 800,
        color: value != null ? color : C.textFaint,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1, marginBottom: 6,
        textShadow: value != null ? `0 0 20px ${color}50` : 'none',
      }}>
        {value != null ? fmtNum(value) : '—'}
      </div>
      <div style={{ fontSize: 10, color: C.textDim }}>{label}</div>
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
        border: `1px solid ${C.border}`,
        borderRadius: 8, color: C.text,
        fontSize: 12, outline: 'none', cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#0b0d16' }}>{o.label}</option>
      ))}
    </select>
  )
}
