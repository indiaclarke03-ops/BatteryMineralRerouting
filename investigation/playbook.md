# PFE screening playbook (Sayari MCP)

A repeatable sequence for checking whether a battery-material supplier outside China may route Chinese inputs into US supply chains, and who owns it. Written from the Case 1 run on 14 Oct 2026. Call IDs refer to `data/call_log.json`.

**Before you start:** load *all* Sayari tool definitions. Read each risk flag's definition before using it (`lookup_risk_factors`). Log every call with its question, params, result, interpretation and a score (worked / partial / failed).

## 1. Method set-up
- `get_investigation_guidance` with `investigation_type: supply_chain`, then `entity_resolution` (s001, s004). Country filters may return nothing (s002); retry without them.
- `lookup_risk_factors` for every flag on the seed record (s003). `*_adjacent` = one hop away; `psa_*` = via a "possibly the same as" link. Neither is a finding about the entity itself.

## 2. Entity resolution (inferred)
- `search_entities` with the legal name, then `get_entity_summary` on every candidate.
- Merge rule: a **matching street address and a matching name stem** gives an *Inferred* "possibly same as" link. A name match alone stays a *Lead*. Shared identifiers (LEI, tax ID) would make it *Documented*.
- Expect fragments: customs sources truncate names (s006, s022, s023). Each fragment can carry its own shipments, so keep them.

## 3. Ownership (contractual)
- `find_beneficial_owners` and `get_entity_profile` on the anchor record (s008, s009).
- `find_shortest_path` to the suspected parent (s019). If the only path is `ships_to`, say so.
- `find_downstream_entities` from the parent, filtered to the plant's country (s020). This tells you whether the gap is coverage or absence.
- If the registry is empty, use open sources (company releases, filings) and label the edge with that source.

## 4. Upstream (transactional)
- `traverse_network` with `relationships: ["receives_from"]`, depth 1 (s013): supplier countries and names.
- `get_upstream_supply_chain` with `product` HS codes (s014): the "same product in" test. Note non-Chinese inputs too.

## 5. Downstream (transactional)
- **Don't rely on `shipper_name` / `receiver_name` filters.** They were ignored twice (s010, s012).
- **Don't rely on supplier rollups by HS code** for small corridors: they returned 0 (s015, s016).
- **Do** put the quoted company name in the free-text `query`, with departure and arrival countries (s017). Then check every row's supplier field.
- Confirm with the US-import record's `ships_to` links (s011, s018).
- Read product descriptions: grain sizes in mm suggest non-battery graphite.

## 6. Screening and gaps
- `check_watchlist` (s021). Two-hop hits through freight forwarders are noise; list them, don't escalate them.
- Write down what you couldn't see: ownership shares, input-to-output tracing, reasons for timing changes.

## Red-flag rubric

| Flag | Signal | Severity | How to test |
|---|---|---|---|
| Chinese parent / SOE ownership of transit plant | contractual | High (PFE) | Steps 3, plus open sources |
| Same HS imported from China and exported to the US | transactional | High | Steps 4 and 5 |
| Recent incorporation vs. first export date | contractual | Medium | Incorporation date vs. earliest shipment |
| Volume spike after a policy date | transactional | Medium | Shipment dates vs. the policy timeline |
| Shared address / officer with flagged entity | inferred | Medium | Address fields of suppliers (step 4) |
| Entity-resolution fragmentation | inferred | Low (disclose) | Step 2 |
| Forced-labor / UFLPA sub-tier flags | inferred | Medium | Flags plus definitions (step 1) |

Score each flag **detected** (a record shows it), **suggested** (signals point to it without a record) or **not visible** (couldn't test).

## Language
Write "pattern consistent with…" or "warrants due diligence". Never write that a named company evades, launders or circumvents anything.
