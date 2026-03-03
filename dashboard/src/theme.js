// ─── Design System ────────────────────────────────────────────────────────────
// Imported by ALL components. Never imports from App.jsx.
// Dark glassmorphism theme — ambient gradient orbs, glass cards, micro-animations.

export const C = {
  // ── Backgrounds
  bg:       '#03040a',
  surface:  'rgba(255,255,255,0.032)',
  surface2: 'rgba(255,255,255,0.055)',
  surface3: 'rgba(255,255,255,0.08)',
  surfaceSolid:  '#0b0d16',
  surfaceSolid2: '#0f1220',

  // ── Borders
  border:       'rgba(255,255,255,0.07)',
  borderBright: 'rgba(255,255,255,0.14)',
  borderGlow:   'rgba(124,109,255,0.35)',

  // ── Brand
  brand:      '#7c6dff',
  brandLight: '#a78bfa',
  brandDark:  '#5b4de8',
  brandDim:   'rgba(124,109,255,0.12)',
  brandGlow:  'rgba(124,109,255,0.22)',
  brandGrad:  'linear-gradient(135deg, #a78bfa 0%, #7c6dff 50%, #60a5fa 100%)',

  // ── Status colors
  idea:     '#4a5568',
  scripted: '#8b74f7',
  filmed:   '#f59e0b',
  edited:   '#3b9eff',
  posted:   '#10d98e',

  // ── Status dims (glass version)
  ideaDim:     'rgba(74,85,104,0.12)',
  scriptedDim: 'rgba(139,116,247,0.12)',
  filmedDim:   'rgba(245,158,11,0.12)',
  editedDim:   'rgba(59,158,255,0.12)',
  postedDim:   'rgba(16,217,142,0.12)',

  // ── Status glows (hover/active)
  scriptedGlow: 'rgba(139,116,247,0.25)',
  filmedGlow:   'rgba(245,158,11,0.25)',
  editedGlow:   'rgba(59,158,255,0.25)',
  postedGlow:   'rgba(16,217,142,0.25)',

  // ── Text
  text:      '#e8ecf5',
  textSub:   '#a0aec0',
  textDim:   '#637089',
  textFaint: '#384057',

  // ── Semantic
  pos:  '#10d98e',
  warn: '#f59e0b',
  neg:  '#f56565',

  // ── Priority badges
  filmNow: '#f59e0b',
  launch:  '#7c6dff',
  evgreen: '#10d98e',

  // ── Pillar palette (8 pillars)
  pillars: [
    '#7c6dff', // P1 Neighbourhood
    '#10d98e', // P2 Then vs Now
    '#f59e0b', // P3 Migration
    '#f56565', // P4 Investment
    '#a78bfa', // P5 Market Pulse
    '#34d399', // P6 Real Deal
    '#60a5fa', // P7 Personal
    '#fb923c', // P8 News
  ],

  // ── Persona colors
  personas: {
    'ontario-transplant': '#7c6dff',
    'saskatoon-local':    '#10d98e',
    'first-time-buyer':   '#f59e0b',
    'calgary-investor':   '#f56565',
    'all':                '#637089',
  },

  // ── Glass styles (use as spread-like reference)
  glass:     'rgba(255,255,255,0.032)',
  glassMd:   'rgba(255,255,255,0.055)',
  glassHi:   'rgba(255,255,255,0.08)',

  // ── Shadows
  shadow:    '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.5)',
  shadowSm:  '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 10px rgba(0,0,0,0.35)',
  shadowLg:  '0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 40px rgba(0,0,0,0.6)',
}

// ── Status helpers
export function statusColor(status) {
  return { IDEA: C.idea, SCRIPTED: C.scripted, FILMED: C.filmed, EDITED: C.edited, POSTED: C.posted }[status] || C.textDim
}
export function statusDim(status) {
  return { IDEA: C.ideaDim, SCRIPTED: C.scriptedDim, FILMED: C.filmedDim, EDITED: C.editedDim, POSTED: C.postedDim }[status] || 'transparent'
}
export function statusGlow(status) {
  return { IDEA: 'none', SCRIPTED: C.scriptedGlow, FILMED: C.filmedGlow, EDITED: C.editedGlow, POSTED: C.postedGlow }[status] || 'none'
}
export function pillarColor(pillar) {
  if (!pillar) return C.textDim
  return C.pillars[(pillar - 1) % C.pillars.length]
}
export function personaColor(persona) {
  return C.personas[persona] || C.textDim
}
export function personaLabel(persona) {
  return {
    'ontario-transplant': 'Ontario Transplant',
    'saskatoon-local':    'Saskatoon Local',
    'first-time-buyer':   'First-Time Buyer',
    'calgary-investor':   'Calgary Investor',
    'all':                'All Personas',
  }[persona] || persona
}
export function priorityColor(priority) {
  return { FILM_NOW: C.filmNow, LAUNCH: C.launch, EVERGREEN: C.evgreen }[priority] || C.textDim
}
export function priorityLabel(priority) {
  return { FILM_NOW: 'Film Now', LAUNCH: 'Launch', EVERGREEN: 'Evergreen' }[priority] || priority
}
export function timeSince(date) {
  if (!date) return null
  const s = Math.floor((new Date() - date) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}
export function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`
  return String(n)
}
