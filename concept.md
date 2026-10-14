# Paper Trail: Concept

*Tracing battery-mineral rerouting with Sayari MCP*

> **Note (14 Oct 2026):** the policy table in §2 was re-verified with Tavily. Corrected values are in `data/policy_timeline.json` and `CHANGELOG.md`:
> - The Commerce finals were published in the Federal Register on 17 Feb 2026.
> - The CVD rate is 66.82–66.86%.
> - The USITC finding was "material retardation".
>
> The repo is `BatteryMineralRerouting`.

**Course:** GLOB1-GC 2620 *Beyond the Brand: Harnessing Emerging Tech in Ethical Sourcing* (NYU CGA, Fall 2026)
**Assignment:** Demonstrate Sayari MCP on a problem that traces **contractual / transactional and inferred relationships**. Iteration 1 is shown in class (**tonight, Wed 14 Oct 2026**) and then updated based on feedback.
**Deliverables:** public GitHub repo URL and GitHub Pages URL.
**Build environment:** VS Code with the Sayari MCP and Tavily MCP connected.

---

## 1. The question

> **Can trade and corporate-registry data reveal Chinese battery materials, especially graphite anode material, being rerouted through third-country plants before they reach US battery supply chains?**

Chinese anode and battery-material producers have been building plants outside China, in Indonesia, Morocco and Oman among others. Trade press says flows from these plants to the US are expected. Some of this is ordinary global manufacturing. Some may be structured to get around US rules.

The site answers the question the way the professor's examples are framed ("Could X be detected?"), with an explicit **verdict**: what Sayari *could* detect, what it could only *suggest*, and what it *couldn't see*.

## 1a. Brief check and contribution

