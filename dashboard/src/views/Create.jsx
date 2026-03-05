import { useState, useEffect } from 'react'
import { C, pillarColor } from '../theme.js'

const PERSONAS = [
  { id: 'ontario-transplant', label: 'Ontario Transplant', color: '#7c6dff', hint: 'Contrast GTA/Mississauga prices' },
  { id: 'saskatoon-local',    label: 'Saskatoon Local',    color: '#10d98e', hint: 'Sask vs Calgary comparison' },
  { id: 'first-time-buyer',   label: 'First-Time Buyer',   color: '#f59e0b', hint: 'Mortgage math, FHSA, monthly payment' },
  { id: 'calgary-investor',   label: 'Calgary Investor',   color: '#f56565', hint: 'Cap rates, vacancy, cash flow' },
]

const PILLARS = [
  { n: 1, label: 'Neighbourhood Breakdown' },
  { n: 2, label: 'Then vs Now Price History' },
  { n: 3, label: 'Migration & Cost of Living' },
  { n: 4, label: 'Investment & Deal Analysis' },
  { n: 5, label: 'Monthly Market Pulse' },
  { n: 6, label: 'Real Deal Story' },
  { n: 7, label: 'Personal Journey' },
  { n: 8, label: 'News & Current Events' },
]

const PERSONA_CONTEXT = {
  'ontario-transplant': 'Ontario Transplant — contrast with Toronto/GTA/Mississauga prices. Viewers left Ontario for affordability. Hit them with the real dollar difference.',
  'saskatoon-local':    'Saskatoon Local — compare Saskatoon market to Calgary. What they know vs what they might not know.',
  'first-time-buyer':   'First-Time Buyer — focus on mortgage math: monthly payment, down payment, FHSA impact. Make abstract numbers concrete.',
  'calgary-investor':   'Calgary Investor — cap rates, vacancy data, cash flow numbers. Skip lifestyle, go straight to the returns.',
}

const VOICE_PROMPT = `<role>
You are a script writer replicating the exact speaking voice of @nasahctus — Hasan Sharif, real estate agent at eXp Realty, Calgary AB and Saskatoon SK. You do not add your own personality. You replicate his.
</role>

<voice_dna>
PATTERN 1 — THE OPENING (non-negotiable):
Drops mid-thought. Stat within 3 seconds. Never a greeting. Never his name.

PATTERN 2 — STAT-THEN-TRANSLATE (every single stat):
Number first, then what it means for the viewer personally.

PATTERN 3 — CALGARY/SASKATOON SPECIFICITY:
Neighbourhood names, not just "the city". Real streets and areas if possible.

PATTERN 4 — CONVERSATIONAL MOMENTUM:
Short punchy sentences. "And what that means for you is..." connectors. No formal language.
</voice_dna>

<output_format>
Write ONLY the script, then the separator ---CAPTION---, then the caption.
Script: 160-200 words, natural speech, no stage directions, no brackets except [NEED STAT].
Caption: 3 lines max, hook first, stats second, CTA last.
</output_format>`

const OR_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

const inputStyle = (extra = {}) => ({
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text,
  fontSize: 14,
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
  transition: 'border-color 150ms',
  ...extra,
})

async function fetchResearch(idea) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OR_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nasahctus-content.vercel.app',
      'X-Title': '@nasahctus Content Machine',
    },
    body: JSON.stringify({
      model: 'perplexity/sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a real estate data researcher for Calgary AB and Saskatoon SK, Canada. Return verifiable statistics only — vacancy rates, average prices, % changes, neighbourhood comparisons, migration data, rental rates. Bullet points with numbers, time periods, and specific area names. Never fabricate data.',
        },
        {
          role: 'user',
          content: `Research current data for a real estate video about: ${idea}\n\nMarkets: Calgary AB and/or Saskatoon SK, Canada — include both where relevant.\nFind stats that would genuinely surprise a general Canadian audience.\nPrioritize: prices, % changes vs other Canadian cities, vacancy rates, rental rates, neighbourhood-level data, migration trends.\nReturn 8-12 bullet points. Include the time period (month/year) for each stat.`,
        },
      ],
      temperature: 0.1,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Research failed (${res.status})`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function fetchScript(idea, research, persona, pillar) {
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
        { role: 'system', content: VOICE_PROMPT },
        {
          role: 'user',
          content: `<task>
