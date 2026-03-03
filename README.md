# @nasahctus Content Machine

**Live Dashboard:** [nasahctus-content.vercel.app](https://nasahctus-content.vercel.app)

Hasan Sharif | eXp Realty | Calgary AB + Saskatoon SK

---

## What This Is

The content pipeline management system for @nasahctus — a real estate content brand targeting Ontario transplants, first-time buyers, and Calgary/Saskatoon investors.

- **73 episodes** across 15 clusters and 8 content pillars
- **Single source of truth:** `data/episodes.json` → dashboard polls every 60s
- **Claude Code** acts as the admin — status changes update this repo automatically
- **Blotato API** integration for direct-to-social scheduling (configure API key in Vercel)

---

## Architecture

```
GitHub (this repo)
├── /docs/          ← All strategy markdown files (read by Claude Code)
├── /data/
│   ├── episodes.json    ← Live pipeline state — edit to update dashboard
│   └── performance.json ← Post metrics log
└── /dashboard/     ← React + Vite (deployed to Vercel)
```

**Data flow:**
1. Claude Code updates `episodes.json` via GitHub API
2. Dashboard fetches raw GitHub URL every 60 seconds
3. UI re-renders — "Last synced: Xs ago" shown in header
4. No backend required for Phase 1

---

## Episode Status Flow

```
IDEA → SCRIPTED → FILMED → EDITED → POSTED
```

| Status | Meaning |
|---|---|
| IDEA | Episode stub — research/script not started |
| SCRIPTED | Q11 script complete, data validated |
| FILMED | Filmed but not edited |
| EDITED | Edit complete — ready to post |
| POSTED | Live on social |

---

## Content Pillars

| # | Pillar | Clusters |
|---|---|---|
| 1 | Neighbourhood Guide | NE Calgary, NW Calgary, Saskatoon hoods |
| 2 | Listing Tour & New Build | Active listings, new builds |
| 3 | Migration & Cost of Living | Toronto vs Calgary, Sask migration |
| 4 | Investment & Deal Analysis | Deal Analyzer demos, ROI breakdowns |
| 5 | Monthly Market Pulse | Calgary + Saskatoon monthly stats |
| 6 | Buyer Education | FHSA, HBP, down payment, mortgages |
| 7 | Seller Education | Seller prep, staging, net sheet |
| 8 | News & Current Events | Rate cuts, policy changes, market news |

---

## Audience Personas

| Persona | Profile |
|---|---|
| Ontario Transplant | Renting in GTA, $80–130K income, considering Calgary/Saskatoon move |
| Saskatoon Local | Current SK resident, first-time buyer or upgrader |
| First-Time Buyer | 25–35, renting, FHSA eligible, "I don't know what I don't know" |
| Calgary Investor | 35–55, owns 1–3 properties, data-driven, looking to add a unit |

---

## Blotato API (Schedule Posts)

Configure `VITE_BLOTATO_KEY` in Vercel environment variables to enable the "Schedule" button in the Episodes detail panel.

Supported platforms: Instagram · TikTok · YouTube · LinkedIn · Twitter · Facebook · Threads · Bluesky

---

## Updating Episode Status (via Claude Code)

Ask Claude Code: `"mark CT-001 as posted"` — it will update `episodes.json` in this repo, and the dashboard will refresh within 60 seconds.

---

## Deploy

```bash
cd dashboard
npm install
vercel --prod
```

Set env var: `VITE_BLOTATO_KEY=your_key_here`