| Professor's requirement | How Paper Trail meets it |
|---|---|
| Demonstrate **usage of Sayari MCP** | The Method page *replays* the investigation: each step shows the plain-English question asked, the MCP tool and parameters, and what came back. The use of the tool is visible, not just the results. |
| Trace **contractual / transactional** relationships | Ownership and subsidiary links from registries (contractual), plus shipments by HS code (transactional), drawn as distinct edge types. |
| Trace **inferred** relationships | Entity-resolution matches (BTR Indonesia's three records), shared addresses or officers, risk-flag adjacency and shortest paths, each labeled Inferred with stated reasoning. |
| A **problem** in the spirit of the examples | "Could Chinese graphite rerouted through third-country plants be detected?" This is a rerouting and detection question, like the NVIDIA diversion example. |
| **First iteration, show in class, update on feedback** | A built-in "What I want feedback on" section, a changelog on the About page, and feedback logged into the backlog. |
| **GitHub repo + Pages URLs** | Static site deployed from the repo. |

**What it contributes beyond a demo:**
1. **A reusable PFE screening playbook.** A step-by-step Sayari MCP sequence plus a red-flag rubric that maps Sayari signals to the new US "prohibited foreign entity" ownership rules. Classmates or analysts can rerun it on any battery supplier.
2. **An honest Sayari capability scorecard.** For each investigative step, the site records whether Sayari *worked*, *partially worked* or *failed* (e.g. a 0-result shipment search, fragmented entity records). That evaluation of the tool's limits is itself a finding for the course.
3. **A timely policy angle.** The US International Trade Commission blocked the graphite duties in March 2026, which shifts compliance from "where did it ship from?" to "who owns the plant?". This explains why ownership-plus-trade tracing matters now.
4. **Declared vs. observed.** A small Passport vs. Paper Trail card connects this course's earlier battery passport work to independent verification. It stays secondary so the focus remains on Sayari.

## 2. Policy stakes (verified via Tavily, 14 Oct 2026; re-check before demo)

| Date | Measure | Why it matters | Source |
|---|---|---|---|
| Dec 2023 | China begins export licensing for certain graphite products | Chinese exports face friction, which is an incentive to produce offshore | Fastmarkets |
| 4 Jul 2025 | One Big Beautiful Bill Act adds **prohibited foreign entity (PFE)** "material assistance" rules to the §45X, §45Y and §48E clean-energy credits | US manufacturers lose credits if too much of a component's cost comes from PFEs. Ownership, not just shipping origin, now matters | IRS / Tax Law Center |
| 11 Feb 2026 | Commerce final AD/CVD determinations on Chinese **active anode material** (AD ~93.5–102.7%; CVD ~66.8%) | Signals a strong US intent to price out Chinese graphite | trade.gov; Federal Register 91 FR 7247 and 7261 |
| 12 Feb 2026 | **IRS Notice 2026-15**: first PFE material-assistance guidance | Buyers must now trace who *owns* their suppliers | IRS |
| 12 Mar 2026 | **USITC negative injury determination**: AD/CVD duties *not* imposed | The tariff lever fell away, so the ownership-based PFE rules are now the main pressure point | E&E News; Green Stocks Research |

**Takeaway for the demo:** checking which country goods shipped from is no longer enough. The question is *who owns the plant the goods came from*. That makes this an ownership-plus-trade problem, exactly what Sayari is built for.

## 3. How this fits the prompt

The assignment asks for contractual/transactional **and** inferred relationships. Every link on the site carries one of three edge types, shown by both color and line style:

| Edge type | Meaning | Sayari MCP tools | Line |
|---|---|---|---|
| **Transactional** | Goods physically moved: bill of lading or customs record, with HS code, dates and ports | `search_trade_facets`, `search_suppliers`, `search_buyers`, `search_shipments`, `get_upstream_supply_chain` | solid blue |
| **Contractual / corporate** | Registry or filing link: owns, subsidiary of, director of, JV partner | `get_entity_profile`, `find_beneficial_owners`, `traverse_network` | dashed purple |
| **Inferred** | Derived by Sayari or by us rather than stated in a document: entity-resolution matches, shared addresses or officers, risk-flag adjacency, shortest-path links | `find_shortest_path`, `traverse_network`, `check_watchlist`, `lookup_risk_factors` | dotted amber |

The "laundering hop" pattern the demo traces:

```
[Chinese parent/producer] --ships to--> [3rd-country plant] --ships to--> [US buyer]
          |                                    ^
          +---------- owns (registry) ---------+
                                               +-- possibly same as / shares address (inferred)
```

## 4. Seed leads from the feasibility probe (14 Oct 2026)

These are real Sayari results that give the VS Code session a running start. They are **leads, not findings**.

- **HS 3801 (artificial graphite) shipped to the USA since 2023:** 5,528 suppliers in Sayari. China is the top supplier country (2,472), followed by Germany, Spain, Belgium, Italy, the Netherlands and Korea. Common supplier risk flags: `soe_adjacent`, `sanctioned_adjacent`, `export_controls_adjacent`, and UFLPA/Xinjiang origin sub-tier flags.
- **"Graphite anode" suppliers to the USA since 2024:** 112 suppliers.
- **PT Indonesia BTR New Energy Material** (Indonesian plant linked by name to China's BTR New Material Group, the largest producer named in the Commerce AD case). Sayari returns **three separate records** for it:
  - `2omCekb1pDRKjhFOAqCNSw`: Morowali/IMIP and Kendal addresses, LEI 254900G3L2Z0HNRV7W43. Flags: `chinese_soe_adjacent`, `forced_labor_uflpa_origin_subtier`, `psa_imports_from_usa_bis_entity`
  - `dH3rqoht5wahpKLPJih3gA`: Kendal address, sparse identifiers
  - `ekoH1fr8BGvHc7UqYCY_YA`: "Jakarta Barat" only, sparse identifiers

  The fragmentation is itself a teachable moment about **inferred** relationships: are these the same legal entity? Show how we decided.
- **A gap that is itself a finding:** `search_suppliers` with query "graphite anode", from Indonesia to the USA, since 2023, returned **0**. Either the material isn't flowing yet, it is described differently (try HS 3801/2504 without free text), or it routes via a third country. "Where the trail goes dark" belongs on the site.
- Trade press flags other offshore Chinese anode capacity, such as a Zhongke Electric project in Oman targeting 2027 production. These are candidates for a second case.

## 5. Connection to *Passport with Gaps*

My earlier course project mocked up an EU battery passport and highlighted its gaps. This project is the companion piece:

- **Passport = what the manufacturer declares. Paper Trail = what trade and registry data shows.**
- Each case gets a **"Passport vs. Paper Trail" card**: passport-style fields (manufacturer, origin of key materials, supply-chain due-diligence statement, ownership) next to what Sayari shows. Mismatches are flagged as **gaps**, with styling designed fresh for this site.
- **Distinct project, related idea.** Paper Trail has its own identity: its own name, palette, typography and layout. It is a trade-investigation tool, not a passport mock-up. Draw on *Passport with Gaps* only where it adds something: the passport field list and the declared-vs-observed "gap" *concept*, and any data or field definitions worth reusing. Don't copy its look or page structure.
- The About page links to *Passport with Gaps* as the earlier, related project.
- One-line framing for class: *"A passport is a self-declaration; trade data is an independent check — the gaps are where due diligence should look."*

## 6. Audience and UX

**Users:** sourcing, compliance and policy analysts. Tonight, that's classmates and the instructor.
**Goal:** in about 3 minutes, a viewer understands one rerouting pattern, how Sayari found it, and how confident we are in each link.

UX principles:
1. **Story first, explore second.** A guided step-through, then a free-form graph.
2. **Confidence always visible.** Badges read `Documented`, `Corroborated`, `Inferred` or `Lead`.
3. **Show the receipts.** Every finding has a "How we know" link to the exact MCP call or source.
4. **Calm and credible.** Restrained palette, whitespace, a legible graph.
5. **Accessible.** Color is never the only signal, keyboard navigation works, and the site is usable at phone width.

## 7. Site map

| Page | Contents |
|---|---|
| **Home: The Trace** | Hero question, then the policy timeline strip, then a 5-step walkthrough of Case 1 where the graph builds step by step: corridor, plant, owner, inferred link, gap. Then a **Verdict** panel (detected / suggested / not visible) and "What I want feedback on". |
| **Explore** | Interactive network graph. Filters for edge type, country, HS code and risk flag. Clicking a node opens a side panel with summary, flags, confidence and receipts. |
| **Case Files** | 1–2 cases, each with a Passport vs. Paper Trail card. |
| **Method** | An **investigation replay** (question → MCP tool and parameters → result → what it means), the red-flag rubric, the **Sayari capability scorecard** (worked / partial / failed per step), and a searchable log of every Sayari and Tavily call. |
| **About this tool** | Purpose, audience, data sources and open-source credits, the edge-type and confidence legend, limitations and ethics, course context, changelog. |
| *(Iteration 2)* **Corridors** | Sankey of China → transit country → US flows, before vs. after policy dates. |

## 8. Architecture

- **Static site** on GitHub Pages with no build step: vanilla HTML/CSS/JS and libraries loaded from a CDN.
- **No keys in the browser.** Sayari and Tavily are queried in VS Code during investigation. Results are saved as curated JSON in `/data`, and the site only reads that JSON.
- **Open source used:** Cytoscape.js + cytoscape-dagre (graph), Scrollama (step-through, optional), D3 + d3-sankey (Iteration 2 corridors), Fuse.js (call-log search), Lucide (icons). Optional open-data cross-checks: OpenSanctions (sanctions/PEP lists, free for non-commercial use), UN Comtrade (country-level trade baselines), Federal Register and USITC DataWeb (policy and tariff records).
- **Licensing caution:** Sayari data is licensed. Publish **derived summaries** (names, link types, counts, flags, our own wording), not raw record dumps.

## 9. Ethics and limits (stated on the About page)

- **This is not an accusation tool.** Write "pattern consistent with" or "warrants due diligence", never "is evading".
- Most third-country processing of Chinese inputs is legal and commercially normal.
- Trade data has gaps: some countries aren't covered, product descriptions are often vague, and air freight and some routes are missing.
- Entity resolution can merge or split companies. Every "possibly same as" link is labeled **Inferred**.
- Policy is moving fast. Dates are as of 14 Oct 2026 and sources are cited.

## 10. Definition of done for tonight

- [ ] Live Pages URL with Home, Explore, Case Files, Method and About
- [x] At least one case showing all three edge types with confidence badges, including at least one real transactional (shipment) edge
- [x] Verdict panel and Sayari capability scorecard present
- [x] Method page replays the MCP steps (question → tool → result)
- [x] Real Sayari and Tavily calls logged and rendered on the Method page
- [x] A Passport vs. Paper Trail card on at least one case
- [x] Usable on a projector and a phone
- [ ] Repo URL and Pages URL submitted
