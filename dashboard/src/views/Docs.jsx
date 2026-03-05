import { useState } from 'react'
import { C } from '../theme.js'

const DOCS = [
  {
    section: 'Brand & Strategy', icon: '✦', color: C.brand,
    docs: [
      { id: 'brand-voice',    label: 'Brand Voice',          path: '/docs/BRAND_VOICE.md',         desc: 'Voice DNA, script rules, anti-patterns' },
      { id: 'content-psych',  label: 'Content Psychology',   path: '/docs/CONTENT_PSYCHOLOGY.md',  desc: 'Hook science, EATA funnel, platform signals' },
      { id: 'pipeline-prefs', label: 'Pipeline Preferences', path: '/docs/PIPELINE_PREFS.md',      desc: 'Posting schedule, caption rules, hashtags' },
      { id: 'series-map',     label: 'Content Series Map',   path: '/docs/CONTENT_SERIES_MAP.md',  desc: '73+ episode stubs across all 8 pillars' },
    ],
  },
  {
    section: 'Competitor Research', icon: '◈', color: '#f59e0b',
    docs: [
      { id: 'competitor',    label: 'Competitor Analysis', path: '/docs/COMPETITOR_ANALYSIS.md', desc: 'Teardowns of top real estate creators' },
      { id: 'audience-q',   label: 'Audience Questions',  path: '/docs/AUDIENCE_QUESTIONS.md',  desc: '4 persona question banks — content seeds' },
      { id: 'search-demand', label: 'Search Demand',      path: '/docs/SEARCH_DEMAND.md',       desc: 'Keyword volumes and topic demand' },
    ],
  },
  {
    section: 'Content Tracking', icon: '⬡', color: '#10d98e',
    docs: [
      { id: 'content-calendar', label: 'Content Calendar',  path: '/docs/CONTENT_CALENDAR.md',  desc: 'Publishing schedule and episode status' },
      { id: 'content-tracker',  label: 'Content Tracker',   path: '/docs/CONTENT_TRACKER.md',   desc: 'Episode completion tracking' },
      { id: 'checkpoint-log',   label: 'Checkpoint Log',    path: '/docs/CHECKPOINT_LOG.md',    desc: 'Session notes and progress log' },
      { id: 'email-template',   label: 'Email Template',    path: '/docs/email-template.md',    desc: 'Newsletter and outreach templates' },
    ],
  },
]

function inlineFormat(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: C.text, fontWeight: 700 }}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ background: 'rgba(0,0,0,0.35)', color: '#a8c7fa', padding: '1px 5px', borderRadius: 4, fontSize: '0.9em', fontFamily: "'JetBrains Mono', monospace" }}>{part.slice(1, -1)}</code>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} style={{ color: C.textDim }}>{part.slice(1, -1)}</em>
    return part
  })
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const output = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      output.push(<h1 key={i} style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 28, marginBottom: 12, lineHeight: 1.3, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      output.push(<h2 key={i} style={{ fontSize: 16, fontWeight: 700, color: C.brand, marginTop: 24, marginBottom: 8 }}>{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      output.push(<h3 key={i} style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginTop: 18, marginBottom: 6 }}>{line.slice(4)}</h3>)
    } else if (line.startsWith('#### ')) {
      output.push(<h4 key={i} style={{ fontSize: 12, fontWeight: 600, color: C.textDim, marginTop: 14, marginBottom: 4 }}>{line.slice(5)}</h4>)
    } else if (/^---+$/.test(line.trim())) {
      output.push(<hr key={i} style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '16px 0' }} />)
    } else if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++ }
      output.push(
        <pre key={i} style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', overflowX: 'auto', fontSize: 11, lineHeight: 1.6, color: '#a8c7fa', fontFamily: "'JetBrains Mono', monospace", margin: '8px 0 12px' }}>
          {lang && <div style={{ color: C.textFaint, fontSize: 9, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>{lang}</div>}
          {codeLines.join('\n')}
        </pre>
      )
    } else if (line.startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].startsWith('|')) {
        const row = lines[i]
        if (!row.replace(/\|/g, '').trim().replace(/-/g, '').trim()) { i++; continue }
        rows.push(row.split('|').slice(1, -1).map(c => c.trim()))
        i++
      }
      output.push(
        <div key={`tbl-${i}`} style={{ overflowX: 'auto', margin: '8px 0 14px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: `1px solid ${C.border}`, background: ri === 0 ? 'rgba(124,109,255,0.06)' : 'transparent' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '7px 10px', color: ri === 0 ? C.textDim : C.text, fontWeight: ri === 0 ? 700 : 400, fontSize: ri === 0 ? 9 : 11, textTransform: ri === 0 ? 'uppercase' : 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    } else if (/^[-*] /.test(line)) {
      const items = []
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2)); i++ }
      output.push(
        <ul key={`ul-${i}`} style={{ margin: '4px 0 10px', paddingLeft: 0, listStyle: 'none' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ color: C.brand, flexShrink: 0, marginTop: 2 }}>·</span>
              <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    } else if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++ }
      output.push(
        <ol key={`ol-${i}`} style={{ margin: '4px 0 10px', paddingLeft: 0, listStyle: 'none' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ color: C.brand, flexShrink: 0, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", minWidth: 18 }}>{idx + 1}.</span>
              <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    } else if (line.startsWith('> ')) {
      output.push(<div key={i} style={{ borderLeft: `3px solid ${C.brand}`, paddingLeft: 14, margin: '8px 0', color: C.textDim, fontSize: 12, lineHeight: 1.7, fontStyle: 'italic' }}>{line.slice(2)}</div>)
    } else if (line.trim() === '') {
      output.push(<div key={i} style={{ height: 6 }} />)
    } else {
      output.push(<p key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.75, margin: '2px 0' }}>{inlineFormat(line)}</p>)
    }

    i++
  }
  return output
}

