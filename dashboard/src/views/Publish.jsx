import { useState, useEffect, useRef } from 'react'
import { C, statusColor, pillarColor } from '../theme.js'

// ── Env keys (personal dashboard — client-side use is acceptable)
const BLOTATO_KEY    = import.meta.env.VITE_BLOTATO_KEY
const BLOTATO_BASE   = 'https://backend.blotato.com'
const OR_KEY         = import.meta.env.VITE_OPENROUTER_KEY

// ── Platform config
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#e1306c', charLimit: 2200, hashtagNote: 'Up to 30 hashtags. First comment strategy.' },
  { id: 'tiktok',    label: 'TikTok',    icon: '🎵', color: '#010101', charLimit: 2200, hashtagNote: '3-5 hashtags. Hook in first 3 words.' },
  { id: 'youtube',   label: 'YouTube',   icon: '▶',  color: '#ff0000', charLimit: 5000, hashtagNote: 'SEO description. Keywords matter.' },
  { id: 'linkedin',  label: 'LinkedIn',  icon: '💼', color: '#0077b5', charLimit: 3000, hashtagNote: 'Professional tone. 3-5 hashtags.' },
  { id: 'twitter',   label: 'X/Twitter', icon: '𝕏',  color: '#ffffff', charLimit: 280,  hashtagNote: 'Under 280 chars. Punchy.' },
]

// ── Hashtag banks by pillar
const HASHTAG_BANKS = {
  1: '#CalgaryNeighbourhoods #CalgaryRealEstate #CalgaryLiving #YYC #CalgaryHomes',
  2: '#CalgaryHousingMarket #RealEstateTrends #HousingPrices #YYCRealEstate #InvestmentProperty',
  3: '#MoveToAlberta #CalgaryVsToronto #LifeInCalgary #AlbertaLiving #CostOfLiving',
  4: '#RealEstateInvesting #CashFlow #BRRRR #PropertyInvestment #PassiveIncome',
  5: '#CalgaryMarketUpdate #YYCHousing #HousingMarket #RealEstateMarket #HomePrices',
  6: '#RealEstateStory #ClientStory #HomeBuying #HomeSelling #RealEstateLife',
  7: '#FirstTimeHomeBuyer #HomeBuyerTips #BuyingYourFirstHome #FTHB #HouseHunting',
  8: '#RealEstateNews #MortgageRates #HousingCrisis #CanadaRealEstate #BOCRateDecision',
}

// ── AI caption rewrite via OpenRouter
async function rewriteCaption(rawCaption, episodeTitle, platforms) {
  if (!OR_KEY) throw new Error('VITE_OPENROUTER_KEY not set')

  const platformList = platforms.map(p => PLATFORMS.find(x => x.id === p)).filter(Boolean)
  const platformInstructions = platformList.map(p =>
    `${p.label}: ${p.charLimit} char max. ${p.hashtagNote}`
  ).join('\n')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OR_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nasahctus-content.vercel.app',
      'X-Title': '@nasahctus Content Machine',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      messages: [
        {
          role: 'system',
          content: `You are the social media voice for @nasahctus — Hasan Sharif, real estate agent at eXp Realty.
He covers Calgary AB and Saskatoon SK markets. He lives in Bowness NW Calgary ($1,200/mo 1bed), also has family in Saskatoon.
He's buying his first house this year. Built a deal analyzer tool. Content is educational, direct, zero fluff.

Voice: Conversational, confident, data-driven. Never salesy. Speaks like a knowledgeable friend, not a pitch.
Anti-patterns: No "🔑 Your dream home awaits!" energy. No excessive emojis. No vague advice.

Rewrite the caption for each requested platform, adapting tone and format. Return ONLY valid JSON with platform IDs as keys.`,
        },
        {
          role: 'user',
          content: `Episode: "${episodeTitle}"\nRaw caption: ${rawCaption}\n\nRewrite for these platforms:\n${platformInstructions}\n\nReturn JSON: { "${platformList.map(p=>p.id).join('": "...", "')}: "..." }`,
        },
      ],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenRouter ${res.status}`)
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  // Extract JSON from markdown code block if needed
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text]
  return JSON.parse(jsonMatch[1].trim())
}

// ── Blotato API helpers
async function fetchBlotatoAccounts() {
  const res = await fetch(`${BLOTATO_BASE}/v2/users/me/accounts`, {
    headers: { 'blotato-api-key': BLOTATO_KEY },
  })
  if (!res.ok) throw new Error(`Blotato ${res.status}`)
  return res.json()
}

async function blotatoPost(payload) {
  const res = await fetch(`${BLOTATO_BASE}/v2/posts`, {
    method: 'POST',
    headers: { 'blotato-api-key': BLOTATO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Blotato ${res.status}`)
  return data
}

