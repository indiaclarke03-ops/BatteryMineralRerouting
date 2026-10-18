# Paper Trail

*Tracing battery-mineral rerouting with Sayari MCP.*

**Live site:** https://indiaclarke03-ops.github.io/BatteryMineralRerouting/
**Repo:** https://github.com/indiaclarke03-ops/BatteryMineralRerouting

> Can trade and corporate-registry data reveal Chinese battery materials, especially graphite anode material, being rerouted through third-country plants before they reach US battery supply chains?

Paper Trail traces **twelve cases** end to end:

| # | Case | What Sayari showed |
|---|---|---|
| 1 | BTR's anode plant, Indonesia | Chinese graphite in; about 55 rows of HS 3801 out to Ultium Cells, SK Battery America, StarPlus, GM and Tesla (some loaded in Singapore). No registry ownership: the BTR link comes from open sources |
| 2 | BTR's anode plant, Tangier, Morocco | The reverse: 100% BTR ownership is visible through Singapore; the first graphite arrived from BTR Indonesia in Aug 2026, and there are no exports yet. The 3,088-row "Morocco → US graphite" corridor is mostly mislabelled fertilizer |
| 3 | Zhongke Electric's plant, Sohar, Oman | Not in Sayari yet. Ownership is visible in China's registry and the company's filing; today Zhongke graphite reaches the US mostly via Malaysian cell plants |
| 4 | POSCO Future M, Korea (contrast) | Korean-owned (POSCO Holdings 58.2%, registry); Chinese graphite in until Dec 2023; 95 anode shipments to GM, SK Battery America, Tesla, Panasonic and XALT. Same buyers as Case 1, different owner |
| 5 | Putailai's Zichen plant, Malaysia | Five corridor scans found no Chinese-owned anode maker shipping to the US. The one Chinese-owned plant is registered 100% via Singapore but isn't trading yet |
| 6 | EVE Energy's cell plant, Malaysia | Full trail at the cell level: Chinese anode graphite (BTR, Zhongke, Shanshan) in; cells out to EVE North America, Briggs & Stratton, Milwaukee Tool and others. EVE added to the 1260H list in June 2026 |
| 7 | Gotion's plants inside the US | Chinese cells, packs and graphite shipped from Gotion's Chinese plants to Fremont and Manteno. Ownership visible from the Chinese side only |
| 8 | Syrah, Mozambique → Louisiana (benchmark) | A non-Chinese chain: Balama graphite to Vidalia, with Australian ownership (annual report). The same mine also sells to Chinese buyers and to BTR Indonesia |
| 9 | Ford's links to BTR | BTR Indonesia graphite into Ford's Marshall, Michigan plant (2026; some loaded in China); BTR's sales arm to BlueOval SK (2025); US$120m prepayment to BTR's Moroccan anode company (filing) |
| 10 | CATL, Ampace and Linergy Power (Malaysia) | CATL group owned Linergy (59.5% via Xiamen Ampace) until TDK (Japan) bought it in Jun 2026; Sayari still shows the old chain. Cells to Eaton, Milwaukee Tool and others |
| 11 | CATL Debrecen (EU comparison) | 100% CATL ownership visible in Hungarian registry; EU-internal trade invisible to customs data. EU rules ask about sourcing, not ownership |
| 12 | Huayou nickel, Indonesia (beyond graphite) | 57% Huayou-owned HPAL plant in IMIP; its nickel goes to China; no direct US flow, and the hop into US cathode isn't joined by any record |

Every link on the site carries an edge type, a confidence badge and the IDs of the calls that produced it.

Built for GLOB1-GC 2620 *Beyond the Brand: Harnessing Emerging Tech in Ethical Sourcing* (NYU CGA, Fall 2026). It is a companion to [Battery Passport Audit](https://github.com/indiaclarke03-ops/EthicalBatterySourcing).

## Pages

| Page | What's on it |
|---|---|
| `index.html`: The Trace | Headline, key numbers, why it matters, a world map of the eight supply chains, short answers per case, cross-case findings, policy timeline |
| `explore.html`: Explore | The network for each case in four columns (owners, suppliers, plant, buyers); hover to focus, click for evidence; filters |
| `buyers.html`: Check a Buyer | Pick a US buyer to see suppliers from the traced cases, plus wider HS 3801/8507 scans for Ford, Panasonic and LG Energy Solution, and a step-by-step guide to check any buyer |
| `cases.html`: Case Files | All eight cases: question, answer, why it matters, key numbers, network, steps, verdict, passport card, red flags |
| `diligence.html`: Due Diligence | Ownership screening for every plant, supplier questions generated from red flags, a watch list |
| `method.html`: Method | Lessons, the 18 Oct re-check, Sayari scorecard, rubric, replay of every call, searchable log |
| `about.html`: About this tool | Purpose, how to read it, confidence ratings, naming policy, sources, credits, limits, changelog |

## Staying current

- Every case shows when it was last re-checked (`checks` in `investigation/curated.json`).
- A monthly cloud routine (1st of each month, 14:00 UTC) re-runs the key Sayari checks and logs them in `investigation/notes/recheck-YYYY-MM.md`. It updates the dates and opens a pull request flagging changes; nothing merges automatically.
- A one-off routine on 11 Nov 2026 re-checks China's Announcement 70 and the US PFE guidance.
- How to add a case: `investigation/case-spec.md`.

## How it works

- Static site with no build step: vanilla HTML/CSS/JS plus pinned CDN libraries.
- **No keys in the browser.** Sayari and Tavily were queried through MCP in VS Code (Claude Code). Case 1 is summarised in `investigation/build_data.py`; cases 2–8 are in `investigation/cases/case*.json`; map points, screening cards, buyer groups and the watch list are in `investigation/curated.json`; the 18 Oct re-check is `investigation/notes/verification.md`. The builder merges them, checks every cross-reference, and writes the curated JSON in `/data`. The site only reads that JSON.
- **Derived data only.** Sayari data is licensed, so we publish our own summaries (names, link types, dates, HS codes, counts, flags) and link each entity to Sayari Graph. No raw record dumps.

```
data/            entities, edges, cases, call_log, policy_timeline, sources, overview, curated, world-110m (+ schema.md)
investigation/   build_data.py, playbook.md, notes/ (Tavily calls, company context, demo script)
assets/          css/ (tokens, base, components) and js/ (data, ui, graph, map, home, explore, buyers, cases, diligence, calllog)
```

## Reproduce

```bash
python3 investigation/build_data.py   # rebuild /data from the investigation record
python3 -m http.server 8000           # then open http://localhost:8000
```

To rerun the investigation on another supplier, follow [`investigation/playbook.md`](investigation/playbook.md). You'll need access to the Sayari MCP server and the Tavily MCP server.

## Credits

[Cytoscape.js](https://js.cytoscape.org/), [cytoscape-dagre](https://github.com/cytoscape/cytoscape.js-dagre), [dagre](https://github.com/dagrejs/dagre), [Fuse.js](https://www.fusejs.io/). Source Serif 4, IBM Plex Sans and IBM Plex Mono via Google Fonts. Data: [Sayari](https://sayari.com/) (via MCP) and [Tavily](https://tavily.com/), plus the Federal Register, IRS, USITC and ITA primary sources cited on the site.

AI use: built with Claude Code, which ran the MCP calls and wrote the code, under India Clarke's direction.

## Licence

MIT. See [LICENSE](LICENSE). Sayari-derived content stays subject to Sayari's terms.
