import { useState, useEffect, useCallback } from 'react'
import { C, timeSince } from './theme.js'
import episodesSeed from './data/episodes.json'
import perfSeed from './data/performance.json'
import Home from './views/Home.jsx'
import Pipeline from './views/Pipeline.jsx'
import Calendar from './views/Calendar.jsx'
import Episodes from './views/Episodes.jsx'
import Stats from './views/Stats.jsx'
import Publish from './views/Publish.jsx'

// ── Supabase config
const SB_URL         = import.meta.env.VITE_SUPABASE_URL
const SB_KEY         = import.meta.env.VITE_SUPABASE_ANON_KEY
const SB_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY

// ── Global CSS
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { background: ${C.bg}; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
  #root { height: 100%; }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 2px; }

  @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadein  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes orb1    { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.08); } }
  @keyframes orb2    { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,-20px) scale(1.05); } }

  .glass {
    background: ${C.glass};
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid ${C.border};
    box-shadow: ${C.shadow};
  }
  .glass-hover {
    transition: background 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
    cursor: pointer;
  }
  .glass-hover:hover {
    background: ${C.glassMd};
    border-color: ${C.borderBright};
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 30px rgba(0,0,0,0.45);
  }
  .glass-hover:active {
    transform: translateY(0);
  }
  .gradient-text {
    background: ${C.brandGrad};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .brand-glow {
    box-shadow: 0 0 0 1px rgba(124,109,255,0.25), 0 0 24px rgba(124,109,255,0.2);
  }
  .fade-in {
    animation: fadein 300ms ease both;
  }

  /* Sidebar — desktop */
  .sidebar { display: flex; flex-direction: column; }
  .mobile-hdr { display: none; }
  .bottom-nav { display: none; }

  @media (max-width: 767px) {
    .sidebar    { display: none !important; }
    .mobile-hdr { display: flex !important; }
    .bottom-nav { display: block !important; }
  }

  /* Status badge pulse dot */
  .pulse-dot {
    animation: pulse 2s ease infinite;
  }

  /* Nav item active indicator */
  .nav-indicator {
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`

const VIEWS = [
  { id: 'home',     label: 'Home',     Icon: HomeIcon     },
  { id: 'pipeline', label: 'Pipeline', Icon: PipelineIcon },
  { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
  { id: 'episodes', label: 'Episodes', Icon: EpisodesIcon },
  { id: 'stats',    label: 'Stats',    Icon: StatsIcon    },
  { id: 'publish',  label: 'Publish',  Icon: PublishIcon  },
]

// ── Supabase write helpers (service role bypasses RLS)
function sbWriteHeaders() {
  const key = SB_SERVICE_KEY || SB_KEY
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  }
}

async function supabaseUpdate(id, patch) {
  if (!SB_URL) return false
  const res = await fetch(`${SB_URL}/rest/v1/episodes?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: sbWriteHeaders(),
    body: JSON.stringify(patch),
  })
  return res.ok
}

