import { useState } from 'react'
import { C } from '../theme.js'
import StatusBadge from './StatusBadge.jsx'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'tiktok',   label: 'TikTok',    emoji: '🎵' },
  { id: 'youtube',  label: 'YouTube',   emoji: '▶' },
  { id: 'threads',  label: 'Threads',   emoji: '🧵' },
]

const BLOTATO_KEY = import.meta.env.VITE_BLOTATO_KEY

export default function BlotatoModal({ episode, onClose }) {
  const [platforms, setPlatforms] = useState(['instagram', 'tiktok'])
  const [caption, setCaption] = useState('')
  const [scheduleTime, setScheduleTime] = useState(nextSlot())
  const [posting, setPosting] = useState(false)
  const [result, setResult] = useState(null)

  const hasKey = !!BLOTATO_KEY

  function togglePlatform(id) {
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  async function schedulePost() {
    if (!hasKey || !platforms.length) return
    setPosting(true)
    try {
      // Schedule to each platform
      const results = await Promise.allSettled(
        platforms.map(platform =>
          fetch('https://backend.blotato.com/v2/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'blotato-api-key': BLOTATO_KEY,
            },
            body: JSON.stringify({
              post: {
                content: { text: caption, platform },
                target: { targetType: platform },
                scheduledTime: new Date(scheduleTime).toISOString(),
              }
            })
          }).then(r => r.json())
        )
      )
      setResult({ success: results.filter(r => r.status === 'fulfilled').length, total: platforms.length })
    } catch (e) {
      setResult({ error: e.message })
    } finally {
      setPosting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(8,9,14,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: C.surface, borderRadius: '20px 20px 0 0',
        border: `1px solid ${C.border}`, borderBottom: 'none',
        width: '100%', maxWidth: 520,
        padding: '24px 24px calc(24px + env(safe-area-inset-bottom))',
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Schedule Post</div>
            <div style={{ fontSize: 12, color: C.textDim }}>{episode.id} — {episode.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: 20, padding: 4 }}>×</button>
        </div>

        {/* API key warning */}
        {!hasKey && (
          <div style={{
            background: `${C.warn}15`, border: `1px solid ${C.warn}40`,
            borderRadius: 10, padding: '12px 14px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.warn, marginBottom: 4 }}>Blotato API key not configured</div>
            <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>
              Add <code style={{ background: C.surface2, padding: '1px 5px', borderRadius: 3, fontFamily: "'JetBrains Mono', monospace" }}>VITE_BLOTATO_KEY</code> to your Vercel environment variables to enable scheduling.
            </div>
          </div>
        )}

        {result ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {result.error ? (
              <div style={{ color: C.neg, fontSize: 14 }}>Error: {result.error}</div>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.pos }}>Scheduled to {result.success}/{result.total} platforms</div>
                <button onClick={onClose} style={{
                  marginTop: 16, padding: '8px 24px', background: C.brandDim,
                  border: `1px solid ${C.brand}`, borderRadius: 8,
                  color: C.brand, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Done</button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Platforms */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: 'block', marginBottom: 8, letterSpacing: '0.5px' }}>PLATFORMS</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PLATFORMS.map(p => {
                  const on = platforms.includes(p.id)
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                      padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                      background: on ? C.brandDim : C.surface2,
                      border: `1px solid ${on ? C.brand : C.border}`,
                      color: on ? C.brand : C.textDim,
                      fontSize: 12, fontWeight: on ? 600 : 400,
                      transition: 'all 150ms',
                    }}>{p.emoji} {p.label}</button>
                  )
                })}
              </div>
            </div>

            {/* Caption */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: 'block', marginBottom: 8, letterSpacing: '0.5px' }}>CAPTION</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write your caption here..."
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: 8, color: C.text, fontSize: 13,
                  fontFamily: "'Outfit', sans-serif", resize: 'vertical',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>
                {caption.length}/2200 · Platform limits may vary
              </div>
            </div>

            {/* Schedule time */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: 'block', marginBottom: 8, letterSpacing: '0.5px' }}>SCHEDULE TIME (MST)</label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                style={{
                  padding: '9px 12px', background: C.surface2,
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  color: C.text, fontSize: 13, outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Optimal: Mon/Wed/Fri 9AM MST</div>
            </div>

            {/* Post button */}
            <button
              onClick={schedulePost}
              disabled={!hasKey || posting || !platforms.length}
              style={{
                width: '100%', padding: '13px',
                background: hasKey ? C.brand : C.surface2,
                border: 'none', borderRadius: 10,
                color: hasKey ? '#fff' : C.textDim,
                fontSize: 14, fontWeight: 700, cursor: hasKey ? 'pointer' : 'not-allowed',
                transition: 'all 200ms', opacity: posting ? 0.7 : 1,
              }}
            >
              {posting ? 'Scheduling...' : hasKey ? `Schedule to ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}` : 'Configure API key to enable'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function nextSlot() {
  const now = new Date()
  const mst = new Date(now.getTime() - 7 * 60 * 60 * 1000)
  const day = mst.getDay()
  // Next Mon/Wed/Fri at 9AM
  const targets = [1, 3, 5]
  let daysAhead = 0
  for (let i = 0; i <= 7; i++) {
    const d = (day + i) % 7
    if (targets.includes(d)) { daysAhead = i; break }
  }
  const target = new Date(mst)
  target.setDate(target.getDate() + daysAhead)
  target.setHours(9, 0, 0, 0)
  return target.toISOString().slice(0, 16)
}
