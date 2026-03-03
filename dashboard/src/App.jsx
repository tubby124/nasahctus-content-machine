import { useState, useEffect, useCallback } from 'react'
import Home from './views/Home.jsx'
import Pipeline from './views/Pipeline.jsx'
import Calendar from './views/Calendar.jsx'
import Episodes from './views/Episodes.jsx'
import Stats from './views/Stats.jsx'

// ─── Design System ──────────────────────────────────────────────────────────
export const C = {
  bg:           '#08090e',
  surface:      '#0f1117',
  surface2:     '#161921',
  surface3:     '#1c2235',
  border:       '#1c2030',
  borderBright: '#2a3050',

  brand:     '#6470ff',
  brandDim:  'rgba(100,112,255,0.1)',
  brandGlow: 'rgba(100,112,255,0.2)',

  // Status colors
  idea:      '#3d4a6b',
  scripted:  '#7c6af7',
  filmed:    '#e8963a',
  edited:    '#3b9eff',
  posted:    '#10d98e',

  ideaDim:     'rgba(61,74,107,0.15)',
  scriptedDim: 'rgba(124,106,247,0.15)',
  filmedDim:   'rgba(232,150,58,0.15)',
  editedDim:   'rgba(59,158,255,0.15)',
  postedDim:   'rgba(16,217,142,0.15)',

  text:      '#e4e8f0',
  textDim:   '#6b7a99',
  textFaint: '#3d4a6b',

  neg:  '#ff5757',
  warn: '#f7a45a',
  pos:  '#10d98e',

  // Pillar colors (8)
  pillars: [
    '#6470ff', '#10d98e', '#f7a45a', '#e85a5a',
    '#a78bfa', '#34d399', '#fb923c', '#60a5fa'
  ],

  // Persona colors
  personas: {
    'ontario-transplant': '#6470ff',
    'saskatoon-local':    '#10d98e',
    'first-time-buyer':   '#f7a45a',
    'calgary-investor':   '#e85a5a',
    'all':                '#6b7a99',
  }
}

// ─── Data Source ─────────────────────────────────────────────────────────────
const RAW_URL = 'https://raw.githubusercontent.com/tubby124/nasahctus-content-machine/main/data/episodes.json'
const PERF_URL = 'https://raw.githubusercontent.com/tubby124/nasahctus-content-machine/main/data/performance.json'

const VIEWS = [
  { id: 'home',     label: 'Home',     icon: HomeIcon     },
  { id: 'pipeline', label: 'Pipeline', icon: PipelineIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'episodes', label: 'Episodes', icon: EpisodesIcon },
  { id: 'stats',    label: 'Stats',    icon: StatsIcon    },
]

