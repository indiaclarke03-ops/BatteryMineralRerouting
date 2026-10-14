# Paper Trail: Build Plan (demo tonight)

> As built (14 Oct 2026):
> - The repo is `BatteryMineralRerouting`.
> - UI fonts are IBM Plex Sans and Mono instead of Inter and JetBrains Mono. Inter overlapped with the passport project.
> - Explore logic lives in `assets/js/explore.js`.
> - Lucide and Scrollama are not used in Iteration 1.

**For the VS Code agent:** read `concept.md` first, then work through `backlog.md` P0 items in order. **Hard deadline: class demo this evening (Wed 14 Oct 2026).** Favor a working, honest v1 over a feature-complete one. Cut scope before cutting quality.

---

## 0. Ground rules

1. **Static site, no secrets in the browser.** Query Sayari and Tavily through MCP in VS Code only. Save curated results to `/data/*.json`.
2. **Log every call** to `data/call_log.json`: `{id, timestamp, server: "sayari"|"tavily", tool, params, question, purpose, result_summary, interpretation, scorecard: "worked"|"partial"|"failed", entity_ids[]}`. The Method page renders this file as the investigation replay and the capability scorecard. **The point of the assignment is to demonstrate Sayari MCP usage, so making the tool use visible matters as much as the findings.**
3. **Label every edge** with `edge_type` (`transactional` | `contractual` | `inferred`) and `confidence` (`documented` | `corroborated` | `inferred` | `lead`), plus `source_call_ids`.
4. **Careful language.** Never write that a named company "evades", "launders" or "circumvents". Use "pattern consistent with…" or "warrants due diligence".
5. **Publish derived data only.** No raw Sayari record dumps.
6. **Different from *Passport with Gaps*, but build on it where relevant.** Paper Trail gets its own visual identity (§6). From the passport repo, take only what's useful: the passport field list and definitions for the Passport vs. Paper Trail card, the declared-vs-observed gap logic, and any reusable data or helper code. Don't copy its styling, layout or page structure. If the repo isn't in the workspace, ask me for the URL, but don't block on it; the card can be built from the EU Battery Regulation passport fields directly.
7. Commit small and often. Push early so Pages is live from hour one.

## 1. Setup (15 min)

- Confirm Sayari MCP is connected per the course *Sayari MCP Onboarding Guide*: call `get_investigation_guidance` with any query.
- Confirm Tavily MCP: run one `tavily_search`.
- Create public repo `battery-paper-trail`. Enable Pages (Settings → Pages → deploy from `main` / root). Push a placeholder `index.html` and confirm the URL loads.

## 2. Repo structure

```
battery-paper-trail/
├── index.html          # Home: The Trace (step-through)
├── explore.html        # Interactive graph
├── cases.html          # Case files + Passport vs Paper Trail cards
├── method.html         # Playbook + rubric + call log
├── about.html          # About this tool
├── assets/
│   ├── css/  tokens.css  base.css  components.css
│   └── js/   data.js  graph.js  stepper.js  calllog.js  cases.js  ui.js
├── data/
│   ├── entities.json  edges.json  cases.json
│   ├── call_log.json  policy_timeline.json  sources.json
│   └── schema.md
├── investigation/  playbook.md  notes/
├── concept.md  plan.md  backlog.md  README.md  CHANGELOG.md  LICENSE (MIT)
```

## 3. Open-source stack (CDN, no build)

| Need | Library | Notes |
|---|---|---|
| Network graph | **Cytoscape.js** + **cytoscape-dagre** (+ dagre) | Left-to-right layout: origin → transit → US. Edge styles by type |
| Step-through on Home | **Scrollama** (optional) | A simple prev/next stepper is fine if short on time |
| Call-log search | **Fuse.js** | Fuzzy search over tool, purpose and entity |
| Icons | **Lucide** | Edge-type and confidence icons |
| Iteration 2 corridors | **D3** + **d3-sankey** | Not tonight |
| Optional cross-checks | **OpenSanctions** (non-commercial), **UN Comtrade**, **Federal Register**, **USITC DataWeb** | Cite in `sources.json` and About |

