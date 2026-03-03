import { C, pillarColor, priorityColor, priorityLabel } from '../theme.js'

export default function ClusterBar({ cluster, episodes }) {
  const total    = cluster.episodes_total || 0
  const posted   = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'POSTED').length
  const edited   = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'EDITED').length
  const filmed   = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'FILMED').length
  const scripted = episodes.filter(e => e.cluster_id === cluster.id && e.status === 'SCRIPTED').length
  const pct  = total > 0 ? Math.round((posted / total) * 100) : 0
  const pc   = pillarColor(cluster.pillar)
  const prC  = priorityColor(cluster.priority)

  return (
    <div className="glass glass-hover" style={{
      borderRadius: 12,
      padding: '14px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Pillar accent top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${pc}80, transparent)`,
        borderRadius: '12px 12px 0 0',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5, lineHeight: 1.3 }}>
            {cluster.name}
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
            {cluster.pillar > 0 && (
              <span style={{
                fontSize: 9, color: pc,
                background: `${pc}14`,
                border: `1px solid ${pc}25`,
                padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                letterSpacing: '0.3px',
              }}>P{cluster.pillar}</span>
            )}
            {cluster.priority && (
              <span style={{
                fontSize: 9, color: prC,
                background: `${prC}12`,
                border: `1px solid ${prC}22`,
                padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                letterSpacing: '0.3px',
              }}>{priorityLabel(cluster.priority)}</span>
            )}
            {cluster.lyra_needed && (
              <span style={{
                fontSize: 9, color: C.warn,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
                padding: '1px 6px', borderRadius: 4, fontWeight: 500,
              }}>Lyra {cluster.lyra_prompt}</span>
            )}
          </div>
        </div>
        <div style={{
          fontSize: 22, fontWeight: 800, lineHeight: 1, flexShrink: 0,
          color: pct === 100 ? C.pos : pct > 0 ? C.brand : C.textFaint,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {pct}<span style={{ fontSize: 10, fontWeight: 500, color: C.textDim, marginLeft: 1 }}>%</span>
        </div>
      </div>

      {/* Progress bar — stacked */}
      <div style={{
        height: 5, borderRadius: 3,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden', display: 'flex',
        marginBottom: 8,
      }}>
        {posted   > 0 && <div style={{ width: `${(posted/total)*100}%`,   background: C.posted,   transition: 'width 500ms ease' }} />}
        {edited   > 0 && <div style={{ width: `${(edited/total)*100}%`,   background: C.edited,   transition: 'width 500ms ease' }} />}
        {filmed   > 0 && <div style={{ width: `${(filmed/total)*100}%`,   background: C.filmed,   transition: 'width 500ms ease' }} />}
        {scripted > 0 && <div style={{ width: `${(scripted/total)*100}%`, background: C.scripted, transition: 'width 500ms ease' }} />}
      </div>

      {/* Counts */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Dot color={C.posted}   label={`${posted} posted`} />
        {edited   > 0 && <Dot color={C.edited}   label={`${edited} ready`} />}
        {filmed   > 0 && <Dot color={C.filmed}   label={`${filmed} filmed`} />}
        {scripted > 0 && <Dot color={C.scripted} label={`${scripted} scripted`} />}
        {(total - posted - edited - filmed - scripted) > 0 && (
          <Dot color={C.textFaint} label={`${total - posted - edited - filmed - scripted} ideas`} />
        )}
      </div>
    </div>
  )
}

function Dot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 10, color: C.textDim }}>{label}</span>
    </div>
  )
}
