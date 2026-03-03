import { C, pillarColor, statusColor, personaColor, fmtNum } from '../theme.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const PILLAR_NAMES = [
  '', 'Neighbourhood', 'Price History', 'Migration & CoL',
  'Investment', 'Market Pulse', 'Real Deal', 'Personal Journey', 'News',
]

export default function Stats({ data, perf }) {
  const eps      = data.episodes || []
  const clusters = data.clusters || []

  const statusCounts = ['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED'].map(s => ({
    status: s, count: eps.filter(e => e.status === s).length, color: statusColor(s),
  }))

  const pillarData = Array.from({ length: 8 }, (_, i) => {
    const p     = i + 1
    const pEps  = eps.filter(e => e.pillar === p)
    return {
      name: `P${p}`, fullName: PILLAR_NAMES[p],
      total:  pEps.length,
      posted: pEps.filter(e => e.status === 'POSTED').length,
      ready:  pEps.filter(e => e.status === 'EDITED').length,
      color:  pillarColor(p),
    }
  }).filter(p => p.total > 0)

  const clusterData = clusters.map(c => {
    const cEps   = eps.filter(e => e.cluster_id === c.id)
    const posted = cEps.filter(e => e.status === 'POSTED').length
    return {
      name: c.name.length > 20 ? c.name.slice(0, 18) + '…' : c.name,
      fullName: c.name,
      total: c.episodes_total,
      posted,
      pct: c.episodes_total > 0 ? Math.round((posted / c.episodes_total) * 100) : 0,
    }
  })

  const personaData = [
    { name: 'Ontario Transplant', key: 'ontario-transplant', color: '#7c6dff' },
    { name: 'Saskatoon Local',    key: 'saskatoon-local',    color: '#10d98e' },
    { name: 'First-Time Buyer',   key: 'first-time-buyer',   color: '#f59e0b' },
    { name: 'Calgary Investor',   key: 'calgary-investor',   color: '#f56565' },
    { name: 'All Personas',       key: 'all',                color: '#637089' },
  ].map(p => ({ ...p, value: eps.filter(e => e.persona === p.key).length }))
   .filter(p => p.value > 0)

  const totalPosted = eps.filter(e => e.status === 'POSTED').length
  const totalEps    = eps.length
  const postPct     = totalEps > 0 ? Math.round((totalPosted / totalEps) * 100) : 0

  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: 920, margin: '0 auto' }}>

      {/* ── Hero completion card */}
      <div className="glass" style={{
        borderRadius: 16, padding: '24px 28px',
        marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
        position: 'relative', overflow: 'hidden',
        border: `1px solid rgba(124,109,255,0.18)`,
      }}>
        {/* Gradient orb behind number */}
        <div style={{
          position: 'absolute', top: -40, left: -30,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,109,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
            Pipeline Completion
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontSize: 64, fontWeight: 900, lineHeight: 1,
              fontFamily: "'JetBrains Mono', monospace",
              background: C.brandGrad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{postPct}</span>
            <span style={{ fontSize: 28, color: C.textDim, fontWeight: 600 }}>%</span>
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>
            {totalPosted} of {totalEps} episodes posted
          </div>
        </div>

        {/* Status bars */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {statusCounts.map(s => (
              <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 3, height: 16, borderRadius: 2,
                  background: s.color,
                  boxShadow: s.count > 0 ? `0 0 6px ${s.color}60` : 'none',
                }} />
                <div style={{ fontSize: 11, color: C.textDim, width: 68 }}>{s.status}</div>
                <div style={{
                  flex: 1, height: 5,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${totalEps > 0 ? (s.count / totalEps) * 100 : 0}%`,
                    background: s.color,
                    borderRadius: 3,
                    transition: 'width 700ms ease',
                    boxShadow: s.count > 0 ? `0 0 6px ${s.color}40` : 'none',
                  }} />
                </div>
                <div style={{
                  fontSize: 11, color: C.text, width: 24, textAlign: 'right',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pillar breakdown */}
      <Section title="Episodes by Pillar">
        <div style={{ height: 220, marginBottom: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pillarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Total">
                {pillarData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.25} />)}
              </Bar>
              <Bar dataKey="posted" radius={[4, 4, 0, 0]} name="Posted">
                {pillarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pillarData.map(p => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: `${p.color}10`, border: `1px solid ${p.color}20`,
              padding: '3px 8px', borderRadius: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
              <span style={{ fontSize: 10, color: C.textDim }}>{p.name}: {p.fullName}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Cluster completion */}
      <Section title="Cluster Progress">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {clusterData.map(c => (
            <div key={c.name} style={{
              display: 'grid', gridTemplateColumns: '180px 1fr 44px',
              gap: 12, alignItems: 'center',
            }}>
              <div style={{ fontSize: 11, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.fullName}
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${c.pct}%`,
                  background: c.pct === 100
                    ? C.pos
                    : `linear-gradient(90deg, ${C.brand}, ${C.brandLight})`,
                  borderRadius: 3, transition: 'width 600ms ease',
                  boxShadow: c.pct === 100 ? `0 0 8px ${C.pos}40` : 'none',
                }} />
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, textAlign: 'right',
                color: c.pct === 100 ? C.pos : C.text,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{c.pct}%</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Persona distribution */}
      <Section title="Episodes by Persona">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: 180, height: 180, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={personaData} dataKey="value"
                  cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                  paddingAngle={2} strokeWidth={0}
                >
                  {personaData.map((p, i) => (
                    <Cell key={i} fill={p.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {personaData.map(p => (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: p.color,
                  boxShadow: `0 0 6px ${p.color}60`, flexShrink: 0,
                }} />
                <div style={{ fontSize: 12, color: C.text, width: 150 }}>{p.name}</div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: p.color,
                  fontFamily: "'JetBrains Mono', monospace",
                  textShadow: `0 0 10px ${p.color}40`,
                }}>{p.value}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>
                  ({Math.round((p.value / totalEps) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Competitor table */}
      {perf?.competitor_baseline?.accounts?.length > 0 && (
        <Section title="Competitor Baseline">
          <div className="glass" style={{ borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Handle', 'Platform', 'Followers', 'Note'].map(h => (
                    <th key={h} style={{
                      padding: '9px 16px', textAlign: 'left',
                      fontSize: 9, color: C.textDim, fontWeight: 700,
                      letterSpacing: '0.7px', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perf.competitor_baseline.accounts.map((a, i) => {
                  const isUs = a.handle === '@nasahctus'
                  return (
                    <tr key={i} style={{
                      borderBottom: i < perf.competitor_baseline.accounts.length - 1 ? `1px solid ${C.border}` : 'none',
                      background: isUs ? C.brandDim : 'transparent',
                    }}>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: isUs ? 700 : 500, color: isUs ? C.brand : C.text }}>
                        {a.handle} {isUs && <span style={{ fontSize: 9, color: C.brand, marginLeft: 4, opacity: 0.7 }}>← you</span>}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: C.textDim }}>{a.platform}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>
                        {a.followers != null ? fmtNum(a.followers) : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 10, color: C.textFaint }}>{a.note}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: C.textFaint, marginTop: 8 }}>
            Updated: {perf.competitor_baseline.updated} · Run /re content research to refresh
          </div>
        </Section>
      )}

      {/* ── Milestones */}
      {perf?.milestones?.length > 0 && (
        <Section title="Milestones">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {perf.milestones.map((m, i) => (
              <div key={i} className="glass" style={{
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                border: `1px solid ${m.reached ? `${C.pos}30` : C.border}`,
                background: m.reached ? 'rgba(16,217,142,0.06)' : C.glass,
                opacity: m.reached ? 1 : 0.65,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: m.reached ? 'rgba(16,217,142,0.2)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${m.reached ? C.pos : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: m.reached ? C.pos : C.textFaint,
                  boxShadow: m.reached ? `0 0 10px ${C.pos}30` : 'none',
                }}>{m.reached ? '✓' : ''}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: m.reached ? 600 : 400, color: m.reached ? C.pos : C.textDim }}>
                    {m.label}
                  </div>
                  {m.date && (
                    <div style={{ fontSize: 9, color: C.textFaint, marginTop: 2 }}>{m.date}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 3, height: 16, borderRadius: 2,
          background: C.brand, boxShadow: `0 0 8px ${C.brand}60`,
        }} />
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.textDim,
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>{title}</div>
      </div>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(11,13,22,0.95)',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${C.borderBright}`,
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      {label && <div style={{ fontSize: 11, color: C.textDim, marginBottom: 7 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.fill || p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.textDim }}>{p.name || p.dataKey}:</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: C.text,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}