Load from `cdnjs.cloudflare.com` or `cdn.jsdelivr.net`, with pinned versions. Credit every library on the About page.

## 4. Data model

**entities.json**
```json
{ "id": "sayari_entity_id", "name": "", "country": "IDN", "type": "company|person",
  "role": "parent|producer|transit_plant|trader|us_buyer",
  "risk_flags": [], "identifiers": {"lei": ""}, "summary": "our words, one sentence",
  "source_call_ids": ["s003"] }
```
**edges.json**
```json
{ "id": "e001", "source": "", "target": "",
  "relation": "ships_to|owns|subsidiary_of|director_of|shares_address|possibly_same_as|risk_adjacent",
  "edge_type": "transactional|contractual|inferred",
  "confidence": "documented|corroborated|inferred|lead",
  "hs_codes": ["3801"], "first_seen": "", "last_seen": "", "shipment_count": null,
  "evidence": "short note in our words", "source_call_ids": ["s007"] }
```
**cases.json**: per case: `id, title, question, steps[] {title, text, edge_ids[]}, passport[] {field, declared, paper_trail, gap: bool}, red_flags[], overall_confidence, caveats[]`.
**policy_timeline.json**: `{date, measure, relevance, source_url}`.

## 5. Investigation playbook (Sayari + Tavily)

**HS codes (confirmed with `lookup_hs_codes`):** 2504/250410 natural graphite; 3801/380110 artificial graphite; 380190 graphite preparations; 850760 Li-ion accumulators; 282520 lithium hydroxide; 283691 lithium carbonate. US customs scope for active anode material: HTSUS 2504.10, 3801.10, 3801.90.

**Case 1 (anchor): PT Indonesia BTR New Energy Material.** Seed IDs: `2omCekb1pDRKjhFOAqCNSw` (primary; LEI 254900G3L2Z0HNRV7W43), `dH3rqoht5wahpKLPJih3gA`, `ekoH1fr8BGvHc7UqYCY_YA`.

1. **Entity resolution (inferred):** `get_entity_summary` on all three IDs. Compare addresses (Morowali IMIP / Kendal / Jakarta Barat), identifiers and flags. Record `possibly_same_as` edges with confidence and reasoning.
2. **Ownership (contractual):** `find_beneficial_owners` and `get_entity_profile` on the primary ID. Is there a path to BTR New Material Group (China) or another Chinese parent? Record `owns`/`subsidiary_of` edges. `search_entities` for "BTR New Material Group" to get the parent ID.
3. **Upstream (transactional):** `get_upstream_supply_chain` with `product: ["3801","2504"]`. Does it import graphite or precursors from China? That's the "same product in, same product out" signature.
4. **Downstream (transactional):** `search_shipments` with `shipper_name` set to the BTR Indonesia name, no `arrival_country`, then filtered to the USA. Also try `search_buyers` for HS 3801 departing IDN. **If US flows are 0, record that as a finding** ("trail goes dark") and check where its output goes instead (Korea, Japan, EU).
5. **Inferred links:** `check_watchlist`, `traverse_network` (depth 2), and `find_shortest_path` from the plant to the Chinese parent and to any US buyer found. Explain each flag with `lookup_risk_factors` (e.g. `chinese_soe_adjacent`, `psa_imports_from_usa_bis_entity`).

**Transactional fallback (P0, max 20 minutes).** If Case 1 has no shipment edges at all after steps 3–4, a demo without a real trade link fails the "transactional" part of the brief. Run `search_trade_facets` / `search_suppliers` (HS 3801, arrival USA, departure KOR/VNM/MYS/THA/MEX) and pick **one** third-country supplier with US buyers. Check its ownership with `find_beneficial_owners`. Use it as Case 1b, or attach it to Case 1 as the "what a complete trail looks like" comparison. Inbound China → Indonesia shipments also count as transactional edges; US-bound flow isn't required, but at least one real shipment edge is.

**Record for every step (feeds the replay and scorecard):** `question` (plain English), `tool`, `params`, `result_summary`, `interpretation`, `scorecard: worked|partial|failed`, `why`. Add these fields to `call_log.json` entries.

