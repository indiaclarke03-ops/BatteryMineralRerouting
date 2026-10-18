# Paper Trail: Backlog

**P0** = needed for tonight's demo (Wed 14 Oct 2026) · **P1** = Iteration 2, after feedback · **P2** = stretch
Work P0 top to bottom. Status values: `todo` / `doing` / `done`.

> Repo is `BatteryMineralRerouting` (not `battery-paper-trail`), at India's request. Pages URL: https://indiaclarke03-ops.github.io/BatteryMineralRerouting/

---

## SETUP
| ID | P | Story | Done when | Status |
|---|---|---|---|---|
| SET-1 | P0 | Create public repo with the structure in plan §2; MIT license | Repo pushed | done (initial push); later pushes need India's OK |
| SET-2 | P0 | Enable GitHub Pages from `main` / root | Live URL loads placeholder | done |
| SET-3 | P0 | Verify Sayari MCP and Tavily MCP in VS Code | One test call each succeeds and is logged | done (s001, t001) |
| SET-4 | P0 | `.gitignore` for `.env` and keys; secret grep before every push | `git grep` clean | done |
| SET-5 | P0 | README with purpose, both URLs, how to reproduce, credits | Renders on GitHub | done |

## DATA & SOURCES
| ID | P | Story | Done when | Status |
|---|---|---|---|---|
| DATA-1 | P0 | `data/schema.md` plus seed JSON files (plan §4) | Files committed | done |
| DATA-2 | P0 | Call-log convention for Sayari and Tavily | Every call logged with id, tool, params, purpose, summary | done (38 calls) |
| POL-1 | P0 | Verify the policy timeline with Tavily | `policy_timeline.json` with source URLs | done (3 corrections, 2 additions) |
| DATA-0 | P1 | Ask the instructor what Sayari-derived data may be published publicly | Answer in `investigation/notes/data-permissions.md` | todo |

## INVESTIGATION (Sayari MCP)
| ID | P | Story | Done when | Status |
|---|---|---|---|---|
| INV-1 | P0 | Pull `get_investigation_guidance` and `lookup_risk_factors`; write the rubric | Rubric in `investigation/playbook.md` | done |
| INV-2 | P0 | Entity resolution on the three BTR Indonesia IDs | `possibly_same_as` edges with reasoning | done (found 5 records) |
| INV-3 | P0 | Ownership: `find_beneficial_owners` / `get_entity_profile`; find the Chinese parent ID | Contractual edges recorded | done (no registry ownership; open-source edge labelled) |
| INV-4 | P0 | Upstream: `get_upstream_supply_chain` (product 3801, 2504) | Transactional inbound edges | done |
| INV-5 | P0 | Downstream: shipments to US buyers | Transactional outbound edges | done (19 rows, 8 US buyers) |
| INV-6 | P0 | Inferred: `check_watchlist`, `traverse_network`, `find_shortest_path` | Inferred edges with confidence | done |
| INV-6b | P0 | Transactional fallback | ≥1 real shipment edge in the demo | not needed (Case 1 has shipment edges) |
| INV-7 | P0 | Score with the rubric; write Case 1 in `cases.json` | Case renders | done |
| INV-7b | P0 | Fill `question`, `interpretation` and `scorecard` on every call-log entry | Replay and scorecard render from data | done |
| INV-8 | P1 | Corridor scans: HS 3801 → USA by departure KOR/VNM/MAR/MYS/THA/MEX; pick Case 2 | `cases.json` has 2 cases | done: five cases (Case 5 from the scans) |
| INV-9 | P1 | Contrast case: a flagged-looking supplier with a legitimate explanation | Case written | todo |
| INV-10 | P2 | Unit-price anomaly check where value data exists | Flag per edge | todo |
| INV-11 | P2 | Cross-check entities against OpenSanctions; baseline corridors with UN Comtrade | Noted in `sources.json` | todo |

