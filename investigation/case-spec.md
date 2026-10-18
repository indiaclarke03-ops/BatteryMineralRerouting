# Paper Trail: how to investigate and write up a case

This is the brief for adding a case study to Paper Trail. It is written for an analyst, or an AI agent, with Sayari MCP and Tavily access. Read all of it before starting.

## Context
The site asks whether trade and corporate-registry data can reveal Chinese battery materials (mainly graphite anode material, and also cells and other minerals) reaching US supply chains through plants in third countries, and who owns those plants. The policy hook is the US "prohibited foreign entity" (PFE) rules: since July 2025, clean-energy tax credits (§45X and others) depend on whether suppliers are owned or controlled by PFEs. In March 2026 the USITC voted against anti-dumping duties on Chinese anode material, so ownership is now the main lever.

Repo layout: Case 1 lives in `investigation/build_data.py`; Cases 2+ are `investigation/cases/caseN.json`; `investigation/curated.json` holds the presentation layer. The builder `investigation/build_data.py` merges everything into `data/*.json` and validates every cross-reference. Before starting, read `data/cases.json` (any one case) and a few `data/call_log.json` entries to see the expected level of detail. Existing entities are in `data/entities.json`: reuse their Sayari IDs when the same company appears.

## Tools
- **Sayari MCP.** Load all definitions first, in one ToolSearch call: `select:mcp__claude_ai_Sayari__check_watchlist,mcp__claude_ai_Sayari__find_beneficial_owners,mcp__claude_ai_Sayari__find_downstream_entities,mcp__claude_ai_Sayari__find_shortest_path,mcp__claude_ai_Sayari__get_entity_profile,mcp__claude_ai_Sayari__get_entity_summary,mcp__claude_ai_Sayari__get_investigation_guidance,mcp__claude_ai_Sayari__get_record,mcp__claude_ai_Sayari__get_upstream_supply_chain,mcp__claude_ai_Sayari__lookup_hs_codes,mcp__claude_ai_Sayari__lookup_risk_factors,mcp__claude_ai_Sayari__search_buyers,mcp__claude_ai_Sayari__search_entities,mcp__claude_ai_Sayari__search_entity_facets,mcp__claude_ai_Sayari__search_shipments,mcp__claude_ai_Sayari__search_suppliers,mcp__claude_ai_Sayari__search_trade_facets,mcp__claude_ai_Sayari__traverse_network`
- **Tavily**, for company context and primary documents: `select:mcp__claude_ai_Tavily__tavily_search,mcp__claude_ai_Tavily__tavily_extract`
- **Python:** `/Library/Developer/CommandLineTools/usr/bin/python3` (plain `python3` may fail locally). Large tool results get saved to a file; parse them with python, and never guess.
- **Budget:** about 15–25 Sayari calls and 2–5 Tavily calls per case.

## Lessons learned (follow them)
- **Name filters fail silently.** `shipper_name` / `receiver_name` filters in `search_shipments` are often ignored and return 10,000 unrelated rows. Put the quoted company name in `query` instead, with departure and arrival countries, and check the supplier field of each row.
- **Free text ranks, it doesn't filter.** Counts after a quoted query are not match counts; read the rows.
- **Search syntax.** Boolean `OR` queries return 0. A country word inside a quoted name returns 0. Two quoted names in one query return 0. A `page_token` can't be combined with `limit` or `response_mode`.
- **Departure filters can miss rows.** US import data records the last port of loading, and rows "loaded in Singapore" or transshipped via Kingston are common. Run one query without a departure filter.
- **Rollups can be blind.** `search_suppliers` and `search_trade_facets` with HS + free text can return 0 even when shipment rows exist. Record that as a failed call.
- **Network tools:**
  - `get_entity_profile` lists `ships_to` / `receives_from` partners.
  - `traverse_network` with `relationships:["receives_from"]`, depth 1, gives suppliers with addresses.
  - `get_upstream_supply_chain` with `product` HS codes gives inbound HS codes and dates.
- **Fragmented records:**
  - Same street address + same name stem → `possibly_same_as`, rated `inferred`.
  - Name only → `lead`.
  - Shared LEI or tax ID → `documented`.
- **Ownership gaps:** `find_beneficial_owners` may return 0. Then try `find_shortest_path` to the suspected parent, `find_downstream_entities` from the parent, and company annual reports via Tavily.
- **Watchlist noise:** `check_watchlist` hits two hops out are usually freight forwarders. Say so.
- **Flags:** `*_adjacent` = one hop from a flagged entity; `psa_*` = via a "possibly same as" link. They describe neighbours, not the entity itself.
- **HS 3801.10 includes non-battery graphite** (electrodes, refractories, recarburizer). Grain sizes in mm suggest industrial grade; "anode material", "spherical graphite" or µm sizes suggest battery grade.
- **Records change.** Sayari merges and retires IDs. Note the date you checked.