**Case 2 (if time; otherwise backlog):** pick from corridor scans (`search_trade_facets`, scope=suppliers, HS 3801, arrival USA, by departure country: KOR, VNM, MAR, MYS, THA, MEX). Prefer a Chinese-owned third-country supplier with US buyers, or a "looks risky but legitimate explanation" contrast case.

**Tavily (context and verification):**
- Re-verify every row in `policy_timeline.json` (concept §2) and save source URLs.
- Company context: BTR's Indonesia and Morocco plants; Zhongke Electric's Oman project; China's graphite export-control updates.
- Use `tavily_extract` on primary sources (Federal Register, IRS Notice 2026-15, USITC) for exact dates.
- Log every Tavily call in `call_log.json`. Paraphrase sources; don't paste article text.

**Red-flag rubric** (adapted from Sayari investigation guidance; store in `investigation/playbook.md` and show on the Method page):

| Flag | Signal | Severity |
|---|---|---|
| Chinese parent/SOE ownership of transit plant | contractual | High (PFE relevance) |
| Same HS imported from China and exported to the US | transactional | High |
| Recent incorporation vs. first export date | contractual | Medium |
| Volume spike after a policy date | transactional | Medium |
| Shared address / officer with flagged entity | inferred | Medium |
| Entity-resolution fragmentation (multiple records) | inferred | Low, but disclose it |
| Forced-labor / UFLPA sub-tier flags | inferred | Medium |

## 6. Design direction

- **Look:** its own identity, distinct from *Passport with Gaps*. Direction: an "investigator's case file" feel. Off-white paper background (#FAFAF7), ink text (#1A1A1A), one accent (deep teal), subtle grid lines, monospace for IDs, HS codes and call logs.
- **Edges:** transactional = blue, solid; contractual = purple, dashed; inferred = amber, dotted. Risk = red, used sparingly.
- **Type:** a serif for headings (e.g. Source Serif 4), Inter for UI, JetBrains Mono for data, via Google Fonts. Use different choices from the passport project if they overlap.
- **Graph:** dagre, left-to-right; parents above; node size by shipment count; sticky legend; side panel on click; list view under 640px.
- **Projector-friendly:** minimum 18px body text on Home, high contrast, and a keyboard-driven stepper (← →) for presenting.

## 7. Timeline for today (adjust to your actual class time)

| Block | Work |
|---|---|
| **T+0:00–0:15** | Setup: repo, Pages live, MCPs verified |
| **T+0:15–1:15** | Investigation Case 1 (playbook §5, steps 1–5) plus Tavily policy verification. Write `entities`, `edges`, `cases`, `call_log` and `policy_timeline` JSON |
| **T+1:15–2:15** | Explore graph (Cytoscape, filters, side panel, legend) and Method page (call log with Fuse search) |
| **T+2:15–3:00** | Home stepper, Case Files with the Passport vs. Paper Trail card, About page |
| **T+3:00–3:30** | QA (§8), mobile/projector check, README, push, submit URLs |
| **Remaining** | Rehearse the 3-minute walkthrough (`investigation/notes/demo-script.md`) |

If you're behind at T+2:15, drop the Home animation (use a static numbered stepper) and keep only Case 1.

## 8. Pre-demo checklist

- [ ] Pages URL loads all 5 pages; nav works
- [x] Every edge has `edge_type`, `confidence` and `source_call_ids`
- [x] All three edge types appear in Case 1, with at least one real shipment edge (use the fallback if needed)
- [x] Verdict panel (detected / suggested / not visible) on Home
- [x] Method page shows the replay and capability scorecard
- [x] No API keys or raw dumps in the repo (`git grep -i -E "key|token|secret"`)
- [x] Policy dates sourced; "as of 14 Oct 2026" shown
- [x] No accusatory language (search for "evad", "launder", "circumvent")
- [ ] Works at 375px width and on a projector; keyboard focus visible
- [x] Open-source credits and the limitations section on the About page
- [ ] Repo URL and Pages URL submitted

## 9. After class

Capture feedback in `feedback/2026-10-14.md`, convert it into `FB-*` backlog items, then plan Iteration 2: Corridors Sankey, Case 2, EU destination, OpenSanctions/Comtrade cross-checks, accessibility pass.
