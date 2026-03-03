import { C, statusColor, pillarColor, priorityColor, priorityLabel, fmtNum } from '../theme.js'
import StatusBadge from '../components/StatusBadge.jsx'
import ClusterBar from '../components/ClusterBar.jsx'

export default function Home({ data, perf, setView }) {
  const eps      = data.episodes || []
  const clusters = data.clusters || []

  const total      = eps.length
  const byStatus   = {
    IDEA:     eps.filter(e => e.status === 'IDEA').length,
    SCRIPTED: eps.filter(e => e.status === 'SCRIPTED').length,
    FILMED:   eps.filter(e => e.status === 'FILMED').length,
    EDITED:   eps.filter(e => e.status === 'EDITED').length,
    POSTED:   eps.filter(e => e.status === 'POSTED').length,
  }
  const filmReady     = eps.filter(e => e.status === 'EDITED')
  const recentPosted  = eps.filter(e => e.status === 'POSTED').slice(0, 5)
  const filmNow       = clusters.filter(c => c.priority === 'FILM_NOW')
  const launchReady   = clusters.filter(c => c.priority === 'LAUNCH')
  const postPct       = total > 0 ? Math.round((byStatus.POSTED / total) * 100) : 0

  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: 960, margin: '0 auto' }}>

      {/* ── Hero stats row */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: C.textDim,
            letterSpacing: '1.2px', textTransform: 'uppercase',
          }}>Pipeline Overview</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            { label: 'Total',    value: total,           color: C.text,     dim: 'rgba(255,255,255,0.06)'  },
            { label: 'Ideas',    value: byStatus.IDEA,    color: C.idea,     dim: C.ideaDim    },
            { label: 'Scripted', value: byStatus.SCRIPTED, color: C.scripted, dim: C.scriptedDim },
            { label: 'Ready',    value: byStatus.EDITED,  color: C.edited,   dim: C.editedDim  },
            { label: 'Posted',   value: byStatus.POSTED,  color: C.posted,   dim: C.postedDim  },
          ].map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* ── Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          height: 6, borderRadius: 3,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden', display: 'flex',
        }}>
          {byStatus.POSTED   > 0 && <div style={{ width: `${(byStatus.POSTED/total)*100}%`,   background: C.posted,   transition: 'width 700ms ease' }} />}
          {byStatus.EDITED   > 0 && <div style={{ width: `${(byStatus.EDITED/total)*100}%`,   background: C.edited,   transition: 'width 700ms ease' }} />}
          {byStatus.FILMED   > 0 && <div style={{ width: `${(byStatus.FILMED/total)*100}%`,   background: C.filmed,   transition: 'width 700ms ease' }} />}
          {byStatus.SCRIPTED > 0 && <div style={{ width: `${(byStatus.SCRIPTED/total)*100}%`, background: C.scripted, transition: 'width 700ms ease' }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { c: C.posted,   l: 'Posted'   },
              { c: C.edited,   l: 'Ready'    },
              { c: C.filmed,   l: 'Filmed'   },
              { c: C.scripted, l: 'Scripted' },
            ].map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 10, color: C.textDim }}>{l}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 10, color: C.textDim }}>
            {postPct}% complete · {byStatus.POSTED}/{total}
          </span>
        </div>
      </div>

      {/* ── Film Now — action cards */}
      {filmNow.length > 0 && (
        <Section title="Film Now" accent={C.filmNow} count={filmNow.length} hot>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {filmNow.map(c => <ClusterBar key={c.id} cluster={c} episodes={eps} />)}
          </div>
        </Section>
      )}

      {/* ── Ready to post */}
      {filmReady.length > 0 && (
        <Section title="Ready to Post" accent={C.edited} count={filmReady.length}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filmReady.map(ep => <ReadyCard key={ep.id} ep={ep} />)}
          </div>
        </Section>
      )}

      {/* ── Launch clusters */}
      {launchReady.length > 0 && (
        <Section title="Launch Queue" accent={C.brand} count={launchReady.length}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {launchReady.map(c => <ClusterBar key={c.id} cluster={c} episodes={eps} />)}
          </div>
        </Section>
      )}

      {/* ── All clusters */}
      <Section title="All Clusters" accent={C.textDim} count={clusters.length}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {clusters.map(c => <ClusterBar key={c.id} cluster={c} episodes={eps} />)}
        </div>
      </Section>

      {/* ── Recently posted */}
      {recentPosted.length > 0 && (
        <Section title="Recently Posted" accent={C.posted} count={recentPosted.length}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentPosted.map(ep => <PostedRow key={ep.id} ep={ep} />)}
          </div>
        </Section>
      )}

      {/* ── Competitor baseline */}
      {perf?.competitor_baseline?.accounts?.length > 0 && (
        <Section title="Competitor Baseline" accent={C.textDim}>
          <CompTable data={perf} />
        </Section>
      )}

      {/* ── Quick nav */}
      <Section title="Navigate" accent={C.textDim}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <NavCard label="Pipeline" sub="Kanban by stage" onClick={() => setView('pipeline')} color={C.brand} icon="⬡" />
          <NavCard label="Episodes" sub={`Browse all ${total} eps`} onClick={() => setView('episodes')} color={C.scripted} icon="≡" />
          <NavCard label="Calendar" sub="Posting schedule" onClick={() => setView('calendar')} color={C.filmed} icon="◫" />
          <NavCard label="Stats" sub="Charts & metrics" onClick={() => setView('stats')} color={C.posted} icon="↗" />
        </div>
      </Section>
    </div>
  )
}