## Rules
- **Never invent anything.** No IDs, numbers, dates, names or URLs that didn't come from a call you made and logged.
- **Name every company the data shows,** buyers included. The site aims for full transparency.
- **Name individuals only when relevant.** Do so only where they add to the supply-chain story (for example, a shared officer linking a plant to its parent), always with their role. Add them as entities with `type: "person"` and `role: "officer"`, and link them with contractual `director_of` / `officer_of` / `shareholder_of` edges. Don't name nominee or registered-agent directors.
- **Neutral language.** Never write that a named company "evades", "launders" or "circumvents". Use "pattern consistent with…" or "warrants due diligence". Processing Chinese inputs abroad is legal and common.
- **Plain English for non-experts.** Use short sentences, and explain HS codes in words the first time.
- **Our own words.** Summaries are paraphrased; never paste raw records.

## Confidence scale (use exactly these keys)
- `documented`: Sayari returned dated shipment rows or a registry record for this link.
- `corroborated` (shown on the site as "Cross-checked"): two independent signals agree. A company's own statement plus one other source counts.
- `inferred`: our judgment from matching attributes. No record states it.
- `lead`: a single weak signal.

Every edge needs a `confidence_reason`: one sentence on why it gets that rating. A case's `overall_confidence` is the rating of the weakest link that its main conclusion depends on.

## Output: one JSON file
```json
{
  "case": {
    "id": "case-N", "slug": "short-slug", "title": "...", "subtitle": "Company · place",
    "country": "ISO3 of the plant", "plant_status": "operating | under construction | planned | n/a",
    "question": "Can Sayari show ...? (one plain sentence)",
    "answer_label": "Yes | Partly | Not yet | No",
    "answer": "1–2 plain sentences that directly answer the question.",
    "why_it_matters": "2–3 plain sentences on why this matters for US buyers, the PFE rules or transparency.",
    "headline": "2–3 plain sentences.",
    "summary_for_non_experts": "3–4 sentences.",
    "key_numbers": [{"value": "19", "label": "...", "call_ids": ["sN01"]}],
    "overall_confidence": "documented|corroborated|inferred|lead",
    "pattern": "rerouting-pattern | complete-trail | trail-not-started | contrast-legitimate | trail-goes-dark",
    "steps": [{"title": "...", "kicker": "Step 1 · Transactional", "text": "2–4 sentences", "edge_ids": [], "node_ids": [], "call_ids": []}],
    "verdict": {"detected": [{"text": "...", "call_ids": []}], "suggested": [], "not_visible": []},
    "passport": [ /* 5 rows: Place of manufacture (8), Detailed composition (45), Critical raw materials > 0.1% (15), Responsible-sourcing report (19), Ownership of upstream suppliers (—). Fields: field, guidance_no, declared, paper_trail, gap, note */ ],
    "red_flags": [ /* the same 7 flags, in the same order, as the existing cases; result = detected | suggested | not_visible | absent */ ],
    "caveats": ["..."]
  },
  "entities": [ /* id (Sayari ID), name, country, type, role (parent|producer|trader|transit_plant|us_buyer|buyer|contrast|officer), risk_flags, identifiers, summary, source_call_ids, sayari_url */ ],
  "edges": [ /* id, source, target, relation, edge_type, confidence, confidence_reason, hs_codes, first_seen, last_seen, shipment_count, evidence, source_call_ids */ ],
  "calls": [ /* id, timestamp (real UTC), server, tool, params (exact), question, purpose, result_summary, interpretation, scorecard (worked|partial|failed), entity_ids, step (method|plant|owner|in|out|gap|corridor|context) */ ]
}
```
- **ID formats:** Sayari calls are `s<N>01`… and Tavily calls `t<N>01`…; for cases 10 and above use `s<N>-01` and `t<N>-01`. Edges are `e<N>01`… (`e<N>-01` for 10+).
- **Role:** the case's own plant(s) must have `role: "transit_plant"`.
- **Self-check before finishing:** parse the JSON, and confirm every edge's source and target, every step `node_ids`/`edge_ids` and every `call_ids` reference resolves within your file or to existing Case 1 IDs.

Finish with a 5–8 line message covering the headline, counts (entities, edges, calls; worked / partial / failed) and anything you couldn't verify.