## UI
| ID | P | Story | Done when | Status |
|---|---|---|---|---|
| UI-1 | P0 | Paper Trail's own design system | `tokens.css` done; distinct from the passport project | done (Source Serif 4 / IBM Plex, paper + teal) |
| UI-2 | P0 | Shared nav and footer; legend component | On all pages; works on mobile | done |
| UI-3 | P0 | Explore: Cytoscape + dagre graph from JSON | Renders Case 1 network | done |
| UI-4 | P0 | Explore filters: edge type, country, HS code, risk flag | Instant toggle | done (+ confidence) |
| UI-5 | P0 | Explore side panel with "How we know" links | Click works | done |
| UI-6 | P0 | Method: replay, rubric, scorecard, Fuse.js call log | Readable on a projector; searchable | done |
| UI-6b | P0 | Verdict panel on Home | Present and sourced | done |
| UI-6c | P1 | Playbook rendered as a page | Linked from Method | todo (linked as Markdown on GitHub for now) |
| UI-7 | P0 | About this tool | All sections present | done |
| UI-8 | P0 | Case Files with the Passport vs. Paper Trail card | Renders from `cases.json` | done |
| UI-9 | P0 | Home: hero, policy strip, 5-step stepper (← →), feedback block | Presentable on a projector | done |
| UI-10 | P1 | Scrollama scrollytelling version of Home | Smooth; falls back on mobile | todo |
| UI-11 | P1 | Corridors page: D3 Sankey | Renders | todo |
| UI-12 | P1 | Graph list view under 640px | Usable on phone | done early (list view on Home and Explore) |
| UI-13 | P2 | Export a case as a PNG/PDF briefing | Download works | todo |
| UI-14 | P2 | Dark mode | Follows system setting | todo |

## QA
| ID | P | Story | Done when | Status |
|---|---|---|---|---|
| QA-1 | P0 | Language and confidence review | plan §8 passes | done (grep clean; every edge badged) |
| QA-2 | P0 | Mobile and projector check; keyboard focus visible | No horizontal scroll | done at 500px and 1400px in headless Chrome; check 375px on a real phone |
| QA-3 | P1 | Lighthouse accessibility ≥ 90 | Report saved | todo |
| QA-4 | P1 | Re-run 3 random logged calls | `investigation/notes/verification.md` | done (all headline claims, 18 Oct) |

## DEMO
| ID | P | Story | Done when | Status |
|---|---|---|---|---|
| DEMO-1 | P0 | 3-minute script | `investigation/notes/demo-script.md` | done |
| DEMO-2 | P0 | Submit the repo URL and Pages URL | Submitted | todo (India) |
| DEMO-3 | P1 | Log class feedback; convert into `FB-*` items | Items added | todo |
| DEMO-4 | P1 | CHANGELOG plus About-page changelog for Iteration 2 | Visible | todo |

## FEEDBACK (India, 14 Oct, before class)
| ID | P | Story | Status |
|---|---|---|---|
| FB-1 | P0 | Clearer for non-experts: visual intro, overview, key numbers | done |
| FB-2 | P0 | Look at more than one plant | done (5 cases) |
| FB-3 | P0 | Rename "Corroborated" and explain and justify the confidence ratings on the site | done ("Cross-checked"; About → How we rate confidence) |
| FB-4 | P0 | Name all companies, including US buyers | done (individuals withheld) |
| FB-5 | P0 | Do Morocco and Zhongke; aim for 5 solid cases | done |

| FB-6 | P0 | Name individuals where relevant, with their roles | done |
| FB-7 | P0 | Clearer, nicer, more interactive network graph | done |
| FB-8 | P0 | For each case, make the question, the answer and why it matters clear | done |
| FB-9 | P0 | More case studies | done (8 cases) |
| FB-10 | P0 | Remove the feedback box from the home page | done |

| FB-11 | P0 | Home: new headline, no graph or verdict, simpler findings, new format for the cross-case findings | done |
| FB-12 | P0 | Explore graph: clarity, professionalism, UX | done (four-column layout, case tabs) |
| FB-13 | P0 | Check a Buyer page | done |
| FB-14 | P0 | World map | done (home page) |
| FB-15 | P0 | Due Diligence page (screening, questions, watch list) | done |
| FB-16 | P0 | Full re-check and debug | done (verification.md; links, JS errors, 375px) |

## Parking lot
- Zhongke Electric's Oman anode project as a forward-looking case (production targeted for 2027).
- Downstream view: which US OEMs sit below a flagged plant (`find_downstream_entities`).
- A due-diligence question generator: given an entity, list the red flags that fired and the questions a buyer should ask.
- Extend to cobalt (DRC → China → third country) and nickel (Indonesia → US) corridors.
- Why do battery-maker shipments in the Case 1 results stop after Aug 2025? Re-query with date windows.