function DocItem({ doc, active, color, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: '7px 16px', background: active ? `${color}12` : hovered ? 'rgba(255,255,255,0.03)' : 'transparent', borderLeft: active ? `2px solid ${color}` : '2px solid transparent', transition: 'all 150ms' }}
    >
      <div style={{ fontSize: 12, color: active ? color : C.text, fontWeight: active ? 600 : 400, lineHeight: 1.3 }}>{doc.label}</div>
      <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>{doc.desc}</div>
    </button>
  )
}

export default function Docs() {
  const [activeDoc, setActiveDoc] = useState(null)
  const [content,   setContent]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [copied,    setCopied]    = useState(false)

  const allDocs  = DOCS.flatMap(s => s.docs)
  const filtered = search
    ? allDocs.filter(d => d.label.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase()))
    : null

  function sectionColor(id) {
    for (const s of DOCS) if (s.docs.find(d => d.id === id)) return s.color
    return C.brand
  }

  async function openDoc(doc) {
    setActiveDoc(doc); setContent(''); setError(null); setLoading(true)
    try {
      const res = await fetch(doc.path)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setContent(await res.text())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyContent() {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const totalDocs = DOCS.reduce((a, s) => a + s.docs.length, 0)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: 260, flexShrink: 0, overflowY: 'auto', borderRight: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.015)', padding: '16px 0' }}>
        <div style={{ padding: '0 12px 12px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search docs…"
            style={{ width: '100%', boxSizing: 'border-box', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', color: C.text, fontSize: 12, outline: 'none' }}
          />
        </div>
        {filtered ? (
          <div style={{ padding: '0 8px' }}>
            {filtered.length === 0 && <div style={{ fontSize: 11, color: C.textFaint, padding: '8px 4px' }}>No results</div>}
            {filtered.map(d => <DocItem key={d.id} doc={d} active={activeDoc?.id === d.id} color={sectionColor(d.id)} onClick={() => { setSearch(''); openDoc(d) }} />)}
          </div>
        ) : (
          DOCS.map(section => (
            <div key={section.section} style={{ marginBottom: 20 }}>
              <div style={{ padding: '4px 16px 6px', fontSize: 9, fontWeight: 700, color: section.color, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{section.icon}</span>{section.section}
              </div>
              {section.docs.map(d => <DocItem key={d.id} doc={d} active={activeDoc?.id === d.id} color={section.color} onClick={() => openDoc(d)} />)}
            </div>
          ))
        )}
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeDoc ? (
          <>
            <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{activeDoc.label}</div>
                <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>{activeDoc.desc}</div>
              </div>
              <button onClick={copyContent} disabled={!content || loading} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: copied ? 'rgba(16,217,142,0.15)' : C.surface, color: copied ? '#10d98e' : C.textDim, fontSize: 11, cursor: 'pointer', transition: 'all 200ms' }}>
                {copied ? '✓ Copied' : '⎘ Copy'}
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 40px' }}>
              {loading && <div style={{ color: C.textFaint, fontSize: 12, padding: '40px 0', textAlign: 'center' }}>Loading…</div>}
              {error && <div style={{ color: '#ff5757', fontSize: 12, padding: '40px 0', textAlign: 'center' }}>Error: {error}</div>}
              {content && !loading && <div style={{ maxWidth: 760 }}>{renderMarkdown(content)}</div>}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.textFaint, gap: 12 }}>
            <div style={{ fontSize: 40 }}>⬡</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.textDim }}>Research Library</div>
            <div style={{ fontSize: 12, color: C.textFaint, maxWidth: 300, textAlign: 'center', lineHeight: 1.6 }}>
              {totalDocs} documents — brand voice, competitor research, content strategy, and tracking
            </div>
            <div style={{ fontSize: 11, color: C.textFaint, marginTop: 8 }}>Select a document from the sidebar →</div>
          </div>
        )}
      </div>

    </div>
  )
}
