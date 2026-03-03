import { useState } from 'react'
import { C, statusColor } from '../theme.js'
import StatusBadge from '../components/StatusBadge.jsx'

const DAY_NAMES  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const POSTING_DAYS = [1, 3, 5] // Mon, Wed, Fri

export default function Calendar({ data }) {
  const eps = data.episodes || []
  const [weekOffset, setWeekOffset] = useState(0)

  const today       = new Date()
  const dayOfWeek   = today.getDay()
  const daysToMon   = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart   = new Date(today)
  weekStart.setDate(today.getDate() + daysToMon + weekOffset * 7)
  weekStart.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const postedByDate = {}
  eps.filter(e => e.posted_date).forEach(e => {
    if (!postedByDate[e.posted_date]) postedByDate[e.posted_date] = []
    postedByDate[e.posted_date].push(e)
  })

  const isToday   = d => d.toDateString() === (new Date()).toDateString()
  const isPast    = d => d < today && !isToday(d)
  const isPostDay = d => POSTING_DAYS.includes(d.getDay())
  const dateKey   = d => d.toISOString().slice(0, 10)

  const readyEps = eps.filter(e => e.status === 'EDITED')

  const upcoming = {}
  let idx = 0
  for (const day of days) {
    if (isPostDay(day) && !isPast(day) && idx < readyEps.length) {
      upcoming[dateKey(day)] = readyEps[idx++]
    }
  }

  const weekLabel = () => {
    if (weekOffset === 0) return 'This Week'
    if (weekOffset === 1) return 'Next Week'
    if (weekOffset === -1) return 'Last Week'
    const s = days[0].toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    const e = days[6].toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    return `${s} – ${e}`
  }

  return (
    <div style={{ padding: '22px 20px 40px', maxWidth: 780, margin: '0 auto' }}>

      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <NavBtn onClick={() => setWeekOffset(w => w - 1)}>← Prev</NavBtn>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', marginBottom: 3 }}>
            {weekLabel()}
          </div>
          <div style={{ fontSize: 11, color: C.textDim }}>
            {days[0].toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <NavBtn onClick={() => setWeekOffset(w => w + 1)}>Next →</NavBtn>
      </div>

      {/* Schedule info */}
      <div className="glass" style={{ borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>Schedule:</span>
        <div style={{ display: 'flex', gap: 7 }}>
          {['Mon', 'Wed', 'Fri'].map(d => (
            <span key={d} style={{
              fontSize: 10, color: C.brand, background: C.brandDim,
              border: '1px solid rgba(124,109,255,0.25)',
              padding: '3px 9px', borderRadius: 6, fontWeight: 600,
            }}>{d} 9AM</span>
          ))}
        </div>
        <span style={{ fontSize: 10, color: C.textDim, marginLeft: 'auto' }}>15-min stagger · IG → TikTok</span>
      </div>

      {/* Day grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {days.map((day, i) => {
          const key     = dateKey(day)
          const posted  = postedByDate[key] || []
          const queued  = upcoming[key]
          const active  = isToday(day)
          const postDay = isPostDay(day)
          const past    = isPast(day)

          return (
            <div key={i} style={{
              background: active ? 'rgba(124,109,255,0.08)' : past && !posted.length ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${active ? 'rgba(124,109,255,0.3)' : C.border}`,
              borderRadius: 12, padding: '14px 16px',
              opacity: past && !posted.length && !postDay ? 0.4 : 1,
              position: 'relative', overflow: 'hidden',
              boxShadow: active ? '0 0 0 1px rgba(124,109,255,0.1), 0 4px 20px rgba(124,109,255,0.08)' : C.shadowSm,
            }}>
              {postDay && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, rgba(124,109,255,${active ? 0.8 : 0.4}), transparent)`,
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* Date */}
                <div style={{ minWidth: 46, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: active ? C.brand : postDay ? C.textSub : C.textDim,
                    marginBottom: 3,
                  }}>{DAY_NAMES[day.getDay()]}</div>
                  <div style={{
                    fontSize: 24, fontWeight: 800, lineHeight: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: active ? C.brand : C.text,
                    textShadow: active ? `0 0 16px ${C.brand}50` : 'none',
                  }}>{day.getDate()}</div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {posted.map(ep => <PostedSlot key={ep.id} ep={ep} />)}
                  {queued && !posted.length && <QueuedSlot ep={queued} />}
                  {!posted.length && !queued && postDay && !past && <EmptySlot />}
                  {!posted.length && !queued && postDay && past && (
                    <div style={{ fontSize: 11, color: C.neg, paddingTop: 2 }}>✕ Missed slot</div>
                  )}
                  {!postDay && (
                    <div style={{ fontSize: 11, color: C.textFaint, paddingTop: 2 }}>Rest day</div>
                  )}
                </div>

                {active && (
                  <span style={{
                    fontSize: 9, color: C.brand, background: C.brandDim,
                    border: '1px solid rgba(124,109,255,0.3)',
                    padding: '3px 9px', borderRadius: 10, fontWeight: 700,
                    flexShrink: 0, letterSpacing: '0.5px',
                    boxShadow: '0 0 8px rgba(124,109,255,0.2)',
                  }}>TODAY</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Queue */}
      {readyEps.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: C.edited, boxShadow: `0 0 6px ${C.edited}` }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Posting Queue
            </div>
            <div style={{
              fontSize: 10, color: C.edited, background: C.editedDim,
              border: '1px solid rgba(59,158,255,0.22)',
              padding: '1px 8px', borderRadius: 10, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{readyEps.length} ready</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {readyEps.map((ep, i) => (
              <div key={ep.id} className="glass" style={{ borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(124,109,255,0.3), rgba(124,109,255,0.08))',
                  border: '1px solid rgba(124,109,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: C.brand,
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: '0 0 10px rgba(124,109,255,0.15)',
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ep.title}</div>
                </div>
                <StatusBadge status={ep.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PostedSlot({ ep }) {
  return (
    <div style={{
      background: 'rgba(16,217,142,0.06)', border: '1px solid rgba(16,217,142,0.18)',
      borderRadius: 9, padding: '9px 13px', marginBottom: 6,
      display: 'flex', alignItems: 'center', gap: 9,
    }}>
      <span style={{ fontSize: 14 }}>✅</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ep.title}</div>
        {ep.plays != null && <div style={{ fontSize: 10, color: C.pos, marginTop: 2 }}>{ep.plays.toLocaleString()} plays</div>}
      </div>
    </div>
  )
}

function QueuedSlot({ ep }) {
  return (
    <div style={{
      background: C.editedDim, border: '1px dashed rgba(59,158,255,0.35)',
      borderRadius: 9, padding: '9px 13px',
      display: 'flex', alignItems: 'center', gap: 9,
    }}>
      <span style={{ fontSize: 14 }}>🎬</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: C.edited, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Next Up</div>
        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ep.title}</div>
      </div>
    </div>
  )
}

function EmptySlot() {
  return (
    <div style={{ border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 9, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, opacity: 0.3 }}>+</span>
      <span style={{ fontSize: 11, color: C.textFaint }}>Available posting slot</span>
    </div>
  )
}

function NavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 9, padding: '7px 16px',
        color: C.textSub, fontSize: 12, cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontWeight: 500,
        transition: 'all 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = C.text }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.textSub }}
    >{children}</button>
  )
}