async function supabaseInsert(row) {
  if (!SB_URL) return null
  const headers = { ...sbWriteHeaders(), Prefer: 'return=representation' }
  const res = await fetch(`${SB_URL}/rest/v1/episodes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(row),
  })
  if (res.ok) return res.json()
  return null
}

export default function App() {
  const [view,     setView]     = useState('home')
  const [data,     setData]     = useState(episodesSeed)
  const [perf,     setPerf]     = useState(perfSeed)
  const [lastSync, setLastSync] = useState(null)
  const [syncing,  setSyncing]  = useState(false)
  const [syncErr,  setSyncErr]  = useState(null)
  const [isLive,   setIsLive]   = useState(false)

  const refresh = useCallback(async () => {
    setSyncing(true)
    setSyncErr(null)
    try {
      if (SB_URL && SB_KEY) {
        const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
        const [epRes, clRes] = await Promise.all([
          fetch(`${SB_URL}/rest/v1/episodes?select=*&order=id`, { headers }),
          fetch(`${SB_URL}/rest/v1/clusters?select=*&order=id`, { headers }),
        ])
        if (epRes.ok && clRes.ok) {
          const episodes = await epRes.json()
          const clusters = await clRes.json()
          setData(d => ({ ...d, episodes, clusters }))
          setLastSync(new Date())
          setIsLive(true)
        }
      } else {
        const res = await fetch(`/data/episodes.json?v=${Date.now()}`)
        if (res.ok) {
          const fresh = await res.json()
          setData(fresh)
          setLastSync(new Date())
        }
      }
    } catch (e) {
      setSyncErr(e.message)
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [refresh])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* ── Ambient orbs — fixed behind everything */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -200, left: -150,
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,109,255,0.13) 0%, transparent 70%)',
          animation: 'orb1 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: -250, right: -200,
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,217,142,0.08) 0%, transparent 70%)',
          animation: 'orb2 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
          animation: 'orb1 28s ease-in-out infinite reverse',
        }} />
      </div>

      {/* ── App shell */}
      <div style={{ display: 'flex', height: '100dvh', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {/* ── Sidebar — desktop */}
        <div className="sidebar" style={{
          width: 228, flexShrink: 0,
          background: 'rgba(5,6,15,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Logo area */}
          <div style={{ padding: '22px 18px 18px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #a78bfa, #7c6dff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900, color: '#fff',
                boxShadow: '0 0 0 1px rgba(167,139,250,0.3), 0 4px 16px rgba(124,109,255,0.35)',
              }}>N</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '-0.2px' }}>@nasahctus</div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>Content Machine</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
            {VIEWS.map(({ id, label, Icon }) => {
              const active = view === id
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: active ? 'rgba(124,109,255,0.14)' : 'transparent',
                    color: active ? C.brand : C.textDim,
                    fontSize: 13, fontWeight: active ? 600 : 450,
                    marginBottom: 2, textAlign: 'left',
                    transition: 'all 150ms ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.textSub } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textDim } }}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 18, borderRadius: 2,
                      background: C.brand,
                      boxShadow: `0 0 8px ${C.brand}`,
                    }} />
                  )}
                  <Icon size={15} color={active ? C.brand : 'currentColor'} />
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid ${C.border}`,
            fontSize: 11,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: C.textDim, fontSize: 10 }}>
                {lastSync ? `Synced ${timeSince(lastSync)}` : 'Loading…'}
              </span>
              <button
                onClick={refresh}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: syncing ? C.brand : C.textDim,
                  fontSize: 15, padding: '2px 4px',
                  display: 'flex', alignItems: 'center',
                  animation: syncing ? 'spin 0.8s linear infinite' : 'none',
                  borderRadius: 4, transition: 'color 200ms',
                }}
              >↻</button>
            </div>
            {isLive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                <div className="pulse-dot" style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: C.pos,
                  boxShadow: `0 0 6px ${C.pos}`,
                }} />
                <span style={{ color: C.pos, fontSize: 10, fontWeight: 500 }}>Supabase live</span>
              </div>
            )}
            {syncErr && (
              <div style={{ color: C.neg, fontSize: 10, marginTop: 4 }}>Sync error</div>
            )}
          </div>
        </div>

        {/* ── Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', position: 'relative' }}>

          {/* Mobile header */}
          <div className="mobile-hdr" style={{
            padding: '11px 16px',
            borderBottom: `1px solid ${C.border}`,
            background: 'rgba(5,6,15,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #a78bfa, #7c6dff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, color: '#fff',
              }}>N</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>@nasahctus</div>
                <div style={{ fontSize: 9, color: C.textDim }}>
                  {VIEWS.find(v => v.id === view)?.label}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isLive && (
                <div className="pulse-dot" style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: C.pos, boxShadow: `0 0 6px ${C.pos}`,
                }} />
              )}
              {syncErr && <span style={{ fontSize: 10, color: C.neg }}>!</span>}
              <button
                onClick={refresh}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: syncing ? C.brand : C.textDim,
                  fontSize: 18, padding: 4,
                  display: 'flex', alignItems: 'center',
                  animation: syncing ? 'spin 0.8s linear infinite' : 'none',
                }}
              >↻</button>
            </div>
          </div>

          {/* View */}
          <div style={{
            flex: 1, overflow: 'auto',
            paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
          }}>
            <div key={view} className="fade-in">
              {view === 'home'     && <Home     data={data} perf={perf} setView={setView} />}
              {view === 'pipeline' && <Pipeline data={data} />}
              {view === 'calendar' && <Calendar data={data} />}
              {view === 'episodes' && <Episodes data={data} onUpdate={supabaseUpdate} onInsert={supabaseInsert} refresh={refresh} isLive={isLive} />}
              {view === 'stats'    && <Stats    data={data} perf={perf} />}
              {view === 'publish'  && <Publish  data={data} isLive={isLive} onUpdate={supabaseUpdate} />}
            </div>
          </div>
        </div>

        {/* ── Bottom nav — mobile */}
        <div className="bottom-nav" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(5,6,15,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: `1px solid ${C.border}`,
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', height: 58 }}>
            {VIEWS.map(({ id, label, Icon }) => {
              const active = view === id
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 3,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: active ? C.brand : C.textDim,
                    minHeight: 44, transition: 'color 150ms',
                    position: 'relative',
                  }}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      width: 24, height: 2, borderRadius: 1,
                      background: C.brand,
                      boxShadow: `0 0 6px ${C.brand}`,
                    }} />
                  )}
                  <Icon size={18} color={active ? C.brand : 'currentColor'} />
                  <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, letterSpacing: '0.2px' }}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Icon components
function HomeIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 18v-6h6v6" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
function PipelineIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="4" height="14" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <rect x="8" y="6" width="4" height="11" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <rect x="14" y="8" width="4" height="9" rx="1.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  )
}
function CalendarIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M2 8h16M6 2v4M14 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7" cy="12" r="1" fill={color}/>
      <circle cx="10" cy="12" r="1" fill={color}/>
      <circle cx="13" cy="12" r="1" fill={color}/>
    </svg>
  )
}
function EpisodesIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 5h12M4 9h9M4 13h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function StatsIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 14l4-5 4 3 4-7 3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function PublishIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 13V4M10 4L7 7M10 4l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