// ── Sub-components

function StatCard({ label, value, color, dim }) {
  return (
    <div style={{
      background: dim,
      border: `1px solid ${color}20`,
      borderRadius: 12,
      padding: '14px 12px',
      textAlign: 'center',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
    }}>
      <div style={{
        fontSize: 26, fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1, marginBottom: 6,
        textShadow: `0 0 20px ${color}40`,
      }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textDim, fontWeight: 500, letterSpacing: '0.4px' }}>
        {label}
      </div>
    </div>
  )
}

function Section({ title, accent, count, hot, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 3, height: 16, borderRadius: 2,
          background: accent,
          boxShadow: hot ? `0 0 8px ${accent}` : 'none',
        }} />
        <div style={{
          fontSize: 11, fontWeight: 700, color: hot ? accent : C.textDim,
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>{title}</div>
        {count != null && (
          <div style={{
            fontSize: 10, color: accent,
            background: `${accent}14`,
            border: `1px solid ${accent}22`,
            padding: '1px 8px', borderRadius: 10,
            fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          }}>{count}</div>
        )}
      </div>
      {children}
    </div>
  )
}

function ReadyCard({ ep }) {
  return (
    <div className="glass" style={{
      borderRadius: 10, padding: '13px 15px',
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'relative', overflow: 'hidden',
      border: `1px solid ${C.edited}22`,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${C.edited}, ${C.edited}60)`,
        borderRadius: '10px 0 0 10px',
      }} />
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: C.editedDim,
        border: `1px solid ${C.edited}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
      }}>🎬</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</span>
          <StatusBadge status={ep.status} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{ep.title}</div>
        {ep.notes && (
          <div style={{ fontSize: 10, color: C.warn, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>⚡</span> {ep.notes}
          </div>
        )}
      </div>
    </div>
  )
}

function PostedRow({ ep }) {
  return (
    <div className="glass" style={{
      borderRadius: 10, padding: '11px 15px',
      display: 'flex', alignItems: 'center', gap: 12,
      border: `1px solid ${C.posted}18`,
    }}>
      <div style={{ width: 3, height: 30, background: C.posted, borderRadius: 2, flexShrink: 0, boxShadow: `0 0 6px ${C.posted}60` }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{ep.title}</div>
        <div style={{ fontSize: 10, color: C.textDim }}>{ep.id} · {ep.posted_date || 'Posted'}</div>
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {ep.plays != null && <MetricPill label="plays" value={ep.plays} color={C.brand} />}
        {ep.likes != null && <MetricPill label="likes" value={ep.likes} color={C.pos} />}
        {ep.saves != null && <MetricPill label="saves" value={ep.saves} color={C.warn} />}
      </div>
    </div>
  )
}

function MetricPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1, textShadow: `0 0 12px ${color}50`,
      }}>{fmtNum(value)}</div>
      <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function CompTable({ data }) {
  const accounts = data.competitor_baseline?.accounts || []
  return (
    <div className="glass" style={{ borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 80px 90px',
        padding: '9px 16px',
        borderBottom: `1px solid ${C.border}`,
        fontSize: 9, color: C.textDim, fontWeight: 700,
        letterSpacing: '0.8px', textTransform: 'uppercase',
      }}>
        <span>Account</span><span style={{ textAlign: 'right' }}>Followers</span><span style={{ textAlign: 'right', paddingRight: 0 }}>Platform</span>
      </div>
      {accounts.map((a, i) => {
        const isUs = a.handle === '@nasahctus'
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 90px',
            padding: '11px 16px',
            borderBottom: i < accounts.length - 1 ? `1px solid ${C.border}` : 'none',
            background: isUs ? C.brandDim : 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: isUs ? 700 : 500, color: isUs ? C.brand : C.text }}>
                {a.handle}
              </span>
              {isUs && (
                <span style={{
                  fontSize: 9, color: C.brand,
                  background: C.brandDim,
                  border: `1px solid ${C.brand}25`,
                  padding: '1px 5px', borderRadius: 4, fontWeight: 600,
                }}>you</span>
              )}
            </div>
            <div style={{
              fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
              color: C.text, textAlign: 'right',
            }}>
              {a.followers != null ? fmtNum(a.followers) : '—'}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, textAlign: 'right' }}>{a.platform}</div>
          </div>
        )
      })}
    </div>
  )
}

function NavCard({ label, sub, onClick, color, icon }) {
  return (
    <button
      onClick={onClick}
      className="glass glass-hover"
      style={{
        borderRadius: 12, padding: '16px',
        cursor: 'pointer', textAlign: 'left', border: 'none',
        background: C.glass,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `${color}18`,
          border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color,
        }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
      </div>
      <div style={{ fontSize: 11, color: C.textDim }}>{sub}</div>
      <div style={{ marginTop: 10, fontSize: 11, color, fontWeight: 500 }}>Open →</div>
    </button>
  )
}