// ── Input style
const input = (extra = {}) => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text,
  fontSize: 14,
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  ...extra,
})

// ── Section header
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Publish({ data, isLive, onUpdate }) {
  const episodes = data?.episodes || []

  // ── State
  const [selectedEpId,  setSelectedEpId]  = useState('')
  const [caption,       setCaption]       = useState('')
  const [mediaUrl,      setMediaUrl]      = useState('')
  const [platforms,     setPlatforms]     = useState(['instagram', 'tiktok'])
  const [scheduleMode,  setScheduleMode]  = useState('slot')   // 'now' | 'slot' | 'custom'
  const [scheduleTime,  setScheduleTime]  = useState('')
  const [publishing,    setPublishing]    = useState(false)
  const [publishLog,    setPublishLog]    = useState([])        // [{platform, status, postId}]
  const [publishErr,    setPublishErr]    = useState(null)

  // AI
  const [aiLoading,     setAiLoading]     = useState(false)
  const [aiResults,     setAiResults]     = useState(null)
  const [aiErr,         setAiErr]         = useState(null)
  const [activeAiTab,   setActiveAiTab]   = useState('instagram')

  // Blotato accounts
  const [accounts,      setAccounts]      = useState(null)
  const [acctErr,       setAcctErr]       = useState(null)
  const [acctLoading,   setAcctLoading]   = useState(false)

  // ── Load Blotato accounts on mount (if key exists)
  useEffect(() => {
    if (!BLOTATO_KEY) return
    setAcctLoading(true)
    fetchBlotatoAccounts()
      .then(setAccounts)
      .catch(e => setAcctErr(e.message))
      .finally(() => setAcctLoading(false))
  }, [])

  // ── Auto-fill caption when episode selected
  const selectedEp = episodes.find(e => e.id === selectedEpId)
  useEffect(() => {
    if (selectedEp) {
      setCaption(selectedEp.caption || selectedEp.hook_formula || '')
      setAiResults(null)
    }
  }, [selectedEpId])

  // ── Toggle platform
  const togglePlatform = id => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setAiResults(null)
  }

  // ── AI Assist
  const handleAiAssist = async () => {
    if (!caption.trim()) { setAiErr('Write a caption first.'); return }
    if (!OR_KEY) { setAiErr('VITE_OPENROUTER_KEY not set — add to Vercel env vars.'); return }
    setAiLoading(true)
    setAiErr(null)
    setAiResults(null)
    try {
      const result = await rewriteCaption(caption, selectedEp?.title || 'Untitled', platforms)
      setAiResults(result)
      setActiveAiTab(platforms[0] || 'instagram')
    } catch (e) {
      setAiErr(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  // ── Publish
  const handlePublish = async () => {
    if (!BLOTATO_KEY) { setPublishErr('Blotato API key not set.'); return }
    if (platforms.length === 0) { setPublishErr('Select at least one platform.'); return }
    if (!caption.trim()) { setPublishErr('Caption is required.'); return }

    setPublishing(true)
    setPublishErr(null)
    setPublishLog([])

    const log = []

    for (const platformId of platforms) {
      const platformCfg = PLATFORMS.find(p => p.id === platformId)
      // Find the matching Blotato account for this platform
      const account = accounts?.find(a =>
        a.type?.toLowerCase().includes(platformId) ||
        a.platform?.toLowerCase().includes(platformId) ||
        a.network?.toLowerCase().includes(platformId)
      )

      if (!account) {
        log.push({ platform: platformCfg?.label || platformId, status: 'skip', reason: 'No Blotato account connected' })
        continue
      }

      // Use AI-rewritten caption for this platform if available
      const content = aiResults?.[platformId] || caption

      const payload = {
        accountId: account.id,
        content,
        ...(mediaUrl.trim() ? { mediaUrls: [mediaUrl.trim()] } : {}),
        ...(scheduleMode === 'now'    ? {} : {}),
        ...(scheduleMode === 'slot'   ? { useNextFreeSlot: true } : {}),
        ...(scheduleMode === 'custom' && scheduleTime ? { scheduledTime: new Date(scheduleTime).toISOString() } : {}),
      }

      try {
        const result = await blotatoPost(payload)
        log.push({ platform: platformCfg?.label || platformId, status: 'ok', postId: result.id })
      } catch (e) {
        log.push({ platform: platformCfg?.label || platformId, status: 'err', reason: e.message })
      }
    }

    setPublishLog(log)
    setPublishing(false)

    // If all OK and episode selected and isLive → mark episode as POSTED
    const allOk = log.every(l => l.status === 'ok')
    if (allOk && selectedEp && isLive && onUpdate) {
      await onUpdate(selectedEp.id, {
        status: 'POSTED',
        posted_date: new Date().toISOString().slice(0, 10),
      })
    }
  }

  // ── Grouped episodes for dropdown
  const statusOrder = ['EDITED', 'FILMED', 'SCRIPTED', 'IDEA', 'POSTED']
  const epsByStatus = statusOrder.reduce((acc, s) => {
    const eps = episodes.filter(e => e.status === s)
    if (eps.length) acc[s] = eps
    return acc
  }, {})

  // ── Blotato not configured
  if (!BLOTATO_KEY) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Publish</div>
          <div style={{ fontSize: 13, color: C.textDim }}>Schedule posts to Instagram, TikTok, YouTube & more via Blotato</div>
        </div>

        <div className="glass" style={{ borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.warn, marginBottom: 12 }}>⚡ Setup Required</div>
          <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.7, marginBottom: 20 }}>
            To publish directly from this dashboard, you need:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '1', title: 'Get Blotato API key', desc: 'Sign up at blotato.com ($29/mo Starter plan). Go to Settings → API to get your key.' },
              { n: '2', title: 'Connect your accounts', desc: 'In Blotato dashboard, connect Instagram, TikTok, YouTube — OAuth flow. Takes 5 min.' },
              { n: '3', title: 'Add key to Vercel', desc: 'Vercel → nasahctus-content → Settings → Env Variables → Add VITE_BLOTATO_KEY' },
              { n: '4', title: 'Optional: OpenRouter key', desc: 'For AI caption rewriting per platform. Get key from openrouter.ai → Add as VITE_OPENROUTER_KEY' },
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: C.brandDim, border: `1px solid ${C.borderGlow}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: C.brand,
                }}>{item.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* n8n alternative */}
        <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>Or use n8n automation</div>
          <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
            Set up the n8n workflow to auto-publish when an episode reaches EDITED status.
            The workflow reads your Supabase episodes, adapts captions with Claude, and fires Blotato.
            No manual publish step needed.
          </div>
          <div style={{ marginTop: 12, fontFamily: 'monospace', fontSize: 11, color: C.brand, background: C.brandDim, borderRadius: 8, padding: '8px 12px' }}>
            Webhook: POST /webhook/nasahctus-publish{'\n'}
            Body: {`{ "episode_id": "EP-001", "media_url": "https://..." }`}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Publish</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            Compose · AI-adapt · Schedule via Blotato
          </div>
        </div>
        {/* Platform dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {PLATFORMS.map(p => (
            <div
              key={p.id}
              title={p.label}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: platforms.includes(p.id) ? p.color : C.border,
                transition: 'background 200ms',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Two-column layout */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: 0, minHeight: 0 }}>

        {/* ── Left: Composer */}
        <div style={{ flex: 1, padding: '20px 20px 20px 24px', overflowY: 'auto', minWidth: 0 }}>

          {/* Episode selector */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>Episode (optional)</SectionLabel>
            <select
              value={selectedEpId}
              onChange={e => setSelectedEpId(e.target.value)}
              style={{ ...input(), cursor: 'pointer' }}
            >
              <option value="">— Freeform post (no episode) —</option>
              {Object.entries(epsByStatus).map(([status, eps]) => (
                <optgroup key={status} label={`── ${status}`}>
                  {eps.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      {ep.id} · {ep.title?.slice(0, 50)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedEp && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: statusColor(selectedEp.status),
                  background: `${statusColor(selectedEp.status)}18`,
                  padding: '2px 8px', borderRadius: 20,
                }}>{selectedEp.status}</span>
                <span style={{
                  fontSize: 10, color: pillarColor(selectedEp.pillar),
                  background: `${pillarColor(selectedEp.pillar)}18`,
                  padding: '2px 8px', borderRadius: 20,
                }}>P{selectedEp.pillar}</span>
              </div>
            )}
          </div>

          {/* Caption */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>Caption</SectionLabel>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write your caption here, or select an episode to auto-fill..."
              rows={6}
              style={{ ...input(), resize: 'vertical', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <div style={{ fontSize: 11, color: C.textDim }}>{caption.length} chars</div>
              {/* Hashtag presets */}
              {selectedEp?.pillar && (
                <button
                  onClick={() => setCaption(prev => prev + '\n\n' + (HASHTAG_BANKS[selectedEp.pillar] || ''))}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: C.brand, padding: 0,
                  }}
                >+ Pillar {selectedEp.pillar} hashtags</button>
              )}
            </div>
          </div>

          {/* AI Assist */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>AI Caption Assist</SectionLabel>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12, lineHeight: 1.5 }}>
                Rewrite your caption for each selected platform in Hasan's voice.
                Uses Claude via OpenRouter.
              </div>
              <button
                onClick={handleAiAssist}
                disabled={aiLoading || !caption.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: aiLoading ? C.brandDim : 'linear-gradient(135deg, #7c6dff, #a78bfa)',
                  border: 'none', borderRadius: 9, cursor: 'pointer',
                  padding: '9px 18px', fontSize: 13, fontWeight: 600,
                  color: '#fff', transition: 'opacity 200ms',
                  opacity: aiLoading || !caption.trim() ? 0.5 : 1,
                }}
              >
                {aiLoading
                  ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>◌</span> Rewriting…</>
                  : <>✦ Rewrite with AI ({platforms.length} platform{platforms.length !== 1 ? 's' : ''})</>
                }
              </button>

              {aiErr && (
                <div style={{ marginTop: 10, fontSize: 12, color: C.neg, background: `${C.neg}14`, borderRadius: 8, padding: '8px 12px' }}>
                  {aiErr}
                </div>
              )}

              {aiResults && (
                <div style={{ marginTop: 14 }}>
                  {/* Platform tabs */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {platforms.filter(id => aiResults[id]).map(id => {
                      const p = PLATFORMS.find(x => x.id === id)
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveAiTab(id)}
                          style={{
                            padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 500,
                            background: activeAiTab === id ? p.color : C.surface2,
                            color: activeAiTab === id ? '#fff' : C.textSub,
                            transition: 'all 150ms',
                          }}
                        >{p.icon} {p.label}</button>
                      )
                    })}
                  </div>
                  {/* Result text */}
                  {aiResults[activeAiTab] && (
                    <div style={{
                      background: C.surfaceSolid,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: 14,
                      fontSize: 13, color: C.text, lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {aiResults[activeAiTab]}
                    </div>
                  )}
                  <button
                    onClick={() => setCaption(aiResults[activeAiTab] || caption)}
                    style={{
                      marginTop: 10, background: 'none', border: `1px solid ${C.border}`,
                      borderRadius: 8, cursor: 'pointer', padding: '6px 14px',
                      fontSize: 12, color: C.textSub, transition: 'all 150ms',
                    }}
                  >← Use this caption</button>
                </div>
              )}
            </div>
          </div>

          {/* Publish log */}
          {publishLog.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <SectionLabel>Publish Result</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {publishLog.map((l, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: l.status === 'ok' ? `${C.pos}12` : l.status === 'skip' ? `${C.warn}12` : `${C.neg}12`,
                    border: `1px solid ${l.status === 'ok' ? C.pos : l.status === 'skip' ? C.warn : C.neg}30`,
                    borderRadius: 10, padding: '10px 14px', fontSize: 13,
                  }}>
                    <span>{l.status === 'ok' ? '✓' : l.status === 'skip' ? '→' : '✗'}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{l.platform}</span>
                    <span style={{ color: C.textDim, fontSize: 12 }}>
                      {l.status === 'ok' ? `Posted (ID: ${l.postId || '—'})` : l.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Settings panel */}
        <div style={{
          width: 280, flexShrink: 0,
          borderLeft: `1px solid ${C.border}`,
          padding: '20px 20px',
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.015)',
        }}>

          {/* Platforms */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Platforms</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PLATFORMS.map(p => {
                const on = platforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: on ? `${p.color}18` : C.surface,
                      outline: on ? `1px solid ${p.color}50` : `1px solid ${C.border}`,
                      color: on ? p.color : C.textDim,
                      fontSize: 13, fontWeight: on ? 600 : 400,
                      textAlign: 'left', transition: 'all 150ms',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <span style={{ flex: 1 }}>{p.label}</span>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: on ? p.color : 'transparent',
                      border: `1.5px solid ${on ? p.color : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 150ms',
                    }}>
                      {on && <span style={{ fontSize: 10, color: '#fff', lineHeight: 1 }}>✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Media */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Media URL</SectionLabel>
            <input
              type="url"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder="https://drive.google.com/... or leave blank"
              style={input({ fontSize: 12 })}
            />
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 6, lineHeight: 1.5 }}>
              Paste any public URL. Google Drive, Dropbox, direct MP4, or image URL. Leave blank for text-only post.
            </div>
          </div>

          {/* Schedule */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Schedule</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'now',    label: '⚡ Post now',          desc: 'Publish immediately' },
                { id: 'slot',   label: '📅 Next free slot',    desc: 'Blotato fills your queue' },
                { id: 'custom', label: '🕐 Custom time',       desc: 'Pick exact date + time' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setScheduleMode(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: scheduleMode === opt.id ? C.brandDim : C.surface,
                    outline: scheduleMode === opt.id ? `1px solid ${C.borderGlow}` : `1px solid ${C.border}`,
                    color: scheduleMode === opt.id ? C.brand : C.textDim,
                    fontSize: 13, fontWeight: scheduleMode === opt.id ? 600 : 400,
                    textAlign: 'left', transition: 'all 150ms',
                  }}
                >
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {scheduleMode === opt.id && <span style={{ color: C.brand, fontSize: 11 }}>●</span>}
                </button>
              ))}
            </div>
            {scheduleMode === 'custom' && (
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                style={{ ...input({ fontSize: 12, marginTop: 10 }) }}
              />
            )}
          </div>

          {/* Blotato accounts status */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Blotato Accounts</SectionLabel>
            {acctLoading && (
              <div style={{ fontSize: 12, color: C.textDim }}>Loading…</div>
            )}
            {acctErr && (
              <div style={{ fontSize: 12, color: C.neg }}>{acctErr}</div>
            )}
            {accounts && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {accounts.length === 0 ? (
                  <div style={{ fontSize: 12, color: C.warn }}>No accounts connected in Blotato yet</div>
                ) : (
                  accounts.map((a, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: C.textSub,
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '6px 10px',
                    }}>
                      <span style={{ color: C.pos }}>✓</span> {a.type || a.platform || a.network || 'Account'} — {a.name || a.username || a.id?.slice(0, 8)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Publish error */}
          {publishErr && (
            <div style={{
              marginBottom: 16, fontSize: 12, color: C.neg,
              background: `${C.neg}12`, borderRadius: 8, padding: '8px 12px',
            }}>
              {publishErr}
            </div>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={publishing || platforms.length === 0}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 12, border: 'none', cursor: 'pointer',
              background: publishing ? C.brandDim : 'linear-gradient(135deg, #6470ff, #a78bfa)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: publishing ? 'none' : '0 0 24px rgba(124,109,255,0.35)',
              transition: 'all 200ms',
              opacity: platforms.length === 0 ? 0.4 : 1,
            }}
          >
            {publishing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>◌</span>
                Publishing…
              </span>
            ) : (
              `Publish to ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}`
            )}
          </button>

          <div style={{ marginTop: 10, fontSize: 11, color: C.textFaint, textAlign: 'center', lineHeight: 1.5 }}>
            {scheduleMode === 'now' && 'Posts immediately after clicking'}
            {scheduleMode === 'slot' && 'Goes to next available slot in Blotato queue'}
            {scheduleMode === 'custom' && scheduleTime && `Scheduled: ${new Date(scheduleTime).toLocaleString()}`}
          </div>
        </div>
      </div>
    </div>
  )
}
