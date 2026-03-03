import { C, statusColor, pillarColor } from '../App.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import ClusterBar from '../components/ClusterBar.jsx'

export default function Home({ data, perf, setView }) {
  const eps = data.episodes || []
  const clusters = data.clusters || []

  const total = eps.length
  const byStatus = {
    IDEA: eps.filter(e => e.status === 'IDEA').length,
    SCRIPTED: eps.filter(e => e.status === 'SCRIPTED').length,
    FILMED: eps.filter(e => e.status === 'FILMED').length,
    EDITED: eps.filter(e => e.status === 'EDITED').length,
    POSTED: eps.filter(e => e.status === 'POSTED').length,
  }

  const filmReady = eps.filter(e => e.status === 'EDITED')
  const recentlyPosted = eps.filter(e => e.status === 'POSTED').slice(0, 5)
  const priorityClusters = clusters.filter(c => c.priority === 'high').slice(0, 3)

  return (
    <div style={{ padding: '20px 16px', maxWidth: 900, margin: '0 auto' }}>

      {/* Stats bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, letterSpacing: '0.8px', marginBottom: 12 }}>
          PIPELINE OVERVIEW
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[
            { label: 'Total', value: total, color: C.text },
            { label: 'Ideas', value: byStatus.IDEA, color: C.idea },
            { label: 'Scripted', value: byStatus.SCRIPTED, color: C.scripted },
            { label: 'Edited', value: byStatus.EDITED, color: C.edited },
            { label: 'Posted', value: byStatus.POSTED, color: C.posted },
          ].map(s => (
            <StatChip key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* Progress bar — all episodes */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          height: 8, borderRadius: 4, background: C.surface2, overflow: 'hidden',
          display: 'flex',
        }}>
          {byStatus.POSTED > 0   && <div style={{ width: `${(byStatus.POSTED/total)*100}%`,   background: C.posted,   transition: 'width 600ms ease' }} />}
          {byStatus.EDITED > 0   && <div style={{ width: `${(byStatus.EDITED/total)*100}%`,   background: C.edited,   transition: 'width 600ms ease' }} />}
          {byStatus.FILMED > 0   && <div style={{ width: `${(byStatus.FILMED/total)*100}%`,   background: C.filmed,   transition: 'width 600ms ease' }} />}
          {byStatus.SCRIPTED > 0 && <div style={{ width: `${(byStatus.SCRIPTED/total)*100}%`, background: C.scripted, transition: 'width 600ms ease' }} />}
        </div>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 6, textAlign: 'right' }}>
          {Math.round((byStatus.POSTED/total)*100)}% complete ({byStatus.POSTED} of {total} posted)
        </div>
      </div>

      {/* Film this week */}
      {filmReady.length > 0 && (
        <Section title="READY TO POST" accent={C.edited} count={filmReady.length}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filmReady.map(ep => (
              <ReadyCard key={ep.id} ep={ep} setView={setView} />
            ))}
          </div>
        </Section>
      )}

      {/* Priority clusters */}
      {priorityClusters.length > 0 && (
        <Section title="PRIORITY CLUSTERS" accent={C.brand}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {priorityClusters.map(c => (
              <ClusterBar key={c.id} cluster={c} episodes={eps} />
            ))}
          </div>
        </Section>
      )}

      {/* All clusters */}
      <Section title="ALL CLUSTERS" accent={C.textDim}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 10,
        }}>
          {clusters.map(c => (
            <ClusterBar key={c.id} cluster={c} episodes={eps} />
          ))}
        </div>
      </Section>

      {/* Recently posted */}
      {recentlyPosted.length > 0 && (
        <Section title="RECENTLY POSTED" accent={C.posted}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentlyPosted.map(ep => (
              <PostedRow key={ep.id} ep={ep} />
            ))}
          </div>
        </Section>
      )}

      {/* Competitor baseline */}
      {perf && (
        <Section title="COMPETITOR BASELINE" accent={C.textDim}>
          <CompetitorTable data={perf} />
        </Section>
      )}

      {/* Quick actions */}
      <Section title="QUICK ACTIONS" accent={C.textDim}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <ActionCard label="View Pipeline" sub="Kanban by status" onClick={() => setView('pipeline')} color={C.brand} />
          <ActionCard label="Browse Episodes" sub="Search all 73 eps" onClick={() => setView('episodes')} color={C.scripted} />
          <ActionCard label="Posting Calendar" sub="Weekly schedule" onClick={() => setView('calendar')} color={C.filmed} />
          <ActionCard label="Stats & Performance" sub="Charts + metrics" onClick={() => setView('stats')} color={C.posted} />
        </div>
      </Section>
    </div>
  )
}

function StatChip({ label, value, color }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '12px 10px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 22, fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
        marginBottom: 5,
      }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textDim, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function Section({ title, accent, count, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 3, height: 14, background: accent, borderRadius: 2 }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: '0.8px' }}>{title}</div>
        {count != null && (
          <div style={{
            fontSize: 10, color: accent, background: `${accent}18`,
            padding: '1px 7px', borderRadius: 10, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{count}</div>
        )}
      </div>
      {children}
    </div>
  )
}

function ReadyCard({ ep, setView }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.edited}30`,
      borderRadius: 10, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: C.edited, borderRadius: '10px 0 0 10px',
      }} />
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `${C.edited}18`, border: `1px solid ${C.edited}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 16 }}>🎬</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</span>
          <StatusBadge status={ep.status} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{ep.title}</div>
        {ep.notes && <div style={{ fontSize: 10, color: C.warn, marginTop: 3 }}>{ep.notes}</div>}
      </div>
    </div>
  )
}

function PostedRow({ ep }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 4, height: 32, background: C.posted, borderRadius: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ep.title}</div>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{ep.id} · {ep.posted_date || 'Posted'}</div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {ep.plays != null && <Metric label="plays" value={ep.plays} color={C.brand} />}
        {ep.likes != null && <Metric label="likes" value={ep.likes} color={C.pos} />}
      </div>
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
      </div>
      <div style={{ fontSize: 9, color: C.textDim }}>{label}</div>
    </div>
  )
}

function CompetitorTable({ data }) {
  const accounts = data.competitor_baseline?.accounts || []
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto auto',
        gap: 0, fontSize: 10, color: C.textDim, fontWeight: 600,
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        letterSpacing: '0.5px',
      }}>
        <span>ACCOUNT</span><span>FOLLOWERS</span><span>PLATFORM</span>
      </div>
      {accounts.map((a, i) => {
        const isUs = a.handle === '@nasahctus'
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto',
            gap: 0, padding: '10px 14px',
            borderBottom: i < accounts.length - 1 ? `1px solid ${C.border}` : 'none',
            background: isUs ? C.brandDim : 'transparent',
          }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: isUs ? 700 : 500, color: isUs ? C.brand : C.text }}>
                {a.handle}
              </span>
              {isUs && <span style={{ fontSize: 9, color: C.brand, marginLeft: 6 }}>← you</span>}
            </div>
            <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: C.text, paddingRight: 16 }}>
              {a.followers != null ? a.followers.toLocaleString() : '—'}
            </div>
            <div style={{ fontSize: 11, color: C.textDim }}>{a.platform}</div>
          </div>
        )
      })}
    </div>
  )
}

function ActionCard({ label, sub, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '14px', cursor: 'pointer',
      textAlign: 'left', transition: 'all 200ms',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = C.surface2 }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.textDim }}>{sub}</div>
    </button>
  )
}
