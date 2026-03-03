# Pipeline Preferences — @nasahctus
**Updated:** 2026-03-02 | **Referenced by:** Q11 content brain (file #7 in self_improvement list)

---

## Remotion Overlay Rules (Talking Head — 1080×1920)

```
TOP-RIGHT  → stat_card only (never covers face)
BOTTOM     → callout_box (never center — covers face)
BOTTOM-LEFT → lower_third (name/title card at video start)
BOTTOM     → auto_captions (bottom: 420px, above IG chrome zone)
```

- IG chrome zone: bottom 250px — NOTHING placed below this line
- Never stack stat_card AND screenshot at top-right simultaneously
- Max 6 overlays per 60-second video (prevents visual clutter)
- Corner vignettes: bottom gradient (0.60 opacity, 480px) + top-right radial (readability)

**Component sizes (confirmed readable, March 2026):**
- Auto-captions: 78px pill | 5 words/page | gold active highlight
- Stat card value: 72px gold | label: 16px | change indicator: 22px
- Callout box headline: 44px | body: 24px | maxWidth: 820px
- Lower third name: 38px | title: 22px gold | subtitle: 17px

**Edit plan field names (critical — wrong field = empty render):**
- callout_box uses `data.headline` NOT `data.text`
- lower_third uses `data.name`, `data.title`, `data.subtitle`
- stat_card uses `data.label`, `data.value`, `data.change`, `data.source`

---

## Caption Length Limits (per platform)

| Platform | Max Words | Tone | Hashtags |
|---|---|---|---|
| IG Reel | 50 words | Casual, "So" opener | 5-8 |
| IG Carousel | 150 words | Slightly more detailed | 8-12 |
| TikTok | 30-50 words | Most casual, shortest | 3-5 |
| YouTube Short | Title: 60 chars | SEO-optimized | 5-8 |
| Facebook Reel | 100 words | Community-focused, ask a question | 5-8 |
| LinkedIn | 300-500 words | Professional, data-forward | 0 (LinkedIn doesn't reward them) |
| Twitter/X | 3 tweets max | Hook → data → insight | 2-3 |

**Caption voice rules (same as video voice):**
- Never start with greeting, name, or brokerage
- "So" opener or bold first line
- Contractions always: wanna, gonna, there's
- Max 2 emojis per caption (camera + flag ok, emoji walls not ok)
- Every caption ends with question or "peace"

---

## Posting Schedule

**Weekly cadence:** Monday / Wednesday / Friday at 9:00 AM MST
**Platform stagger:** 15 minutes between each platform (prevents cross-platform suppression)

```
9:00 AM MST  → Instagram Reel
9:15 AM MST  → TikTok
9:30 AM MST  → YouTube Short
9:45 AM MST  → Facebook Reel
10:00 AM MST → LinkedIn text post
7:00 PM MST  → Instagram Story (BTS, quote card, poll)
```

**Email cadence:** 1 per topic cluster — sent Tuesday the week the cluster videos start posting.

**Best windows (Canadian audience):**
- Weekday mornings 9-11 AM MST — people browsing before work
- Evenings 7-9 PM MST — real estate content peak (browsing after work)
- Tuesday-Thursday outperforms Monday/Friday for RE content

---

## Batch Filming Order

**Session target:** 15-20 videos per 4-hour session
**Frequency:** One session every two weeks

**Shoot order (efficiency first):**
1. Golden hour exterior (first 30 min — lighting won't last)
2. Talking head office/desk content (all same outfit)
3. Outfit change #1 (every 5 videos = visual variety across the batch)
4. Interior walking/location shots
5. Outfit change #2 (optional — for very long sessions)

**Location grouping:** Film ALL videos for one location before moving
- Same location = same 15 min setup → 3-5 videos
- Different locations planned in order of travel distance

**During filming:**
- Print or open `/re content batch` output on phone — script bank in filming order
- Film each video in one take — imperfections are fine, personality comes through
- Log topic + clip number immediately after each video

---

## Hashtag Banks (mix and match per video)

**Market:**
`#calgaryrealestate #saskatoonrealestate #albertarealestate #saskatchewanrealestate`

**Neighbourhood:**
`#calgaryneighbourhoods #bowness #nwcalgary #necalgary #evanston #mahogany`

**Role:**
`#calgaryrealtorlife #saskatoonrealtor #exprealty #redleafhomes #hasansharif`

**Topic:**
`#firsttimehomebuyer #realestatetips #mortgagetips #homebuying #homeselling`
`#investmentproperty #rentalincome #gardensuite #garagesuite #closingcosts`
`#cmhcinsurance #downpayment #fhsa #firsthomesavingsaccount`

**Migration:**
`#movingtocalgary #movingtoalberta #movingtosaskatoon #canadianrealestate`
`#leavingontario #leavingtoronto #costoflivingcanada`

**Broader:**
`#canadianmortgage #canadianrealtor #realestatecanada`

---

## Tools Preferences

| Tool | Use Case | Notes |
|---|---|---|
| CapCut Pro | Main video edit — captions, transitions, music | Primary editing tool |
| Canva Pro | Background infographics, data card overlays | Static graphic backdrops behind talking head |
| Remotion + Claude Code | Automated motion graphics (stat cards, maps, timelines) | Use pipeline:transcribe → pipeline:render |
| Whisper MCP | Audio transcription → word-level SRT | Must use word-level (not sentence) for auto-captions |
| Apify | Competitor research, audience question mining, YouTube transcripts | Monthly research runs |
| Firecrawl | Fresh stats from CREB, SRA, Calgary.ca, CMHC | For news content + updating data |
| Sequential Thinking MCP | Complex cluster planning, data analysis | For `/re content cluster` on ambiguous topics |
| ElevenLabs TTS | AI voiceover for no-camera stat reels | For Pillar 5 (Market Pulse) and Pillar 2 (Then vs Now) |

---

## Remotion Project

**Location:** `tools/remotion/`
**Pipeline commands:**
```bash
cd "/Users/owner/Downloads/Real Estate/tools/remotion"
npm run pipeline:transcribe -- --input public/<name>.mov
npm run pipeline:trim -- --input public/<name>.mov --trim [N]   # optional
npm run pipeline:render -- --input public/<name>.mov
```
**Output:** `output/<name>_final.mp4` (1080×1920, 30fps, H.264)

**Remotion template library (priority order):**
1. Market Pulse Card — weekly stat drops
2. Neighbourhood Map — Calgary area breakdowns
3. Price Timeline — Then vs Now animated chart
4. Comparison Table — side-by-side cost comparison
5. Intro/Outro Bumper — branded 2s opener + 3s closer
6. Auto-Captions Overlay — Whisper word-level → animated captions
7. AI Voiceover Reel — TTS over animated graphic
