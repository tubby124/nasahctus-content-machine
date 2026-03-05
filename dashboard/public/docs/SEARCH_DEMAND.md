# Search Demand — YouTube / Google / TikTok Volume Data
**Last Updated:** 2026-03-02 | **Refresh:** Monthly via `/re content research` (Firecrawl + Apify)

---

## How This File Works

This file tracks **search volume and content gap data** — what people are actually searching for,
how much demand exists, and which competitor has (or hasn't) claimed that territory.
Use this to prioritize which clusters to film first and which blog posts to write for SEO.

**Run `/re content research` monthly to refresh:**
- Firecrawl: Google search results for top queries → count results, check who ranks
- Apify: YouTube search → count video results, check view counts of top 5 videos
- Apify: TikTok search → check top creator view counts on topic

---

## Priority Keyword Clusters (Seed — Needs Apify Validation)

### CLUSTER A: Calgary Migration (Pillar 3 — highest demand)

| Keyword | Estimated Volume | Top YouTube Result | Hasan Ranked? |
|---|---|---|---|
| "moving to Calgary from Ontario" | HIGH | Lifestyle vloggers, no RE agent | No |
| "Calgary vs Toronto cost of living" | HIGH | Generic comparison articles | No |
| "Calgary real estate 2026" | HIGH | Justin Havre, Tyler Hassman | No |
| "is it worth moving to Calgary" | MEDIUM | Personal vlogs | No |
| "best neighbourhood Calgary families" | MEDIUM | Lifestyle blogs | No |
| "Calgary rent 2026" | HIGH | News articles | No |
| _(Validate via Apify YouTube scraper)_ | | | |

**Content gap:** Nobody is doing this as a real estate agent with data + personal story combo.
Tyler does lifestyle but no data. Havre does data but no personality. **Blue ocean.**

---

### CLUSTER B: Saskatoon Market (Pillar 5 — first mover advantage)

| Keyword | Estimated Volume | Top YouTube Result | Hasan Ranked? |
|---|---|---|---|
| "Saskatoon real estate 2026" | MEDIUM | 0-1 local RE agents | No |
| "Saskatoon rental market" | MEDIUM | Generic news | No |
| "is Saskatoon a good place to buy" | MEDIUM | Random vlogs | No |
| "Saskatoon vs Calgary" | LOW-MEDIUM | 0 dedicated videos | No |
| "Saskatoon investment property" | LOW | Almost nothing | No |
| _(Validate via Apify YouTube scraper)_ | | | |

**Content gap:** WIDE OPEN. Ziegler has 988 followers. Nobody is doing Saskatoon educational RE content.
**First video in this space could dominate for months with zero competition.**

---

### CLUSTER C: First-Time Buyer Programs (Pillar education — national audience)

| Keyword | Estimated Volume | Top YouTube Result | Hasan Ranked? |
|---|---|---|---|
| "FHSA explained Canada" | HIGH | Generic financial channels, no RE agent | No |
| "first time home buyer programs Canada 2026" | HIGH | Government, big banks | No |
| "FHSA vs HBP" | MEDIUM | Finance YouTubers | No |
| "how much down payment Canada" | HIGH | Banks, generic | No |
| "30 year amortization first time buyer" | MEDIUM | News, no local RE | No |
| _(Validate via Apify YouTube scraper)_ | | | |

**Content gap:** Finance YouTubers explain FHSA but don't connect it to "here's what you can buy in Calgary/Saskatoon with this." Hasan bridges that gap — program explanation → local market application.

---

### CLUSTER D: Investment Properties (Pillar 4 — active investor audience)

| Keyword | Estimated Volume | Top YouTube Result | Hasan Ranked? |
|---|---|---|---|
| "Calgary investment property 2026" | MEDIUM | Tyler Hassman (listings only) | No |
| "garden suite Calgary permit" | MEDIUM | Calgary.ca, DIY content | No |
| "cap rate explained simple" | MEDIUM | Finance channels | No |
| "Calgary basement suite income" | LOW-MEDIUM | 0 dedicated videos | No |
| "how to analyze rental property Canada" | MEDIUM | Generic REI channels | No |
| _(Validate via Apify YouTube scraper)_ | | | |

**Content gap:** Nobody demos a real deal analyzer tool on a real property. The "I built a tool — let me show you a real property" angle has zero competition.

---

### CLUSTER E: Neighbourhood Guides (Pillar 1 — long-tail SEO)

| Keyword | Estimated Volume | Top Result | Notes |
|---|---|---|---|
| "NE Calgary neighbourhood guide" | LOW-MEDIUM | Lifestyle blogs | Low comp |
| "Bowness Calgary review" | LOW | Personal blogs | Zero RE content |
| "NW Calgary best neighbourhoods" | MEDIUM | Generic blogs | No video content |
| "Cornerstone vs Redstone Calgary" | LOW | Almost nothing | HUGE gap |
| "Evanston Calgary 2026" | LOW | Nothing | First mover |
| _(Validate via Apify YouTube scraper)_ | | | |

**Long-tail strategy:** Low volume but zero competition. One 8-minute YouTube guide = top result for years.
Short-form cuts from that YouTube video = awareness funnel feeding the long-form.

---

## Blog SEO Priority (Firecrawl Validation Needed)

Run Firecrawl on these queries to check:
1. What's ranking on page 1?
2. Are any local Calgary/SK RE agents ranking?
3. What's the DR (domain rating) of top results? (Low DR = opportunity)

| Blog Topic | Target Keyword | Competition Est. | Priority |
|---|---|---|---|
| Calgary vs Saskatoon Cost of Living 2026 | "Calgary vs Saskatoon living" | LOW | 🔴 High |
| First-Time Buyer Programs AB + SK 2026 | "first time buyer Alberta 2026" | MEDIUM | 🔴 High |
| NE Calgary Complete Guide | "NE Calgary neighbourhood guide" | LOW | 🟡 Medium |
| Garden Suite Calgary ROI Guide | "garden suite Calgary investment" | LOW | 🟡 Medium |
| Calgary Closing Costs 2026 | "Alberta closing costs 2026" | MEDIUM | 🟡 Medium |
| How to Analyze a Rental Property | "rental property analysis Canada" | MEDIUM | 🟡 Medium |
| Saskatoon Market Forecast 2026 | "Saskatoon real estate 2026" | LOW | 🔴 High (first mover) |

---

## TikTok / Instagram Hashtag Demand

_To be populated via Apify TikTok scraper — search each hashtag, note top post views._

| Hashtag | Category | Est. Views on Top Post | Notes |
|---|---|---|---|
| #calgaryrealestate | Market | _(scrape)_ | High comp, still worth it |
| #calgaryrealtor | Role | _(scrape)_ | Lower comp |
| #saskatoonrealestate | Market | _(scrape)_ | Almost no local content |
| #movingtocalgary | Migration | _(scrape)_ | Growing due to Ontario exodus |
| #fhsa | Education | _(scrape)_ | National audience |
| #calgaryhomes | Neighbourhood | _(scrape)_ | Tyler Hassman owns this |
| #firsttimehomebuyer | Education | _(scrape)_ | High comp but huge audience |
| #albertarealestate | Market | _(scrape)_ | Broad but useful |

---

## Competitor Content Gaps (YouTube Transcript Analysis)

_Run Apify YouTube transcript scraper on top 5 videos from each competitor monthly._
_Look for: topics they NEVER cover, questions in comments they never answered._

| Competitor | Videos Scraped | Gaps Found | Month |
|---|---|---|---|
| @tylerhassman | _(run scraper)_ | _(populate)_ | — |
| @igorryltsev | _(run scraper)_ | _(populate)_ | — |
| @justinhavre | _(run scraper)_ | _(populate)_ | — |

---

## Firecrawl Targets (Monthly Refresh)

These URLs get scraped each `/re content research` run for fresh data:

| URL | What to Extract | Used In |
|---|---|---|
| creb.com/stats | Monthly CREB stats (sales, prices, inventory) | Pillar 5 Market Pulse |
| saskatoonrealestate.net | SRA monthly stats | Pillar 5 (SK) |
| cmhc-schl.gc.ca | Vacancy rates, rental reports | Pillar 3, 4 |
| calgary.ca/planning | New developments, zoning changes | Pillar 8 News |
| saskatoon.ca | City announcements, programs | Pillar 8 News (SK) |
| ratehub.ca/mortgage-rates | Current best rates | All deal analysis |

---

## Monthly Refresh Log

| Month | Apify Run | Firecrawl Run | Key Findings |
|---|---|---|---|
| March 2026 | Not yet | Not yet | Initial skeleton — all data pending validation |
| _(next run)_ | | | |
