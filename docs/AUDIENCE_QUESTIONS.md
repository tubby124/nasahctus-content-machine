# Audience Questions — What Personas Are Searching
**Last Updated:** 2026-03-02 | **Refresh:** Monthly via `/re content research` (Apify + YouTube scraper)

---

## How This File Works

These are the real questions the 4 personas are typing into Google, YouTube, and TikTok.
Every piece of content should answer one of these questions — explicitly or implicitly.
Run `/re content research` monthly to add new questions from YouTube comment mining + Apify audience scraper.

---

## Persona 1: Ontario Transplant
**Who:** 28-42, leaving GTA/Ottawa/Hamilton for affordability. Has $80-120K saved. Scared of making the wrong move.

### Questions They're Typing:
**YouTube / Google search:**
- "Is Calgary worth moving to in 2026"
- "Calgary vs Toronto cost of living comparison"
- "What's the best neighbourhood in Calgary for families"
- "Calgary neighbourhood guide for newcomers"
- "Is NE Calgary safe"
- "Calgary rent 2026 average"
- "How much to buy a house in Calgary 2026"
- "What do you need to buy a house in Canada"
- "Is it worth buying vs renting in Calgary"
- "Calgary real estate forecast 2026"
- "What's it like to live in NW Calgary"
- "Hidden costs of buying a house Alberta"
- "Bowness Calgary neighbourhood review"
- "U-Haul migration data Alberta 2025"

**TikTok / Instagram (shorter intent):**
- "Moving to Calgary from Ontario"
- "Calgary rent dropped"
- "Ontario to Alberta move"
- "Calgary affordable neighbourhoods"
- "Calgary real estate agent"

**What Makes Them DM:**
- Specific dollar figures: "$1,100/month saved vs Toronto"
- Honest personal take: "I actually live in Bowness — here's the truth"
- Data they can show a partner: U-Haul stats, vacancy rates, price history

---

## Persona 2: Saskatoon Local
**Who:** 30-50, grew up in SK or has lived there 10+ years. Thinks about buying/investing but always waits.

### Questions They're Typing:
**YouTube / Google search:**
- "Saskatoon real estate market 2026"
- "Is it a good time to buy in Saskatoon"
- "Saskatoon vacancy rate 2026"
- "Saskatoon rental income property"
- "Saskatoon average house price 2026"
- "Best areas to invest in Saskatoon"
- "Saskatoon rent going up or down"
- "Should I buy or rent in Saskatoon"
- "How long does it take to sell a house in Saskatoon"

**TikTok / Instagram:**
- "Saskatoon housing market"
- "Saskatoon real estate"
- "Is Saskatoon a good investment"
- "Saskatoon first time buyer"

**What Makes Them DM:**
- Urgency framing: "Saskatoon vacancy is 1%. That means..."
- Contrarian take: "Most people think Saskatoon prices are high — here's what the data says"
- Social proof: "48 showings, 11 offers" — a specific local deal story

---

## Persona 3: First-Time Buyer
**Who:** 25-35, renting in Calgary or Saskatoon. Has some savings but doesn't understand the process. Thinks they need 20% down.

### Questions They're Typing:
**YouTube / Google search:**
- "FHSA explained Canada 2026"
- "First time home buyer programs Alberta 2026"
- "First time home buyer programs Saskatchewan 2026"
- "How much do I need to buy a house in Canada"
- "FHSA vs RRSP home buyers plan"
- "Can I use FHSA and HBP together"
- "How much down payment for first home Canada"
- "What is HBTC Canada"
- "30 year amortization first time buyer 2026"
- "First time buyer grants Canada"
- "Steps to buying a house in Canada"
- "How does a mortgage work Canada"
- "Calgary first time buyer programs"
- "Is $500K enough to buy in Calgary"

**TikTok / Instagram:**
- "First time home buyer Canada"
- "FHSA explained"
- "How to buy your first house"
- "Can I buy a house in Calgary on one income"
- "Home buyer programs Canada"

**What Makes Them DM:**
- Revelation of money they didn't know about: "$40K + $60K = $100K per person you probably didn't know you could use"
- Simplification: "Here are the 5 steps, in order, no fluff"
- Permission to start: "You don't need 20% down — here's the real number"

---

## Persona 4: Calgary Investor
**Who:** 35-55, already owns at least one property. Has equity. Wants cash flow or a second property. Understands basics.

### Questions They're Typing:
**YouTube / Google search:**
- "Calgary investment property 2026"
- "Best areas to invest in Calgary 2026"
- "Calgary rental property cap rate"
- "Garden suite Calgary permit 2026"
- "How much does a garden suite add in value Calgary"
- "Calgary NE investment properties"
- "Basement suite Calgary investment"
- "BRRRR strategy Calgary"
- "How to analyze a rental property Canada"
- "What is a good cap rate in Calgary"
- "Calgary real estate cash flow 2026"
- "Multi-family properties Calgary"
- "Garden suite permit fee waiver Calgary"
- "Calgary ADU income"

**TikTok / Instagram:**
- "Calgary investment property"
- "Garden suite Calgary"
- "How to analyze a rental deal"
- "Real estate investing Calgary"
- "Cap rate explained"

**What Makes Them DM:**
- Deal analyzer demo on a real property: "I plugged this Bowness listing in — here's what it returned"
- Specific return numbers: "This $450K NE property cash flows $400/month after mortgage"
- News they missed: "Garden suite permit fee waived until Dec 2026 — here's the math"

---

## Cross-Persona Question Themes (All 4 Watch These)

These are universal hooks — any persona stops scrolling:

| Question Theme | Hook Frame | Pillar |
|---|---|---|
| "Is Calgary real estate going up or down?" | Stakes/Numbers | 5 — Market Pulse |
| "What would $500K buy in [area]?" | Before/After | 1 — Neighbourhood |
| "How much did THIS property actually make?" | Proof | 6 — Real Deal Stories |
| "What did prices look like 5 years ago?" | Time contrast | 2 — Then vs Now |
| "Should I buy now or wait?" | Contrarian | 5, 3, 1 |

---

## YouTube Comment Mining (Add Monthly)

When running `/re content research`, scrape comments from:
- Top 10 competitor videos (Tyler Hassman, Igor Ryltsev, Justin Havre)
- Calgary/Saskatoon real estate YouTube channels
- Extract: literal questions in comments → add to relevant persona section above

**Apify actor for this:** `apify/youtube-scraper` → filter by `videoUrl` of top competitor vids → extract `commentText` → parse questions

---

## Monthly Refresh Log

| Month | New Questions Added | Source |
|---|---|---|
| March 2026 | Initial seed — compiled from persona profiles + Q11 research data | Manual |
| _(next)_ | | |