Write a 60-90 second talking head video script (~160-200 words) about: ${idea}

Target persona: ${PERSONA_CONTEXT[persona] || ''}
Pillar: P${pillar || 3} — use appropriate framing for this content category.
Use ONLY stats from the research data below. Write [NEED STAT] if a number is missing — never invent data.
</task>

<research_data>
${research}
</research_data>`,
        },
      ],
      temperature: 0.75,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Script failed (${res.status})`)
  }
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || ''
  const [scriptPart, captionPart] = raw.split('---CAPTION---')
  return {
    script:  (scriptPart  || raw).replace('---SCRIPT---', '').trim(),
    caption: (captionPart || '').trim(),
  }
}

export default function Create({ data, onInsert, onUpdate, setView, isLive, refresh, prefill, clearPrefill }) {
  const clusters = data?.clusters || []

  const [step,       setStep]      = useState('idea')
  const [idea,       setIdea]      = useState(prefill?.idea      || '')
  const [persona,    setPersona]   = useState(prefill?.persona   || 'ontario-transplant')
  const [pillar,     setPillar]    = useState(prefill?.pillar    || 3)
  const [clusterId,  setClusterId] = useState(prefill?.clusterId || '')
  const [episodeId,  setEpisodeId] = useState(prefill?.episodeId || null)
  const [research,   setResearch]  = useState('')
  const [script,     setScript]    = useState('')
  const [caption,    setCaption]   = useState('')
  const [resLoading, setResLoad]   = useState(false)
  const [scriptLoad, setScriptLoad]= useState(false)
  const [error,      setError]     = useState(null)
  const [saving,     setSaving]    = useState(false)
  const [savedId,    setSavedId]   = useState(null)
  const [editedText, setEdited]    = useState('')
  const [isEdited,   setIsEdited]  = useState(false)

  useEffect(() => { clearPrefill?.() }, []) // eslint-disable-line

  const generate = async () => {
    if (!idea.trim()) return
    setError(null)
    setStep('generating')
    setResLoad(true)
    setResearch(''); setScript(''); setCaption('')
    try {
      const res = await fetchResearch(idea)
      setResearch(res)
      setResLoad(false)
      setScriptLoad(true)
      const { script: s, caption: cap } = await fetchScript(idea, res, persona, pillar)
      setScript(s); setCaption(cap); setEdited(s)
      setScriptLoad(false)
      setStep('review')
    } catch (e) {
      setResLoad(false); setScriptLoad(false)
      setError(e.message); setStep('idea')
    }
  }

  const regenerate = async () => {
    if (!research || scriptLoad) return
    setScriptLoad(true); setError(null)
    try {
      const { script: s, caption: cap } = await fetchScript(idea, research, persona, pillar)
      setScript(s); setCaption(cap); setEdited(s); setIsEdited(false)
    } catch (e) { setError(e.message) }
    finally { setScriptLoad(false) }
  }

  const save = async () => {
    if (!onInsert) return
    setSaving(true); setError(null)
    const finalScript = isEdited ? editedText : script
    const cluster = clusters.find(c => c.id === clusterId)
    try {
      if (episodeId && onUpdate) {
        const ok = await onUpdate(episodeId, {
          status: 'SCRIPTED', script: finalScript, caption, persona,
          pillar: pillar || cluster?.pillar || 1,
        })
        if (ok) { setSavedId(episodeId); setStep('saved'); refresh?.() }
        else setError('Update failed — check Supabase connection')
      } else {
        const id = `EP-${Date.now().toString().slice(-6)}`
        const row = {
          id, title: idea.slice(0, 80).replace(/\n/g, ' ').trim(),
          status: 'SCRIPTED', script: finalScript, caption, persona,
          pillar: pillar || cluster?.pillar || 1,
          cluster_id: clusterId || null,
          cluster_name: cluster?.name || null,
        }
        const res = await onInsert(row)
        if (res) { setSavedId(id); setStep('saved'); refresh?.() }
        else setError('Save failed — check Supabase connection')
      }
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  // ── Saved ──────────────────────────────────────────────────────────────────
  if (step === 'saved') return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', animation: 'fadein 400ms ease' }}>
      <div style={{ width: 68, height: 68, borderRadius: '50%', marginBottom: 24, background: 'rgba(16,217,142,0.12)', border: `1px solid ${C.pos}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: `0 0 40px ${C.pos}25` }}>✓</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', marginBottom: 8 }}>Episode saved</div>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 8 }}>Status: <span style={{ color: '#10d98e', fontWeight: 600 }}>SCRIPTED</span></div>
      <div style={{ fontSize: 11, color: C.textFaint, fontFamily: "'JetBrains Mono', monospace", marginBottom: 36, background: C.surface, border: `1px solid ${C.border}`, padding: '4px 12px', borderRadius: 20 }}>{savedId}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setView('episodes')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #a78bfa, #7c6dff)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 24px rgba(124,109,255,0.35)' }}>View in Episodes →</button>
        <button onClick={() => { setStep('idea'); setIdea(''); setResearch(''); setScript(''); setSavedId(null); setError(null) }} style={{ padding: '12px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textSub, fontSize: 13, cursor: 'pointer' }}>Create another</button>
      </div>
    </div>
  )

  // ── Generating ─────────────────────────────────────────────────────────────
  if (step === 'generating') return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, animation: 'fadein 300ms ease' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${C.brand}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{resLoading ? 'Researching with Perplexity…' : 'Writing your script…'}</div>
        <div style={{ fontSize: 12, color: C.textDim }}>{resLoading ? 'Finding real stats for Calgary & Saskatoon' : 'Claude is matching your voice'}</div>
      </div>
      <div style={{ fontSize: 12, color: C.textFaint, fontFamily: "'JetBrains Mono', monospace", background: C.surface, border: `1px solid ${C.border}`, padding: '6px 14px', borderRadius: 20 }}>{idea.slice(0, 60)}{idea.length > 60 ? '…' : ''}</div>
    </div>
  )

  // ── Review ─────────────────────────────────────────────────────────────────
  if (step === 'review') return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Research panel */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Research Data
            <span style={{ fontSize: 9, color: C.textFaint, fontWeight: 400 }}>via Perplexity Sonar Pro</span>
          </div>
          <textarea
            value={research}
            onChange={e => setResearch(e.target.value)}
            rows={20}
            style={{ ...inputStyle(), width: '100%', resize: 'vertical', padding: '14px 16px', fontSize: 12, lineHeight: 1.75, fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        {/* Script + save panel */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Script
            <button onClick={regenerate} disabled={scriptLoad} style={{ fontSize: 10, color: scriptLoad ? C.textFaint : C.brand, background: 'none', border: 'none', cursor: scriptLoad ? 'wait' : 'pointer', padding: 0 }}>
              {scriptLoad ? '↺ Writing…' : '↺ Regenerate'}
            </button>
          </div>
          <textarea
            value={isEdited ? editedText : script}
            onChange={e => { setEdited(e.target.value); setIsEdited(true) }}
            rows={13}
            style={{ ...inputStyle(), width: '100%', resize: 'vertical', padding: '14px 16px', fontSize: 13, lineHeight: 1.8 }}
          />
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8, marginTop: 16 }}>Caption</div>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={4}
            style={{ ...inputStyle(), width: '100%', resize: 'vertical', padding: '12px 14px', fontSize: 12, lineHeight: 1.7 }}
          />
          {error && <div style={{ marginTop: 10, padding: '10px 14px', background: `${C.neg}12`, border: `1px solid ${C.neg}40`, borderRadius: 8, fontSize: 12, color: C.neg }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep('idea')} style={{ padding: '11px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textDim, fontSize: 13, cursor: 'pointer' }}>← Back</button>
            <button
              onClick={save}
              disabled={saving || !isLive}
              style={{ flex: 1, padding: '11px 18px', background: (saving || !isLive) ? C.surface : 'linear-gradient(135deg, #a78bfa, #7c6dff)', border: 'none', borderRadius: 10, color: (saving || !isLive) ? C.textFaint : '#fff', fontSize: 13, fontWeight: 700, cursor: (saving || !isLive) ? 'not-allowed' : 'pointer', transition: 'all 200ms' }}
            >
              {saving ? 'Saving…' : !isLive ? 'Not connected' : episodeId ? 'Update Episode' : 'Save Episode →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )

  // ── Idea (default) ─────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 80px' }}>

        {episodeId && (
          <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,217,142,0.08)', border: '1px solid rgba(16,217,142,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>⬡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10d98e' }}>Generating script for existing episode</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{episodeId}</div>
            </div>
            <button onClick={() => setEpisodeId(null)} style={{ fontSize: 10, color: C.textFaint, background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
          </div>
        )}

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16, background: C.brandDim, border: `1px solid ${C.borderGlow}`, borderRadius: 20, padding: '5px 14px', fontSize: 10, fontWeight: 700, color: C.brandLight, letterSpacing: '0.5px', textTransform: 'uppercase' }}>✦ AI CONTENT CREATOR</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: '-0.6px', lineHeight: 1.15, marginBottom: 12 }}>{episodeId ? 'Ready to generate' : "What's the video about?"}</div>
          <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.65, maxWidth: 540 }}>Drop your raw idea. Perplexity researches the stats. Claude writes the script in your voice. You review, edit, save. Done.</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder={`SE Calgary — Mahogany, McKenzie Towne, why Ontario families are choosing it over Markham\n\nor:\n\nSaskatoon vacancy rate is wild compared to anywhere else in Canada right now\n\nor:\n\nFirst-time buyer — what $500K actually buys you in Calgary vs Toronto`}
            rows={6}
            autoFocus
            style={{ ...inputStyle(), width: '100%', resize: 'vertical', padding: '16px 18px', lineHeight: 1.75, fontSize: 14 }}
            onFocus={e => { e.target.style.borderColor = C.brand }}
            onBlur={e => { e.target.style.borderColor = C.border }}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && idea.trim()) generate() }}
          />
          <div style={{ fontSize: 11, color: C.textFaint, marginTop: 6 }}>More detail = better research. Include neighbourhood names, cities, or the specific angle. ⌘+Enter to generate.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Personas */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Target Persona</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PERSONAS.map(p => (
                <button key={p.id} onClick={() => setPersona(p.id)} style={{ padding: '10px 13px', borderRadius: 10, border: 'none', cursor: 'pointer', background: persona === p.id ? `${p.color}16` : C.surface, outline: persona === p.id ? `1px solid ${p.color}55` : `1px solid ${C.border}`, color: persona === p.id ? p.color : C.textDim, textAlign: 'left', transition: 'all 130ms' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.65, marginTop: 2 }}>{p.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pillars */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Content Pillar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PILLARS.map(p => {
                const pc = pillarColor(p.n)
                const active = pillar === p.n
                return (
                  <button key={p.n} onClick={() => setPillar(p.n)} style={{ padding: '7px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? `${pc}16` : C.surface, outline: active ? `1px solid ${pc}50` : `1px solid ${C.border}`, color: active ? pc : C.textDim, fontSize: 11, fontWeight: active ? 600 : 400, textAlign: 'left', transition: 'all 130ms', display: 'flex', gap: 9, alignItems: 'center' }}>
                    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", opacity: 0.55, minWidth: 16 }}>P{p.n}</span>
                    {p.label}
                  </button>
                )
              })}
            </div>
            {clusters.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Cluster (optional)</div>
                <select value={clusterId} onChange={e => setClusterId(e.target.value)} style={{ ...inputStyle({ padding: '9px 11px', fontSize: 12, cursor: 'pointer', width: '100%' }) }}>
                  <option value="">— No cluster —</option>
                  {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {error && <div style={{ marginBottom: 16, padding: '11px 16px', background: `${C.neg}12`, border: `1px solid ${C.neg}40`, borderRadius: 8, fontSize: 12, color: C.neg }}>{error}</div>}
        {!isLive && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, fontSize: 11, color: '#f59e0b' }}>⚠ Not connected to Supabase — generated scripts won't be saved</div>}

        <button
          onClick={generate}
          disabled={!idea.trim()}
          style={{ width: '100%', padding: '16px', background: idea.trim() ? 'linear-gradient(135deg, #a78bfa, #7c6dff)' : C.surface, border: 'none', borderRadius: 12, color: idea.trim() ? '#fff' : C.textFaint, fontSize: 15, fontWeight: 700, cursor: idea.trim() ? 'pointer' : 'not-allowed', transition: 'all 200ms', boxShadow: idea.trim() ? '0 0 30px rgba(124,109,255,0.3)' : 'none' }}
        >
          Generate Script →
        </button>

      </div>
    </div>
  )
}
