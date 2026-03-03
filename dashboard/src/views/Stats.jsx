import { C, pillarColor, statusColor } from '../App.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell, Legend,
} from 'recharts'

const PILLAR_NAMES = [
  '', 'Neighbourhood Guide', 'Listing Tour', 'Migration & CoL',
  'Investment & Deal', 'Market Pulse', 'Buyer Education',
  'Seller Education', 'News & Events'
]

export default function Stats({ data, perf }) {
  const eps = data.episodes || []
  const clusters = data.clusters || []

  // Status distribution
  const statusCounts = ['IDEA', 'SCRIPTED', 'FILMED', 'EDITED', 'POSTED'].map(s => ({
    status: s,
    count: eps.filter(e => e.status === s).length,
    color: statusColor(s),
  }))

  // Pillar breakdown
  const pillarData = Array.from({ length: 8 }, (_, i) => {
    const p = i + 1
    const pillarEps = eps.filter(e => e.pillar === p)
    return {
      name: `P${p}`,
      fullName: PILLAR_NAMES[p],
      total: pillarEps.length,
      posted: pillarEps.filter(e => e.status === 'POSTED').length,
      ready: pillarEps.filter(e => e.status === 'EDITED').length,
      color: pillarColor(p),
    }
  }).filter(p => p.total > 0)

  // Cluster completion
  const clusterData = clusters.map(c => {
    const cEps = eps.filter(e => e.cluster_id === c.id)
    const posted = cEps.filter(e => e.status === 'POSTED').length
    return {
      name: c.name.length > 18 ? c.name.slice(0, 16) + '…' : c.name,
      fullName: c.name,
      total: c.episodes_total,
      posted,
      pct: c.episodes_total > 0 ? Math.round((posted / c.episodes_total) * 100) : 0,
    }
  })

  // Persona breakdown
  const personaData = [
    { name: 'Ontario Transplant', key: 'ontario-transplant', color: '#6470ff' },
    { name: 'Saskatoon Local', key: 'saskatoon-local', color: '#10d98e' },
    { name: 'First-Time Buyer', key: 'first-time-buyer', color: '#f7a45a' },
    { name: 'Calgary Investor', key: 'calgary-investor', color: '#e85a5a' },
    { name: 'All', key: 'all', color: '#6b7a99' },
  ].map(p => ({
    ...p,
    value: eps.filter(e => e.persona === p.key).length,
  })).filter(p => p.value > 0)

  const totalPosted = eps.filter(e => e.status === 'POSTED').length
  const totalEps = eps.length
  const postPct = totalEps > 0 ? Math.round((totalPosted / totalEps) * 100) : 0

  return (
    <div style={{ padding: '20px 16px', maxWidth: 900, margin: '0 auto' }}>

      {/* Hero stat */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '24px',
        marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, letterSpacing: '0.8px', marginBottom: 8 }}>PIPELINE COMPLETION</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontSize: 56, fontWeight: 900, color: C.brand,
              fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
            }}>{postPct}</span>
            <span style={{ fontSize: 24, color: C.textDim, fontWeight: 600 }}>%</span>
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
            {totalPosted} of {totalEps} episodes posted
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {statusCounts.map(s => (
              <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 16, background: s.color, borderRadius: 2 }} />
                <div style={{ fontSize: 11, color: C.textDim, width: 70 }}>{s.status}</div>
                <div style={{ flex: 1, height: 6, background: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(s.count/totalEps)*100}%`,
                    background: s.color, borderRadius: 3,
                    transition: 'width 600ms ease',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: C.text, fontFamily: "'JetBrains Mono', monospace", width: 24, textAlign: 'right' }}>
                  {s.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pillar breakdown */}
      <Section title="EPISODES BY PILLAR">
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pillarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Total">
                {pillarData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.4} />
                ))}
              </Bar>
              <Bar dataKey="posted" radius={[4, 4, 0, 0]} name="Posted">
                {pillarData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {pillarData.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
              <span style={{ fontSize: 10, color: C.textDim }}>{p.name}: {p.fullName}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Cluster completion */}
      <Section title="CLUSTER COMPLETION">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {clusterData.map(c => (
            <div key={c.name} style={{
              display: 'grid', gridTemplateColumns: '160px 1fr 40px',
              gap: 10, alignItems: 'center',
            }}>
              <div style={{ fontSize: 11, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.fullName}
              </div>
              <div style={{ height: 8, background: C.surface2, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${c.pct}%`,
                  background: c.pct === 100 ? C.pos : C.brand,
                  borderRadius: 4, transition: 'width 600ms ease',
                }} />
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: c.pct === 100 ? C.pos : C.text,
                fontFamily: "'JetBrains Mono', monospace", textAlign: 'right',
              }}>{c.pct}%</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Persona distribution */}
      <Section title="EPISODES BY PERSONA">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={personaData} dataKey="value"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={2}
                >
                  {personaData.map((p, i) => (
                    <Cell key={i} fill={p.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {personaData.map(p => (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                <div style={{ fontSize: 12, color: C.text, width: 160 }}>{p.name}</div>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: p.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{p.value}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>
                  ({Math.round((p.value/totalEps)*100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Competitor baseline */}
      {perf && perf.competitor_baseline && (
        <Section title="COMPETITOR BASELINE">
          <div style={{
            background: C.surface2, border: `1px solid ${C.border}`,
            borderRadius: 10, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Handle', 'Platform', 'Followers', 'Note'].map(h => (
                    <th key={h} style={{
                      padding: '8px 14px', textAlign: 'left',
                      fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: '0.5px',
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
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: isUs ? 700 : 500, color: isUs ? C.brand : C.text }}>
                        {a.handle} {isUs && <span style={{ fontSize: 10 }}>← you</span>}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: C.textDim }}>{a.platform}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>
                        {a.followers != null ? a.followers.toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 10, color: C.textFaint }}>{a.note}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 8 }}>
            Baseline: {perf.competitor_baseline.updated} · Run /re content research to refresh
          </div>
        </Section>
      )}

      {/* Milestones */}
      {perf && perf.milestones && (
        <Section title="MILESTONES">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {perf.milestones.map((m, i) => (
              <div key={i} style={{
                background: C.surface2, border: `1px solid ${m.reached ? C.pos : C.border}`,
                borderRadius: 8, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: m.reached ? 1 : 0.7,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: m.reached ? C.pos : C.surface3,
                  border: `1px solid ${m.reached ? C.pos : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 10,
                }}>{m.reached ? '✓' : ''}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: m.reached ? 600 : 400, color: m.reached ? C.pos : C.textDim }}>
                    {m.label}
                  </div>
                  {m.date && <div style={{ fontSize: 9, color: C.textFaint, marginTop: 2 }}>{m.date}</div>}
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
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 3, height: 14, background: C.brand, borderRadius: 2 }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: '0.8px' }}>{title}</div>
      </div>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '10px 14px',
    }}>
      {label && <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.fill || p.color }} />
          <span style={{ fontSize: 12, color: C.textDim }}>{p.name || p.dataKey}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}