export default function App() {
  const [view, setView] = useState('home')
  const [data, setData] = useState(null)
  const [perf, setPerf] = useState(null)
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setSyncing(true)
    try {
      const [epRes, pfRes] = await Promise.all([
        fetch(`${RAW_URL}?t=${Date.now()}`),
        fetch(`${PERF_URL}?t=${Date.now()}`),
      ])
      if (!epRes.ok) throw new Error(`Episodes fetch failed: ${epRes.status}`)
      const epJson = await epRes.json()
      const pfJson = pfRes.ok ? await pfRes.json() : null
      setData(epJson)
      setPerf(pfJson)
      setLastSync(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchData(true)
    const interval = setInterval(() => fetchData(), 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg }}>
      {/* Desktop sidebar */}
      <Sidebar view={view} setView={setView} lastSync={lastSync} syncing={syncing} onRefresh={() => fetchData(true)} />

      {/* Main content */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 0,
      }}>
        {/* Top bar (mobile only) */}
        <MobileHeader lastSync={lastSync} syncing={syncing} onRefresh={() => fetchData(true)} />

        {/* View content */}
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 'calc(60px + env(safe-area-inset-bottom))' }}>
          {!data && !error && <LoadingScreen />}
          {error && <ErrorScreen error={error} onRetry={() => fetchData(true)} />}
          {data && view === 'home'     && <Home data={data} perf={perf} setView={setView} />}
          {data && view === 'pipeline' && <Pipeline data={data} />}
          {data && view === 'calendar' && <Calendar data={data} />}
          {data && view === 'episodes' && <Episodes data={data} />}
          {data && view === 'stats'    && <Stats data={data} perf={perf} />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav view={view} setView={setView} />
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ view, setView, lastSync, syncing, onRefresh }) {
  return (
    <div style={{
      width: 220,
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      '@media (max-width: 767px)': { display: 'none' },
    }} className="desktop-sidebar">
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: C.brandGlow,
            border: `1px solid ${C.brand}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: C.brand, letterSpacing: '-0.5px'
          }}>N</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>@nasahctus</div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>Content Machine</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {VIEWS.map(v => {
          const active = view === v.id
          const Icon = v.icon
          return (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: active ? C.brandDim : 'transparent',
              color: active ? C.brand : C.textDim,
              fontSize: 13, fontWeight: active ? 600 : 400,
              marginBottom: 2, transition: 'all 200ms ease',
              textAlign: 'left',
            }}>
              <Icon size={16} color={active ? C.brand : C.textDim} />
              {v.label}
            </button>
          )
        })}
      </nav>

      {/* Sync status */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: C.textDim }}>
            {lastSync ? `Synced ${timeSince(lastSync)}` : 'Syncing...'}
          </div>
          <button onClick={onRefresh} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: syncing ? C.brand : C.textDim, fontSize: 14, padding: 2,
            transition: 'color 200ms',
            animation: syncing ? 'spin 1s linear infinite' : 'none',
          }}>↻</button>
        </div>
        <div style={{ fontSize: 10, color: C.textFaint, marginTop: 3 }}>Auto-refresh: 60s</div>
      </div>

      <style>{`
        @media (max-width: 767px) { .desktop-sidebar { display: none !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ─── Mobile Header ────────────────────────────────────────────────────────────
function MobileHeader({ lastSync, syncing, onRefresh }) {
  return (
    <div className="mobile-header" style={{
      display: 'none',
      padding: '14px 16px 10px',
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: C.brandGlow, border: `1px solid ${C.brand}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: C.brand,
          }}>N</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@nasahctus</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: C.textDim }}>
            {lastSync ? timeSince(lastSync) : '—'}
          </span>
          <button onClick={onRefresh} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: syncing ? C.brand : C.textDim, fontSize: 16, padding: 4,
            animation: syncing ? 'spin 1s linear infinite' : 'none',
          }}>↻</button>
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) { .mobile-header { display: flex !important; } }
      `}</style>
    </div>
  )
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ view, setView }) {
  return (
    <div className="bottom-nav" style={{
      display: 'none',
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', height: 60 }}>
        {VIEWS.map(v => {
          const active = view === v.id
          const Icon = v.icon
          return (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? C.brand : C.textDim,
              minHeight: 44,
            }}>
              <Icon size={18} color={active ? C.brand : C.textDim} />
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, letterSpacing: '0.3px' }}>
                {v.label}
              </span>
            </button>
          )
        })}
      </div>
      <style>{`
        @media (max-width: 767px) { .bottom-nav { display: block !important; } }
      `}</style>
    </div>
  )
}

// ─── Loading / Error ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: `2px solid ${C.border}`, borderTopColor: C.brand, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: C.textDim, fontSize: 13 }}>Loading pipeline data...</div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <div style={{ color: C.text, fontWeight: 600, fontSize: 15 }}>Failed to load data</div>
      <div style={{ color: C.textDim, fontSize: 12, textAlign: 'center', maxWidth: 280 }}>{error}</div>
      <button onClick={onRetry} style={{
        marginTop: 8, padding: '8px 20px', background: C.brandDim,
        border: `1px solid ${C.brand}`, borderRadius: 8,
        color: C.brand, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}>Retry</button>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function HomeIcon({ size = 16, color }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 18v-6h6v6" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
}
function PipelineIcon({ size = 16, color }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="4" height="14" rx="1" stroke={color} strokeWidth="1.5"/>
    <rect x="8" y="5" width="4" height="12" rx="1" stroke={color} strokeWidth="1.5"/>
    <rect x="14" y="7" width="4" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
  </svg>
}
function CalendarIcon({ size = 16, color }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke={color} strokeWidth="1.5"/>
    <path d="M2 8h16" stroke={color} strokeWidth="1.5"/>
    <path d="M6 2v4M14 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7" cy="12" r="1" fill={color}/>
    <circle cx="10" cy="12" r="1" fill={color}/>
    <circle cx="13" cy="12" r="1" fill={color}/>
  </svg>
}
function EpisodesIcon({ size = 16, color }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M4 5h12M4 9h9M4 13h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
}
function StatsIcon({ size = 16, color }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M3 14l4-5 4 3 4-7 3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function timeSince(date) {
  const secs = Math.floor((new Date() - date) / 1000)
  if (secs < 10) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export function statusColor(status) {
  const map = {
    IDEA: C.idea, SCRIPTED: C.scripted, FILMED: C.filmed, EDITED: C.edited, POSTED: C.posted
  }
  return map[status] || C.textDim
}

export function statusDim(status) {
  const map = {
    IDEA: C.ideaDim, SCRIPTED: C.scriptedDim, FILMED: C.filmedDim, EDITED: C.editedDim, POSTED: C.postedDim
  }
  return map[status] || 'transparent'
}

export function pillarColor(pillar) {
  return C.pillars[(pillar - 1) % C.pillars.length]
}

export function personaColor(persona) {
  return C.personas[persona] || C.textDim
}

export function personaLabel(persona) {
  const map = {
    'ontario-transplant': 'Ontario Transplant',
    'saskatoon-local': 'Saskatoon Local',
    'first-time-buyer': 'First-Time Buyer',
    'calgary-investor': 'Calgary Investor',
    'all': 'All'
  }
  return map[persona] || persona
}
