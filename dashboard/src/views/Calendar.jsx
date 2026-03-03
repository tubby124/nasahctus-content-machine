import { useState } from 'react'
import { C, statusColor, pillarColor } from '../App.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const POSTING_DAYS = [1, 3, 5] // Mon, Wed, Fri

export default function Calendar({ data }) {
  const eps = data.episodes || []
  const [weekOffset, setWeekOffset] = useState(0)

  // Get the week starting from most recent Monday
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + daysToMonday + weekOffset * 7)
  weekStart.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  // Map posted episodes to dates
  const postedByDate = {}
  eps.filter(e => e.posted_date).forEach(e => {
    const key = e.posted_date
    if (!postedByDate[key]) postedByDate[key] = []
    postedByDate[key].push(e)
  })

  const isToday = (d) => {
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  }

  const isPostingDay = (d) => POSTING_DAYS.includes(d.getDay())
  const isPast = (d) => d < today && !isToday(d)

  const dateKey = (d) => d.toISOString().slice(0, 10)

  const readyEps = eps.filter(e => e.status === 'EDITED')

  // Assign ready episodes to upcoming posting slots
  const upcomingSlots = []
  let readyIdx = 0
  for (const day of days) {
    if (isPostingDay(day) && !isPast(day) && readyIdx < readyEps.length) {
      upcomingSlots.push({ date: dateKey(day), ep: readyEps[readyIdx++] })
    }
  }

  const weekLabel = () => {
    if (weekOffset === 0) return 'This Week'
    if (weekOffset === 1) return 'Next Week'
    if (weekOffset === -1) return 'Last Week'
    const start = days[0].toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    const end = days[6].toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    return `${start} – ${end}`
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={navBtn}>← Prev</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{weekLabel()}</div>
          <div style={{ fontSize: 11, color: C.textDim }}>
            {days[0].toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} style={navBtn}>Next →</button>
      </div>

      {/* Posting schedule legend */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20,
        padding: '10px 14px', background: C.surface, borderRadius: 10,
        border: `1px solid ${C.border}`, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>Posting schedule:</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Mon', 'Wed', 'Fri'].map(d => (
            <span key={d} style={{
              fontSize: 10, color: C.brand, background: C.brandDim,
              padding: '2px 8px', borderRadius: 6, fontWeight: 600,
            }}>{d} 9AM MST</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.textDim, marginLeft: 'auto' }}>
          15-min stagger IG → TikTok
        </div>
      </div>

      {/* Day grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {days.map((day, i) => {
          const key = dateKey(day)
          const posted = postedByDate[key] || []
          const upcoming = upcomingSlots.find(s => s.date === key)
          const isActive = isToday(day)
          const posting = isPostingDay(day)
          const past = isPast(day)

          return (
            <div key={i} style={{
              background: isActive ? C.surface2 : C.surface,
              border: `1px solid ${isActive ? C.brand : C.border}`,
              borderRadius: 10, padding: '14px',
              opacity: past && !posted.length ? 0.5 : 1,
              position: 'relative',
            }}>
              {/* Posting day indicator */}
              {posting && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 0, height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 18px 18px 0',
                  borderColor: `transparent ${C.brand} transparent transparent`,
                  borderRadius: '0 10px 0 0',
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {/* Date */}
                <div style={{ minWidth: 44, textAlign: 'center' }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    color: isActive ? C.brand : posting ? C.text : C.textDim,
                    letterSpacing: '0.5px', marginBottom: 2,
                  }}>{DAYS[day.getDay()]}</div>
                  <div style={{
                    fontSize: 22, fontWeight: 800, lineHeight: 1,
                    color: isActive ? C.brand : C.text,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{day.getDate()}</div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  {posted.map(ep => (
                    <PostedSlot key={ep.id} ep={ep} />
                  ))}

                  {upcoming && !posted.length && (
                    <ScheduledSlot ep={upcoming.ep} />
                  )}

                  {!posted.length && !upcoming && posting && !past && (
                    <EmptySlot />
                  )}

                  {!posted.length && !upcoming && !posting && (
                    <div style={{ fontSize: 11, color: C.textFaint, paddingTop: 4 }}>Rest day</div>
                  )}

                  {past && !posted.length && posting && (
                    <div style={{ fontSize: 11, color: C.neg, paddingTop: 4 }}>Missed posting slot</div>
                  )}
                </div>

                {/* Today badge */}
                {isActive && (
                  <span style={{
                    fontSize: 9, color: C.brand, background: C.brandDim,
                    padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                    border: `1px solid ${C.brand}40`,
                  }}>TODAY</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Upcoming queue */}
      {readyEps.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: '0.8px', marginBottom: 12 }}>
            POSTING QUEUE ({readyEps.length} ready)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {readyEps.map((ep, i) => (
              <div key={ep.id} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: C.brandDim, border: `1px solid ${C.brand}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: C.brand, flexShrink: 0,
                }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</div>
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
      background: `${C.posted}12`, border: `1px solid ${C.posted}30`,
      borderRadius: 8, padding: '8px 12px', marginBottom: 4,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>✅</span>
      <div>
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ep.title}</div>
        {ep.plays != null && (
          <div style={{ fontSize: 10, color: C.pos, marginTop: 2 }}>{ep.plays.toLocaleString()} plays</div>
        )}
      </div>
    </div>
  )
}

function ScheduledSlot({ ep }) {
  return (
    <div style={{
      background: C.editedDim, border: `1px dashed ${C.edited}50`,
      borderRadius: 8, padding: '8px 12px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>🎬</span>
      <div>
        <div style={{ fontSize: 10, color: C.edited, fontWeight: 600, marginBottom: 2 }}>NEXT UP</div>
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ep.id}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ep.title}</div>
      </div>
    </div>
  )
}

function EmptySlot() {
  return (
    <div style={{
      border: `1px dashed ${C.border}`,
      borderRadius: 8, padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 12, color: C.textFaint }}>+</span>
      <span style={{ fontSize: 11, color: C.textFaint }}>Available posting slot</span>
    </div>
  )
}

const navBtn = {
  background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: '6px 14px',
  color: C.textDim, fontSize: 12, cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
}

// Export C.editedDim for use in this file
const C_editedDim = 'rgba(59,158,255,0.1)'
