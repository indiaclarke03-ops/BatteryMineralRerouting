# Paper Trail

*Tracing battery-mineral rerouting with Sayari MCP.*

**Live site:** https://indiaclarke03-ops.github.io/BatteryMineralRerouting/
**Repo:** https://github.com/indiaclarke03-ops/BatteryMineralRerouting

> Can trade and corporate-registry data reveal Chinese battery materials, especially graphite anode material, being rerouted through third-country plants before they reach US battery supply chains?

Iteration 1 traces one plant end to end: **BTR's anode plant in Indonesia** (PT Indonesia BTR New Energy Material).

- **Transactional:** Sayari shows dated HS 3801.10 shipments from the plant to Ultium Cells (Warren and Spring Hill), SK Battery America, StarPlus Energy, GM and Tesla, Dec 2024 – Aug 2025. It also shows Chinese artificial graphite (HS 3801) arriving at the same plant from BTR and from a trader registered in the BTR Building in Shenzhen.
- **Contractual:** Sayari has **no registry ownership record** for the plant. The BTR ownership link comes from open sources and is labelled that way.
- **Inferred:** five fragmented Sayari records for one plant, tied together by a shared street address.

Every link on the site carries an edge type, a confidence badge and the IDs of the calls that produced it.

Built for GLOB1-GC 2620 *Beyond the Brand: Harnessing Emerging Tech in Ethical Sourcing* (NYU CGA, Fall 2026). It is a companion to [Battery Passport Audit](https://github.com/indiaclarke03-ops/EthicalBatterySourcing).

## Pages

| Page | What's on it |
|---|---|
| `index.html`: The Trace | The question, policy timeline, a 5-step walkthrough on the graph (← → keys), the verdict and feedback asks |
| `explore.html`: Explore | Cytoscape network with filters (link type, confidence, country, HS code, risk), a side panel and a list view |
| `cases.html`: Case Files | Case 1 narrative, the Passport vs. Paper Trail card, red flags and caveats; Case 2 lead (Morocco) |
| `method.html`: Method | Investigation replay of all 24 Sayari calls, capability scorecard, red-flag rubric, searchable log of 38 calls |
| `about.html`: About this tool | Purpose, how to read it, data sources, credits, limitations and ethics, changelog |

## How it works

- Static site with no build step: vanilla HTML/CSS/JS plus pinned CDN libraries.
- **No keys in the browser.** Sayari and Tavily were queried through MCP in VS Code (Claude Code). Results were summarised by hand into `investigation/build_data.py`, which writes the curated JSON in `/data`. The site only reads that JSON.
- **Derived data only.** Sayari data is licensed, so we publish our own summaries (names, link types, dates, HS codes, counts, flags) and link each entity to Sayari Graph. No raw record dumps.

```
data/            entities, edges, cases, call_log, policy_timeline, sources (+ schema.md)
investigation/   build_data.py, playbook.md, notes/ (Tavily calls, company context, demo script)
assets/          css/ (tokens, base, components) and js/ (data, ui, graph, stepper, explore, cases, calllog)
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
