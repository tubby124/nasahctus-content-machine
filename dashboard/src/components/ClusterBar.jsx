import { C, pillarColor } from '../App.jsx'

export default function ClusterBar({ cluster, episodes }) {
  const total = cluster.episodes_total
  const posted = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'POSTED').length
  const edited = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'EDITED').length
  const filmed = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'FILMED').length
  const scripted = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'SCRIPTED').length
  const pct = total > 0 ? Math.round((posted / total) * 100) : 0
  const pc = pillarColor(cluster.pillar)

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{cluster.name}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: pc, background: `${pc}18`, padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>P{cluster.pillar}</span>
            {cluster.priority === 'high' && <span style={{ fontSize: 9, color: C.neg, fontWeight: 600 }}>● PRIORITY</span>}
            {cluster.lyra_needed && <span style={{ fontSize: 9, color: C.warn }}>Lyra pending</span>}
          </div>
        </div>
        <div style={{
          fontSize: 18, fontWeight: 800, color: pct === 100 ? C.pos : C.text,
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
        }}>{pct}<span style={{ fontSize: 10, fontWeight: 500, color: C.textDim }}>%</span></div>
      </div>

      {/* Progress bar — stacked */}
      <div style={{ height: 6, borderRadius: 3, background: C.surface2, overflow: 'hidden', display: 'flex' }}>
        {posted > 0    && <div style={{ width: `${(posted/total)*100}%`,   background: C.posted,   transition: 'width 400ms ease' }} />}
        {edited > 0    && <div style={{ width: `${(edited/total)*100}%`,   background: C.edited,   transition: 'width 400ms ease' }} />}
        {filmed > 0    && <div style={{ width: `${(filmed/total)*100}%`,   background: C.filmed,   transition: 'width 400ms ease' }} />}
        {scripted > 0  && <div style={{ width: `${(scripted/total)*100}%`, background: C.scripted, transition: 'width 400ms ease' }} />}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Dot color={C.posted}   label={`${posted} posted`} />
        {edited > 0   && <Dot color={C.edited}   label={`${edited} ready`} />}
        {filmed > 0   && <Dot color={C.filmed}   label={`${filmed} filmed`} />}
        {scripted > 0 && <Dot color={C.scripted} label={`${scripted} scripted`} />}
        <Dot color={C.idea} label={`${total - posted - edited - filmed - scripted} ideas`} />
      </div>
    </div>
  )
}

function Dot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 9, color: C.textDim }}>{label}</span>
    </div>
  )
}
