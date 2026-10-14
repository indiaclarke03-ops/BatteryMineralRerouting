# Data schema

All files are written by `investigation/build_data.py`. Each file is `{ "as_of": "2026-10-14", "generated_by": "...", "items": [...] }`.

## entities.json
| Field | Notes |
|---|---|
| `id` | Sayari entity ID |
| `name` | Display name. Fragment records get "(record n)" |
| `country` | ISO-3 |
| `type` | `company` or `person` |
| `role` | `parent`, `producer`, `trader`, `transit_plant`, `us_buyer` or `contrast` |
| `risk_flags[]` | Sayari risk-factor IDs (context only; see About → risk flags) |
| `identifiers{}` | e.g. `lei`, `idn_tax_id`, `cn_uscc` |
| `summary` | One or two sentences in our own words |
| `source_call_ids[]` | Call-log IDs |
| `sayari_url` | Link to Sayari Graph |
| `records` | Optional: number of Sayari records believed to be this entity |

## edges.json
| Field | Notes |
|---|---|
| `id` | `e001`… |
| `source`, `target` | Entity IDs. Direction follows goods or ownership |
| `relation` | `ships_to`, `owns`, `possibly_same_as`, `shares_address` or `group_name_match` |
| `edge_type` | `transactional`, `contractual` or `inferred` |
| `confidence` | `documented`, `corroborated`, `inferred` or `lead` (definitions below) |
| `hs_codes[]`, `first_seen`, `last_seen`, `shipment_count` | Transactional detail where pulled |
| `evidence` | Short note in our words |
| `source_call_ids[]` | Sayari (`s…`) and Tavily (`t…`) calls |

**Confidence**
- **Documented:** Sayari returned dated, HS-coded shipment rows or a registry record for the link.
- **Corroborated:** the link is in Sayari's graph, or an open source, *and* a second independent signal supports it.
- **Inferred:** our judgment from matching attributes. No record states it.
- **Lead:** a single weak signal.

## cases.json
`items[]`: `id, title, subtitle, question, headline, overall_confidence, steps[] {title, kicker, text, edge_ids[], node_ids[], call_ids[]}, verdict {detected[], suggested[], not_visible[]}, passport[] {field, guidance_no, declared, paper_trail, gap, note}, red_flags[] {flag, signal, severity, result, note}, caveats[]`.
`leads[]`: cases not yet investigated.

## call_log.json
`{id, timestamp, server: "sayari"|"tavily", tool, params, question, purpose, result_summary, interpretation, scorecard: "worked"|"partial"|"failed", entity_ids[], step}`

## policy_timeline.json
`{date, measure, relevance, source_url, source_name, verified, note, source_call_ids[]}`

## sources.json
`{id, name, type, url, used_for}`
