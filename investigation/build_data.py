"""Build the site's /data JSON from the curated investigation record.

Every value below was read from a logged Sayari or Tavily call on 2026-10-14
(see SAYARI_CALLS and investigation/notes/tavily_calls.json). The text is our
own summary of each result, not a copy of Sayari records.

Run:  python3 investigation/build_data.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
NOTES = ROOT / "investigation" / "notes"
AS_OF = "2026-10-14"

# ---------------------------------------------------------------------------
# Sayari MCP calls, in the order they were made
# ---------------------------------------------------------------------------
def s(n, minute, tool, params, question, purpose, result, interp, score, ids, step):
    return {
        "id": f"s{n:03d}",
        "timestamp": f"2026-10-14T18:{minute}Z",
        "server": "sayari",
        "tool": tool,
        "params": params,
        "question": question,
        "purpose": purpose,
        "result_summary": result,
        "interpretation": interp,
        "scorecard": score,
        "entity_ids": ids,
        "step": step,
    }

PLANT = "2omCekb1pDRKjhFOAqCNSw"
PLANT_KENDAL = "dH3rqoht5wahpKLPJih3gA"
PLANT_JKT = "ekoH1fr8BGvHc7UqYCY_YA"
PLANT_FRAG4 = "0pb5Arj9l_g5eJtqVBozsQ"
PLANT_FRAG5 = "xbEAXBfl7YhUMRWA8PJqoQ"
BTR = "jeHf5QJt0JXowTiCA8JiIQ"
BTR_SALES = "5_cayB1m7XahAhz_Hrrpng"
RUIQING = "9pKXMU4m6GbuXl_McP8jag"
TWIGG = "ffPlxyHu42G892jPO7tpbA"
SYRAH = "uZISesDqcaxQ8aVgsyvurw"
ERG = "I0E-2fRqFflDTESrsMh2ZA"
ULT_W = "rvgklT24qqqfH2rnlVlyBg"
ULT_SH = "kCTEQjRAGcFo6AM_PGW2bw"
SKBA = "aoeSqNICt_VUP-o-F-84Yg"
STARPLUS = "1iZm5WHKh2xwHvW9-qFunQ"
GM = "4fqrWAcyrgtWw2RdV6qZsg"
TESLA = "xWhz7CFJV3lxsgg8fHMGHA"
AMINCO = "oJvmXc2fb6aBRkCDyxOLig"
LARPEN = "BoJ05H9uciX3VySWmVmq8g"
LIYUAN_CZ = "ebomNaL2BFXiZYYk0Y8Scg"
LIYUAN_ID = "O-QDv6jXInkdMYQI92mrXA"

SAYARI_CALLS = [
    s(1, "46:10", "get_investigation_guidance",
      {"query": "Chinese battery anode graphite producer operating plants in Indonesia; detect rerouting through third-country plants into US supply chains", "investigation_type": "supply_chain", "limit": 5},
      "What does Sayari's own tradecraft say about tracing a supply chain like this?",
      "Build the rubric (INV-1)",
      "Five guidance entries came back: supply-chain pitfalls and data gaps, free-zone opacity red flags, a trade-based investigation workflow, a tool-selection guide and a bearer-share protocol.",
      "Three rules shaped the method: resolve the entity before anything else, keep freight forwarders out of supplier lists, and treat missing trade data as a gap, not a negative.",
      "worked", [], "method"),
    s(2, "46:20", "get_investigation_guidance",
      {"query": "Same company appears as several fragmented records with different addresses (Morowali IMIP, Kendal, Jakarta Barat) in Indonesia", "investigation_type": "entity_resolution", "countries": ["IDN"], "limit": 5},
      "Is there Indonesia-specific guidance on merging fragmented company records?",
      "Entity-resolution rules (INV-1)",
      "No entries. The country filter plus entity-resolution type returned 0 results.",
      "The guidance library is thin for Indonesia. We dropped the country filter and asked again (s004).",
      "failed", [], "method"),
    s(3, "46:30", "lookup_risk_factors",
      {"ids": ["chinese_soe_adjacent", "forced_labor_uflpa_origin_subtier", "psa_imports_from_usa_bis_entity", "soe_adjacent", "export_controls_adjacent", "sanctioned_adjacent"]},
      "What exactly do the risk flags on the seed records mean?",
      "Read flag definitions before using them (INV-6)",
      "Definitions for six flags. '_adjacent' means one hop from a flagged entity through any relationship. 'psa_' means the path runs through a 'Possibly the Same As' link. 'forced_labor_uflpa_origin_subtier' means a UFLPA-listed entity appears in tier 2 or 3 of the supplier network in the last 730 days.",
      "None of these flags says the plant itself is listed. They describe neighbours. We show them as context, never as findings about the company.",
      "worked", [], "method"),
    s(4, "46:45", "get_investigation_guidance",
      {"query": "fragmented entity records same company multiple records how to decide same legal entity", "investigation_type": "entity_resolution", "limit": 3},
      "How should we decide whether several sparse records are one legal entity?",
      "Entity-resolution rules (INV-1)",
      "Returned Sayari's 'Entity Resolution Quality Reasoning' entry: anchor on identifiers, registry IDs and structured addresses; same group or similar name is not enough; merge only when evidence supports one legal entity.",
      "Became our merge rule: a matching street address plus matching name stem gives an Inferred 'possibly same as' link; a name match alone stays a Lead.",
      "worked", [], "method"),
    s(5, "47:00", "get_entity_summary", {"entity_id": PLANT},
      "Who is the main Indonesian record, and what identifies it?",
      "Entity resolution (INV-2)",
      "PT. Indonesia BTR New Energy Material. Addresses in both IMIP Morowali (Central Sulawesi) and Kendal Industrial Estate (Central Java). Indonesian tax ID, LEI 254900G3L2Z0HNRV7W43. Sources: UK, Japan, South Korea and China trade data plus the LEI registry. 78 shipments sent, 4,083 received. Flags include chinese_soe_adjacent and several forced-labor sub-tier and PSA flags.",
      "This is the anchor record: the only one with registry-grade identifiers. It receives far more than it sends, which fits a processing plant that imports raw material.",
      "worked", [PLANT], "plant"),
    s(6, "47:05", "get_entity_summary", {"entity_id": PLANT_KENDAL},
      "Is the Kendal-only record the same company?",
      "Entity resolution (INV-2)",
      "'PT Indonesia BTR New Energy Materi' (name cut off). Address: Jl. Indraprasta No. 8, Kendal Industrial Estate. Only source: USA Imports (2021 to present). 37 shipments sent, none received. No identifiers.",
      "Same street address as the anchor and a truncated version of its name. It exists only because US customs records spelled the shipper differently. That makes it the US-facing view of the same plant.",
      "worked", [PLANT_KENDAL], "plant"),
    s(7, "47:10", "get_entity_summary", {"entity_id": PLANT_JKT},
      "Is the Jakarta Barat record the same company?",
      "Entity resolution (INV-2)",
      "Exact legal name, but the only address is 'Jakarta Barat'. Only source: Indonesia Berita Negara company gazette. No trade, no identifiers.",
      "Probably the registry filing for the same PT (Jakarta is a common registered-office location), but nothing ties it to the plant except the name. Kept as a Lead.",
      "worked", [PLANT_JKT], "plant"),
    s(8, "47:30", "get_entity_profile", {"entity_id": PLANT, "relationships_limit": 40},
      "Who does the plant trade with, and does Sayari hold any ownership links for it?",
      "Ownership and counterparties (INV-3)",
      "No shareholder or parent relationships at all. Trade relationships only: ships_to 23, receives_from 90. Named ships_to partners include Ultium Cells Warren (USA), Ultium Cells Spring Hill (USA), Samsung SDI, Aminco Resources LLC, BTR New Material Group Co., Ltd., FBKorea and Ferrolux GmbH.",
      "The first sign of a US trail: two Ultium Cells plants appear as buyers. The parent's name appears only as a trade partner, not as an owner.",
      "worked", [PLANT, ULT_W, ULT_SH, BTR, AMINCO], "owner"),
    s(9, "47:40", "find_beneficial_owners", {"entity_id": PLANT, "max_depth": 4, "limit": 15},
      "Who owns the Indonesian plant?",
      "Ownership (INV-3)",
      "0 results.",
      "Sayari holds no shareholder data for this PT. Ownership has to come from open sources and is labelled that way. This is the central blind spot of the case.",
      "failed", [PLANT], "owner"),
    s(10, "47:55", "search_shipments", {"query": "graphite", "shipper_name": "INDONESIA BTR NEW ENERGY", "arrival_country": "USA", "limit": 25, "response_mode": "compact"},
      "What has the plant shipped to the US?",
      "Downstream (INV-5)",
      "Returned 10,000 unrelated US-bound shipments (photo paper, auto parts, Brazilian flake graphite). The shipper_name filter was not applied.",
      "Same failure seen in our earlier project: name filters can silently drop. Every result has to be re-checked against the supplier field before it counts.",
      "failed", [], "out"),
    s(11, "48:10", "get_entity_profile", {"entity_id": PLANT_KENDAL, "relationships_limit": 30},
      "Who did the US-import record ship to?",
      "Downstream (INV-5)",
      "ships_to: Tesla Inc, Ultium Cells Warren, General Motors. Source: USA Imports only.",
      "US customs data links this record to three US buyers, one of them shared with the anchor record (Ultium Cells Warren). Shared buyers are extra evidence that the two records are one plant.",
      "worked", [PLANT_KENDAL, TESLA, ULT_W, GM], "out"),
    s(12, "48:25", "search_shipments", {"query": "anode", "receiver_name": "ULTIUM CELLS", "departure_country": "IDN", "limit": 25, "response_mode": "compact"},
      "Can we see the Indonesia → Ultium shipments directly?",
      "Downstream (INV-5)",
      "The receiver filter was ignored: results were palm oil to ADM, electronics and similar. One relevant row: 'carbon anode materials, HS 3801.90' from Indonesia to a Tesla warehouse in Santa Clara (Aug 2026), with no supplier named.",
      "Partial. It shows anode material does leave Indonesia for the US, but an unnamed shipper can't be tied to the plant.",
      "partial", [], "out"),
    s(13, "48:40", "traverse_network", {"entity_id": PLANT, "relationships": ["receives_from"], "max_depth": 1, "limit": 25},
      "Who supplies the plant?",
      "Upstream (INV-4)",
      "90 suppliers: 65 in China, then Mozambique (4), Madagascar (3), Hong Kong (3), USA (5) and others. They include BTR New Material Group Co., Ltd., BTR New Material Group Sales Co., Ltd., and Shenzhen Ruiqing New Energy Technology, whose registered address is 'Room 1108, BTR Building, No. 8 Guangyuan 4th Road, Guangming District, Shenzhen'.",
      "Most of the plant's inputs come from China, including from the parent group and a trader registered in the parent group's own building.",
      "worked", [PLANT, BTR, BTR_SALES, RUIQING], "in"),
    s(14, "49:00", "get_upstream_supply_chain", {"entity_id": PLANT, "product": ["3801", "2504"], "max_depth": 2, "limit": 20},
      "Does the plant import the same product (graphite) that it exports?",
      "Upstream (INV-4)",
      "HS 3801 (artificial graphite) China → Indonesia from BTR New Material Group (Dec 2025) and Shenzhen Ruiqing (Dec 2023 to Jun 2026). HS 2504 (natural graphite) from Mozambique (Twigg Exploration & Mining), Madagascar (ERG Madagascar, others), the UAE (Syrah Global DMCC) and China. HS 2713 (petroleum coke, an anode precursor) from China, Japan, Germany and Switzerland.",
      "Yes. Artificial graphite comes in from China and artificial graphite goes out to the US. But the plant also buys non-Chinese natural graphite and coke, so trade data alone can't say which input ended up in which export.",
      "worked", [PLANT, BTR, RUIQING, TWIGG, SYRAH, ERG], "in"),
    s(15, "49:20", "search_trade_facets", {"scope": "suppliers", "query": "anode", "departure_country": "IDN", "arrival_country": "USA", "hs_code": "3801"},
      "Using HS code filters only, how many Indonesian suppliers send anode material to the US?",
      "Downstream (INV-5)",
      "0.",
      "A query that looks correct returns nothing. The free-text word 'anode' doesn't match records described as 'artificial graphite'. This is how a trail goes dark.",
      "failed", [], "out"),
    s(16, "49:30", "search_suppliers", {"query": "graphite anode", "departure_country": "IDN", "arrival_country": "USA", "hs_code": "3801", "limit": 10},
      "Same question as a supplier rollup.",
      "Downstream (INV-5)",
      "0.",
      "Confirms the feasibility-probe result. Rollups are blind here; the shipment search by name (s017) is what works.",
      "failed", [], "out"),
    s(17, "49:50", "search_shipments", {"query": "\"INDONESIA BTR\"", "departure_country": "IDN", "arrival_country": "USA", "limit": 25, "response_mode": "compact"},
      "Put the plant's name in the free-text query instead of the filter. What reached the US?",
      "Downstream (INV-5)",
      "19 shipment rows, all from BTR Indonesia records. HS 3801.10 artificial graphite to Ultium Cells Warren (Jun–Aug 2025, 3 rows), Ultium Cells Spring Hill (Aug 2025, 2), SK Battery America (Aug 2025, 1), StarPlus Energy (Mar–Apr 2025, 3), General Motors (Aug 2025, 1; plus HS 3801.90 in Dec 2024, 1), Tesla (Aug 2025, 1), Aminco Resources (Sep 2025, 3) and Larpen Metallurgical Service (Jun 2026, 2). Two rows to StarPlus carry a cosmetics HS code.",
      "The key transactional evidence: dated, HS-coded shipments from the Indonesian plant to five US battery or auto makers. Two of the shippers are separate Sayari records (fragments 4 and 5).",
      "worked", [PLANT, PLANT_FRAG4, PLANT_FRAG5, ULT_W, ULT_SH, SKBA, STARPLUS, GM, TESLA, AMINCO, LARPEN], "out"),
    s(18, "50:05", "traverse_network", {"entity_id": PLANT_KENDAL, "relationships": ["ships_to"], "max_depth": 1, "limit": 10, "response_mode": "full"},
      "Confirm the US-import record's buyers in the graph.",
      "Downstream (INV-5)",
      "Three ships_to links: Ultium Cells Warren (Warren, Ohio), General Motors and Tesla Inc.",
      "Matches s011. The same three US buyers appear whether you start from the US-import record or from the shipment search.",
      "worked", [PLANT_KENDAL, ULT_W, GM, TESLA], "out"),
    s(19, "50:20", "find_shortest_path", {"source_entity_id": PLANT, "target_entity_id": BTR},
      "What is the shortest link between the Indonesian plant and BTR in China?",
      "Inferred links (INV-6)",
      "One hop: a ships_to trade link. No ownership path.",
      "In Sayari, the plant and its reported parent are connected by trade, not by any registry record.",
      "partial", [PLANT, BTR], "owner"),
    s(20, "50:35", "find_downstream_entities", {"entity_id": BTR, "countries": ["IDN", "MAR"], "max_depth": 3, "limit": 15},
      "Which Indonesian or Moroccan companies does BTR own, according to registry data?",
      "Ownership (INV-3)",
      "One path: BTR → Changzhou Liyuan New Energy Technology (China) → Liyuan (Indonesia) New Energy Co. Both links are shareholder_of. The anode plant is not in the list.",
      "Sayari can see BTR's registry links in general, so the missing link to the anode plant is a coverage gap for this PT, not a tool failure.",
      "partial", [BTR, LIYUAN_CZ, LIYUAN_ID], "owner"),
    s(21, "50:50", "check_watchlist", {"entity_id": PLANT, "max_depth": 3, "limit": 10, "response_mode": "compact"},
      "Is the plant connected to sanctioned or watch-listed parties?",
      "Screening (INV-6)",
      "No direct hit. Ten sanctioned parties two hops away, every path through a logistics firm or trader (e.g. Sinotrans Central China, Sky Fortune Freight, Mitsubishi Corporation) to an unrelated Russian, Sudanese or Turkish company.",
      "Noise from shared freight forwarders, exactly what the guidance warned about. Not a finding about the plant.",
      "partial", [PLANT], "gap"),
    s(22, "51:05", "get_entity_summary", {"entity_id": PLANT_FRAG4},
      "Who is the 'PT Indonesia BTR New Energy' shipper that sent graphite to GM?",
      "Entity resolution (INV-2)",
      "A fourth record. Its address field starts with 'MATERIAL. Jl. Indraprasta No. 8 Kwsn Ind Kendal', meaning the end of the company name spilled into the address. Sources: China, Indonesia, Malaysia and US trade data.",
      "Same street address and the missing word of the name. Possibly the same as the anchor (Inferred).",
      "worked", [PLANT_FRAG4], "plant"),
    s(23, "51:10", "get_entity_summary", {"entity_id": PLANT_FRAG5},
      "Who is the 'PT Indonesia BTR' shipper that sent graphite to Tesla and GM?",
      "Entity resolution (INV-2)",
      "A fifth record. Same Kendal address (Jl. Indraprasta No. 8). Sources: Indonesia, Japan and South Korea trade data. 12 shipments sent.",
      "Same street address, shortened name. Possibly the same as the anchor (Inferred). Five Sayari records describe what is most likely one plant.",
      "worked", [PLANT_FRAG5], "plant"),
    s(24, "51:30", "search_trade_facets", {"scope": "shipments", "query": "artificial graphite", "hs_code": "380110", "arrival_country": "USA", "date_from": "2024-01-01"},
      "Where does US-bound artificial graphite come from?",
      "Corridor context (INV-8 preview)",
      "About 47,000 HS 3801.10 shipments to the US since Jan 2024. Top departure countries: Spain 8,862, China 5,244, India 3,661, Germany 3,535, Morocco 3,088, Netherlands 2,993, Mexico 2,939, Belgium 2,385. General Motors is among the top ten buyers.",
      "Indonesia is a small corridor by count, so the BTR trail would be easy to miss in aggregate data. Morocco, where BTR is building a second plant, is already a large corridor and is the natural Case 2.",
      "worked", [GM], "corridor"),
]

# ---------------------------------------------------------------------------
# Entities (our wording; Sayari IDs kept so every node links back)
# ---------------------------------------------------------------------------
def ent(id, name, country, role, summary, calls, flags=None, identifiers=None, kind="company", records=None):
    return {
        "id": id, "name": name, "country": country, "type": kind, "role": role,
        "risk_flags": flags or [], "identifiers": identifiers or {},
        "summary": summary, "source_call_ids": calls,
        "sayari_url": f"https://graph.sayari.com/resource/entity/{id}",
        **({"records": records} if records else {}),
    }

ENTITIES = [
    ent(BTR, "BTR New Material Group Co., Ltd.", "CHN", "parent",
        "Shenzhen-based anode producer named in the US AD case. Sayari shows it shipping artificial graphite and coke to the Indonesian plant, but no ownership link to it.",
        ["s008", "s013", "s014", "s019", "s020"],
        ["sheffield_hallam_university_forced_labor_entity", "owner_of_forced_labor_xinjiang_entity", "soe_adjacent"],
        {"cn_uscc": "914403007230429091"}),
    ent(BTR_SALES, "BTR New Material Group Sales Co., Ltd.", "CHN", "trader",
        "BTR's sales company at No. 8 Guangyuan 4th Road, Shenzhen. Listed as a supplier to the plant; HS detail not pulled.",
        ["s013"], ["forced_labor_sheffield_hallam_university_reports_origin_subtier"]),
    ent(RUIQING, "Shenzhen Ruiqing New Energy Technology Co., Ltd.", "CHN", "trader",
        "Trader registered in Room 1108 of the 'BTR Building', No. 8 Guangyuan 4th Road. The largest single shipper of graphite and coke to the plant (Dec 2023 – Jun 2026). Appears as three Sayari records.",
        ["s013", "s014"], ["psa_owned_by_chinese_soe"]),
    ent(TWIGG, "Twigg Exploration & Mining, Lda", "MOZ", "producer",
        "Mozambique graphite miner that shipped natural graphite (HS 2504) to the plant in 2024–2025. Appears as three Sayari records.",
        ["s013", "s014"]),
    ent(SYRAH, "Syrah Global DMCC", "ARE", "trader",
        "Syrah Resources' Dubai trading arm (100% owned, per Syrah's annual report; see Case 8). Shipped natural graphite (HS 2504) to BTR's Indonesian plant, Jan–Apr 2026.",
        ["s013", "s014"]),
    ent(ERG, "ERG Madagascar", "MDG", "producer",
        "Madagascar graphite producer that shipped natural graphite (HS 2504) to the plant, 2025–2026.",
        ["s013", "s014"]),
    ent(PLANT, "PT Indonesia BTR New Energy Material", "IDN", "transit_plant",
        "Anode plant with sites at IMIP Morowali and Kendal. The anchor record: tax ID, LEI and the most trade history (78 sent, 4,083 received).",
        ["s005", "s008", "s009", "s013", "s014", "s017", "s019", "s021"],
        ["chinese_soe_adjacent", "forced_labor_uflpa_origin_subtier", "psa_imports_from_usa_bis_entity"],
        {"lei": "254900G3L2Z0HNRV7W43", "idn_tax_id": "0625540349086000"},
        records=5),
    ent(PLANT_KENDAL, "PT Indonesia BTR New Energy Materi (record 2)", "IDN", "transit_plant",
        "Kendal-only record built from US import data. Same street address as the anchor, name cut off. 37 shipments sent.",
        ["s006", "s011", "s018"], ["psa_imports_from_usa_bis_entity"]),
    ent(PLANT_JKT, "PT Indonesia BTR New Energy Material (record 3)", "IDN", "transit_plant",
        "Company-gazette record with only 'Jakarta Barat' as an address. No trade, no identifiers.",
        ["s007"]),
    ent(PLANT_FRAG4, "PT Indonesia BTR New Energy (record 4)", "IDN", "transit_plant",
        "Trade-data record whose name lost the word 'Material' into the address field. Same Kendal street address.",
        ["s017", "s022"]),
    ent(PLANT_FRAG5, "PT Indonesia BTR (record 5)", "IDN", "transit_plant",
        "Trade-data record with a shortened name and the same Kendal street address. 12 shipments sent.",
        ["s017", "s023"]),
    ent(ULT_W, "Ultium Cells Warren", "USA", "us_buyer",
        "GM–LG Energy Solution cell plant in Warren, Ohio. Received HS 3801.10 from the plant, Jun–Aug 2025.",
        ["s008", "s011", "s017", "s018"]),
    ent(ULT_SH, "Ultium Cells Spring Hill", "USA", "us_buyer",
        "GM–LG Energy Solution cell plant in Spring Hill, Tennessee. Received HS 3801.10, Aug 2025.",
        ["s008", "s017"]),
    ent(SKBA, "SK Battery America", "USA", "us_buyer",
        "SK On cell plant in Georgia. Received HS 3801.10, Aug 2025.",
        ["s017"]),
    ent(STARPLUS, "StarPlus Energy, LLC", "USA", "us_buyer",
        "Stellantis–Samsung SDI cell joint venture in Indiana. Received HS 3801.10, Mar–Apr 2025.",
        ["s017"]),
    ent(GM, "General Motors", "USA", "us_buyer",
        "Received HS 3801.10 (Aug 2025) and HS 3801.90 (Dec 2024) from BTR Indonesia records. A top-ten US buyer of HS 3801.10 overall.",
        ["s011", "s017", "s018", "s024"]),
    ent(TESLA, "Tesla, Inc.", "USA", "us_buyer",
        "Received HS 3801.10 from a BTR Indonesia record, Aug 2025.",
        ["s011", "s017", "s018"]),
    ent(AMINCO, "Aminco Resources LLC", "USA", "trader",
        "US trading company. Received artificial graphite in 0.2–8 mm grades, Sep 2025. Grain sizes suggest industrial rather than battery use (our reading).",
        ["s008", "s017"], ["mass_address_usage"]),
    ent(LARPEN, "Larpen Metallurgical Service", "USA", "trader",
        "Metallurgical service company. Received artificial graphite in 1–10 mm grades, Jun 2026: likely not battery use (our reading).",
        ["s017"]),
    ent(LIYUAN_CZ, "Changzhou Liyuan New Energy Technology Co., Ltd.", "CHN", "contrast",
        "Chinese company in which Sayari's registry data shows BTR as a shareholder.",
        ["s020"]),
    ent(LIYUAN_ID, "Liyuan (Indonesia) New Energy Co., Ltd.", "IDN", "contrast",
        "Indonesian company held through Changzhou Liyuan. Shows Sayari can see some of BTR's Indonesian holdings, just not the anode plant.",
        ["s020"]),
]

# ---------------------------------------------------------------------------
# Edges
# ---------------------------------------------------------------------------
def edge(id, src, tgt, rel, etype, conf, evidence, calls, hs=None, first=None, last=None, n=None, flag=None):
    return {
        "id": id, "source": src, "target": tgt, "relation": rel,
        "edge_type": etype, "confidence": conf,
        "hs_codes": hs or [], "first_seen": first, "last_seen": last, "shipment_count": n,
        "evidence": evidence, "source_call_ids": calls,
        **({"flag": flag} if flag else {}),
    }

EDGES = [
    # Entity resolution (inferred)
    edge("e001", PLANT_KENDAL, PLANT, "possibly_same_as", "inferred", "inferred",
         "Same street address (Jl. Indraprasta No. 8, Kendal Industrial Estate), truncated name, and a shared US buyer (Ultium Cells Warren). No shared identifier.",
         ["s005", "s006", "s011"]),
    edge("e002", PLANT_FRAG4, PLANT, "possibly_same_as", "inferred", "inferred",
         "Same Kendal street address; the missing word 'Material' sits at the start of the address field.",
         ["s005", "s022"]),
    edge("e003", PLANT_FRAG5, PLANT, "possibly_same_as", "inferred", "inferred",
         "Same Kendal street address; shortened name. No shared identifier.",
         ["s005", "s023"]),
    edge("e004", PLANT_JKT, PLANT, "possibly_same_as", "inferred", "lead",
         "Exact legal name, but the only address is 'Jakarta Barat' and there are no identifiers. Name alone is not enough to merge.",
         ["s005", "s007", "s004"]),
    # Shared address (inferred)
    edge("e005", RUIQING, BTR_SALES, "shares_address", "inferred", "inferred",
         "Both registered at No. 8 Guangyuan 4th Road, Guangming District, Shenzhen. Ruiqing's address names the 'BTR Building', room 1108.",
         ["s013"]),
    edge("e006", BTR_SALES, BTR, "group_name_match", "inferred", "lead",
         "Name and district match the parent group. No registry link was pulled.",
         ["s013"]),
    # Ownership (contractual)
    edge("e010", BTR, PLANT, "owns", "contractual", "corroborated",
         "Not in Sayari (find_beneficial_owners returned 0; shortest path is trade only). BTR's own press release calls the plant its Indonesian facility; one trade directory gives 70% BTR, 30% Stellar Investment (single source).",
         ["s009", "s019", "t012"]),
    edge("e011", BTR, LIYUAN_CZ, "owns", "contractual", "documented",
         "Registry shareholder_of link in Sayari.", ["s020"]),
    edge("e012", LIYUAN_CZ, LIYUAN_ID, "owns", "contractual", "documented",
         "Registry shareholder_of link in Sayari.", ["s020"]),
    # Inbound (transactional)
    edge("e020", BTR, PLANT, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801) in Dec 2025; also petroleum coke (HS 2713, Feb–Jun 2026) and carbon (HS 2803).",
         ["s008", "s014"], ["3801", "2713", "2803"], "2025-12-02", "2026-06-30"),
    edge("e021", RUIQING, PLANT, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801) Dec 2023 – Jun 2026, natural graphite (HS 2504) Oct 2024 – Jun 2026, plus coke, clays and carbon electrodes.",
         ["s013", "s014"], ["3801", "2504", "2713"], "2023-12-19", "2026-06-23"),
    edge("e022", BTR_SALES, PLANT, "ships_to", "transactional", "lead",
         "Listed among the plant's 90 suppliers. HS and dates not pulled.",
         ["s013"]),
    edge("e023", TWIGG, PLANT, "ships_to", "transactional", "documented",
         "Natural graphite (HS 2504) from Mozambique, Apr 2024 – Dec 2025.",
         ["s014"], ["2504"], "2024-04-05", "2025-12-11"),
    edge("e024", SYRAH, PLANT, "ships_to", "transactional", "documented",
         "Natural graphite (HS 2504) shipped from the UAE, Jan–Apr 2026.",
         ["s014"], ["2504"], "2026-01-23", "2026-04-13"),
    edge("e025", ERG, PLANT, "ships_to", "transactional", "documented",
         "Natural graphite (HS 2504) from Madagascar, Jun 2025 – Mar 2026.",
         ["s014"], ["2504"], "2025-06-17", "2026-03-27"),
    # Outbound to US (transactional)
    edge("e030", PLANT, ULT_W, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801.10). 3 shipment rows, departures 26 Jun – 12 Aug 2025. Also in the US-import record's graph links.",
         ["s008", "s017"], ["380110"], "2025-06-26", "2025-08-12", 3),
    edge("e031", PLANT, ULT_SH, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801.10). 2 rows, 11–12 Aug 2025.",
         ["s008", "s017"], ["380110"], "2025-08-11", "2025-08-12", 2),
    edge("e032", PLANT, SKBA, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801.10). 1 row, 12 Aug 2025.",
         ["s017"], ["380110"], "2025-08-12", "2025-08-12", 1),
    edge("e033", PLANT, STARPLUS, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801.10). 3 rows, 9 Mar – 12 Apr 2025. Two more rows on the same pair carry a cosmetics code (HS 3304.91), most likely a classification error.",
         ["s017"], ["380110"], "2025-03-09", "2025-04-12", 3),
    edge("e034", PLANT_FRAG4, GM, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801.10). 1 row, 8 Aug 2025.",
         ["s017"], ["380110"], "2025-08-08", "2025-08-08", 1),
    edge("e035", PLANT_FRAG5, GM, "ships_to", "transactional", "documented",
         "Graphite preparations (HS 3801.90). 1 row, 2 Dec 2024. The earliest US-bound row in the result.",
         ["s017"], ["380190"], "2024-12-02", "2024-12-02", 1),
    edge("e036", PLANT_FRAG5, TESLA, "ships_to", "transactional", "documented",
         "Artificial graphite (HS 3801.10). 1 row, 2 Aug 2025.",
         ["s017"], ["380110"], "2025-08-02", "2025-08-02", 1),
    edge("e037", PLANT_KENDAL, TESLA, "ships_to", "transactional", "corroborated",
         "Graph link from US import data; shipment rows seen under record 5 (e036).",
         ["s011", "s018"]),
    edge("e038", PLANT_KENDAL, GM, "ships_to", "transactional", "corroborated",
         "Graph link from US import data; shipment rows seen under records 4 and 5 (e034, e035).",
         ["s011", "s018"]),
    edge("e039", PLANT, AMINCO, "ships_to", "transactional", "documented",
         "Artificial graphite in 0.2–8 mm grades (HS 3801.10). 3 rows, 30 Sep 2025. Grades suggest non-battery use.",
         ["s017"], ["380110"], "2025-09-30", "2025-09-30", 3),
    edge("e040", PLANT, LARPEN, "ships_to", "transactional", "documented",
         "Artificial graphite in 1–10 mm grades (HS 3801.10). 2 rows, 10 Jun 2026. Grades suggest metallurgical use.",
         ["s017"], ["380110"], "2026-06-10", "2026-06-10", 2),
]

# ---------------------------------------------------------------------------
# Case 1
# ---------------------------------------------------------------------------
OUT_US_BATT = ["e030", "e031", "e032", "e033", "e034", "e035", "e036", "e037", "e038"]
CASE1 = {
    "id": "case-1",
    "title": "BTR's Indonesian anode plant",
    "subtitle": "PT Indonesia BTR New Energy Material · Morowali and Kendal, Indonesia",
    "question": "Could Sayari detect Chinese graphite anode material reaching US battery plants through BTR's plant in Indonesia?",
    "overall_confidence": "corroborated",
    "headline": "Yes for the trade, no for the ownership. Sayari shows dated HS 3801.10 shipments from the Indonesian plant to five US battery and auto makers, and Chinese artificial graphite flowing into the same plant. It does not show who owns the plant. That link comes only from open sources.",
    "steps": [
        {"title": "The corridor", "kicker": "Step 1",
         "text": "Since January 2024, about 47,000 shipments of artificial graphite (HS 3801.10) have reached the US. Spain, China, India, Germany and Morocco lead. Indonesia isn't in the top ten, so a single plant's trail is easy to miss in aggregate data.",
         "edge_ids": [], "node_ids": [ULT_W, ULT_SH, SKBA, STARPLUS, GM, TESLA], "call_ids": ["s024"]},
        {"title": "The plant: five records, one site", "kicker": "Step 2 · Inferred",
         "text": "Sayari holds five separate records for the Indonesian plant. Four share the same Kendal street address and a version of the same name. One has only a Jakarta district and is kept as a lead. We treat them as one plant, labelled Inferred, because no identifier links them.",
         "edge_ids": ["e001", "e002", "e003", "e004"], "node_ids": [PLANT, PLANT_KENDAL, PLANT_JKT, PLANT_FRAG4, PLANT_FRAG5], "call_ids": ["s005", "s006", "s007", "s022", "s023"]},
        {"title": "The owner: not in the registry", "kicker": "Step 3 · Contractual",
         "text": "Sayari returns no shareholders for the plant, and its shortest path to BTR in China is a trade link. Sayari does show BTR owning a different Indonesian company (Liyuan), so the gap is specific to this plant. BTR's own press release calls the plant its Indonesian facility, so the ownership edge is shown with that source, not Sayari's.",
         "edge_ids": ["e010", "e011", "e012"], "node_ids": [BTR, PLANT, LIYUAN_CZ, LIYUAN_ID], "call_ids": ["s009", "s019", "s020", "t012"]},
        {"title": "Same product in, same product out", "kicker": "Step 4 · Transactional",
         "text": "Artificial graphite (HS 3801) arrives from BTR and from a trader registered in the BTR Building in Shenzhen. Artificial graphite (HS 3801.10) leaves for Ultium Cells, SK Battery America, StarPlus Energy, GM and Tesla, Dec 2024 to Aug 2025. Natural graphite also arrives from Mozambique, Madagascar and the UAE.",
         "edge_ids": ["e020", "e021", "e005", "e023", "e024", "e025"] + OUT_US_BATT, "node_ids": [], "call_ids": ["s013", "s014", "s017"]},
        {"title": "Where the trail goes dark", "kicker": "Step 5 · Gap",
         "text": "Trade records can't show which input went into which export, so Chinese-origin content can't be measured. Supplier rollups by HS code returned 0, and two name filters were silently ignored. Battery-maker shipments in our results stop after Aug 2025; later rows go to industrial buyers. We haven't tested why.",
         "edge_ids": ["e039", "e040"], "node_ids": [AMINCO, LARPEN], "call_ids": ["s010", "s015", "s016", "s021"]},
    ],
    "verdict": {
        "detected": [
            {"text": "Dated HS 3801.10 shipments from the Indonesian plant to Ultium Cells (Warren and Spring Hill), SK Battery America, StarPlus Energy, GM and Tesla, Dec 2024 – Aug 2025.", "call_ids": ["s017", "s011", "s018"]},
            {"text": "Artificial graphite (HS 3801) shipped into the plant from China by BTR and by a trader registered in the BTR Building, Dec 2023 – Jun 2026.", "call_ids": ["s013", "s014"]},
            {"text": "Five fragmented Sayari records for one plant, four of them tied by a shared street address.", "call_ids": ["s005", "s006", "s007", "s022", "s023"]},
        ],
        "suggested": [
            {"text": "Chinese parent ownership: the parent's name, a trade link and BTR's own press release point the same way, but Sayari has no registry record of it.", "call_ids": ["s009", "s019", "t012"]},
            {"text": "A same-group trading arm: Shenzhen Ruiqing shares the BTR Building address and is the plant's busiest graphite shipper.", "call_ids": ["s013"]},
            {"text": "Forced-labor exposure: sub-tier flags on the plant come through 'possibly the same as' paths; the parent is named in Sheffield Hallam forced-labor reports (per Sayari).", "call_ids": ["s003", "s005", "s019"]},
        ],
        "not_visible": [
            {"text": "Who owns the plant, and in what shares (the PFE test turns on this).", "call_ids": ["s009"]},
            {"text": "How much Chinese-origin graphite is inside any US-bound shipment. Trade data has no lot-level tracing.", "call_ids": ["s014"]},
            {"text": "Why battery-maker shipments in our results stop after Aug 2025: data lag, a policy response or a change of route are all possible.", "call_ids": ["s017"]},
        ],
    },
    "passport": [
        {"field": "Place of manufacture", "guidance_no": "8",
         "declared": "The cell plant's location, e.g. USA.",
         "paper_trail": "Anode material shipped from Kendal and Morowali, Indonesia (HS 3801.10).",
         "gap": True, "note": "The field covers the battery, not its anode."},
        {"field": "Detailed composition (anode)", "guidance_no": "45",
         "declared": "'Graphite' as the anode active material.",
         "paper_trail": "Artificial graphite from BTR Indonesia, whose inputs include HS 3801 from China and natural flake from Mozambique and Madagascar.",
         "gap": True, "note": "Composition says what, not where from."},
        {"field": "Critical raw materials > 0.1%", "guidance_no": "15",
         "declared": "Natural graphite listed if present.",
         "paper_trail": "Both natural (HS 2504) and artificial (HS 3801) graphite in the plant's inputs.",
         "gap": False, "note": "Consistent, if declared."},
        {"field": "Responsible-sourcing (due-diligence) report", "guidance_no": "19",
         "declared": "Deferred under the EU Battery Regulation.",
         "paper_trail": "Sub-tier forced-labor flags on the plant; the parent is named in Sheffield Hallam reports.",
         "gap": True, "note": "The flags exist before the report does."},
        {"field": "Ownership of upstream suppliers", "guidance_no": "—",
         "declared": "No such field in the EU passport.",
         "paper_trail": "Parent is China's BTR (open sources); not visible in Sayari's registry data.",
         "gap": True, "note": "The US PFE rules ask exactly this question."},
    ],
    "red_flags": [
        {"flag": "Chinese parent ownership of the transit plant", "signal": "contractual", "severity": "High", "result": "suggested", "note": "Open sources plus trade and name; no registry record."},
        {"flag": "Same HS imported from China and exported to the US", "signal": "transactional", "severity": "High", "result": "detected", "note": "HS 3801 in from China; HS 3801.10 out to US cell plants."},
        {"flag": "Recent incorporation vs. first export date", "signal": "contractual", "severity": "Medium", "result": "not_visible", "note": "Sayari had no incorporation date for any of the five records."},
        {"flag": "Volume spike after a policy date", "signal": "transactional", "severity": "Medium", "result": "not_visible", "note": "Too few rows to test; battery-maker rows cluster Mar–Aug 2025."},
        {"flag": "Shared address or officer with a flagged entity", "signal": "inferred", "severity": "Medium", "result": "detected", "note": "Ruiqing trades from the BTR Building; BTR is in Sheffield Hallam reports."},
        {"flag": "Entity-resolution fragmentation", "signal": "inferred", "severity": "Low (disclose)", "result": "detected", "note": "Five records for one plant."},
        {"flag": "Forced-labor / UFLPA sub-tier flags", "signal": "inferred", "severity": "Medium", "result": "detected", "note": "Through 'possibly the same as' paths; context, not a finding."},
    ],
    "caveats": [
        "Processing Chinese inputs in a third country is legal and common. Nothing here shows wrongdoing by any company named.",
        "The US buyers are named because they appear in customs records; this says nothing about their compliance.",
        "Entity-resolution links are our judgment and could be wrong.",
        "HS 3801.10 also covers non-battery graphite (electrodes, refractories). Grain-size wording on some rows suggests industrial use.",
        "Trade data has gaps: Indonesian export coverage is partial and dates may lag.",
    ],
}

CASE1.update({
    "slug": "btr-indonesia",
    "question": "Can Sayari show Chinese graphite being processed in BTR's Indonesian plant and shipped on to US battery makers, and who owns the plant?",
    "answer_label": "Partly",
    "answer": "The trade, yes: Chinese artificial graphite goes in, and graphite goes out to Ultium Cells, SK Battery America, StarPlus Energy, GM and Tesla. The ownership, no: Sayari has no registry record of BTR owning the plant, so that link rests on BTR's own statements.",
    "why_it_matters": "This is the pattern US tax-credit rules target: a Chinese company's plant in a third country supplying US battery makers. A buyer that only checks the country of origin sees 'Indonesia'. Only the ownership check shows 'BTR', and that is the part Sayari couldn't confirm.",
    "country": "IDN",
    "plant_status": "operating",
    "pattern": "rerouting-pattern",
    "summary_for_non_experts": "BTR is China's biggest maker of battery anode material. In 2024 it opened a large anode plant in Indonesia. Sayari's trade records show Chinese graphite going into that plant and graphite coming out of it to five US battery and car makers. What the records don't show is who owns the plant, which is the question US tax-credit rules now turn on.",
    "key_numbers": [
        {"value": "19", "label": "shipment rows from the plant to US buyers", "call_ids": ["s017"]},
        {"value": "5", "label": "US battery or car makers named in those records", "call_ids": ["s017"]},
        {"value": "5", "label": "separate Sayari records for one plant", "call_ids": ["s005", "s006", "s007", "s022", "s023"]},
        {"value": "0", "label": "registry records of who owns it", "call_ids": ["s009"]},
    ],
})

# Why each Case 1 edge has the rating it has (shown on the site).
CONF_REASON_C1 = {
    "e001": "Shared street address and a shared US buyer, but no shared identifier, so it's our judgment, not a record.",
    "e002": "Shared street address and the missing word of the name; no identifier links them.",
    "e003": "Shared street address and a shortened name; no identifier links them.",
    "e004": "Name match only; the address is just a district. One weak signal.",
    "e005": "Both addresses name No. 8 Guangyuan 4th Road; matching attributes, no record of a relationship.",
    "e006": "Name and district only. One weak signal.",
    "e010": "Two sources agree: BTR's own press release and a trade directory, backed by the trade link and the plant's name. Sayari's registry has no record.",
    "e011": "Registry shareholder record in Sayari.",
    "e012": "Registry shareholder record in Sayari.",
    "e020": "Sayari returned HS-coded trade records with dates.",
    "e021": "Sayari returned HS-coded trade records with dates.",
    "e022": "Listed as a supplier in Sayari's graph, but we didn't pull the shipment records.",
    "e023": "Sayari returned HS-coded trade records with dates.",
    "e024": "Sayari returned HS-coded trade records with dates.",
    "e025": "Sayari returned HS-coded trade records with dates.",
    "e030": "Dated shipment rows (HS 3801.10) naming both parties.",
    "e031": "Dated shipment rows (HS 3801.10) naming both parties.",
    "e032": "Dated shipment row (HS 3801.10) naming both parties.",
    "e033": "Dated shipment rows (HS 3801.10) naming both parties.",
    "e034": "Dated shipment row (HS 3801.10) naming both parties.",
    "e035": "Dated shipment row (HS 3801.90) naming both parties.",
    "e036": "Dated shipment row (HS 3801.10) naming both parties.",
    "e037": "Two signals: a graph link in US import data, plus shipment rows under a sibling record.",
    "e038": "Two signals: a graph link in US import data, plus shipment rows under sibling records.",
    "e039": "Dated shipment rows (HS 3801.10) naming both parties.",
    "e040": "Dated shipment rows (HS 3801.10) naming both parties.",
}

# Context calls for the overview (made 14 Oct 2026, after the first batch).
GENERAL_CALLS = [
    {"id": "t015", "timestamp": "2026-10-14T19:25:40Z", "server": "tavily", "tool": "tavily_search",
     "params": {"query": "IEA China share of global battery anode material production graphite percent", "max_results": 5, "search_depth": "advanced"},
     "question": "How much of the world's battery anode material comes from China?",
     "purpose": "company context",
     "result_summary": "Electrive's summary of the IEA's 2025 battery report: China supplies over 90% of anode materials, mostly graphite, and does about 80% of graphite mining and over 90% of refining. It also notes that Indonesia is expected to add some diversification.",
     "interpretation": "This is why third-country anode plants matter: almost all battery-grade graphite processing is in China, so any 'non-Chinese' anode supply is worth checking.",
     "scorecard": "worked", "entity_ids": [], "step": "context", "case_id": "general",
     "source_url": "https://www.electrive.com/2025/06/03/iea-report-dimensions-and-trends-of-the-global-battery-market"},
    {"id": "t016", "timestamp": "2026-10-14T19:25:55Z", "server": "tavily", "tool": "tavily_search",
     "params": {"query": "graphite share of lithium-ion battery anode by weight EV battery graphite kg per vehicle", "max_results": 5},
     "question": "How much of an EV battery is graphite?",
     "purpose": "company context",
     "result_summary": "A USITC working paper on graphite in EV batteries (Table C.2, citing Argonne's GREET model) gives graphite as 21% of cell weight for NMC-622 cells, 22.1% for NCA and 16.8% for LFP.",
     "interpretation": "Graphite is roughly a fifth of a battery cell by weight, more than any other mineral, so its origin matters for tax-credit rules.",
     "scorecard": "worked", "entity_ids": [], "step": "context", "case_id": "general",
     "source_url": "https://www.usitc.gov/publications/332/working_papers/gvc_paper.pdf"},
]

OVERVIEW = {
    "facts": [
        {"value": "90%+", "label": "of the world's battery anode material is made in China", "source": "IEA, via Electrive (Jun 2025)", "url": "https://www.electrive.com/2025/06/03/iea-report-dimensions-and-trends-of-the-global-battery-market", "call_ids": ["t015"]},
        {"value": "~1/5", "label": "of an EV battery cell's weight is graphite (17–22%, by chemistry)", "source": "USITC working paper", "url": "https://www.usitc.gov/publications/332/working_papers/gvc_paper.pdf", "call_ids": ["t016"]},
        {"value": "93.5%", "label": "anti-dumping margin Commerce found for BTR and other Chinese anode makers in Feb 2026, never imposed", "source": "ITA fact sheet", "url": "https://www.trade.gov/final-affirmative-determinations-antidumping-and-countervailing-duty-investigations-active-anode", "call_ids": ["t005", "t006"]},
        {"value": "~47,000", "label": "shipments of artificial graphite (HS 3801.10) into the US since Jan 2024", "source": "Sayari trade data", "url": "method.html#s024", "call_ids": ["s024"]},
    ],
}

# ---------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------
SOURCES = [
    {"id": "sayari", "name": "Sayari Graph via Sayari MCP", "type": "commercial data (licensed)", "url": "https://graph.sayari.com/", "used_for": "Entities, relationships, trade records, risk flags. Published here as our own summaries only."},
    {"id": "tavily", "name": "Tavily MCP (web search and extract)", "type": "search tool", "url": "https://tavily.com/", "used_for": "Policy dates and company context, re-checked against primary sources where possible."},
    {"id": "fr", "name": "Federal Register", "type": "primary (US government)", "url": "https://www.federalregister.gov/", "used_for": "Commerce AD/CVD final determinations, 91 FR 7247 and 91 FR 7261."},
    {"id": "irs", "name": "IRS Notice 2026-15", "type": "primary (US government)", "url": "https://www.irs.gov/pub/irs-drop/n-26-15.pdf", "used_for": "PFE material-assistance guidance."},
    {"id": "usitc", "name": "USITC news release, 12 Mar 2026", "type": "primary (US government)", "url": "https://www.usitc.gov/press_room/news_release/2026/er0312_68281.htm", "used_for": "Negative final determination on active anode material."},
    {"id": "trade_gov", "name": "ITA fact sheet (trade.gov)", "type": "primary (US government)", "url": "https://www.trade.gov/final-affirmative-determinations-antidumping-and-countervailing-duty-investigations-active-anode", "used_for": "AD/CVD rates."},
    {"id": "btr", "name": "BTR press releases", "type": "company self-declaration", "url": "https://www.btrchina.com/en/News/info.aspx?itemid=1243", "used_for": "Indonesian and Moroccan plant details."},
    {"id": "opensanctions", "name": "OpenSanctions", "type": "open data (planned cross-check)", "url": "https://www.opensanctions.org/", "used_for": "Iteration 2 cross-check; not yet used."},
    {"id": "comtrade", "name": "UN Comtrade", "type": "open data (planned baseline)", "url": "https://comtradeplus.un.org/", "used_for": "Iteration 2 corridor baselines; not yet used."},
]


CASE_ORDER = ["case-1", "case-2", "case-3", "case-4", "case-5"]
REQUIRED_EDGE = {"id", "source", "target", "relation", "edge_type", "confidence", "evidence", "source_call_ids"}


def load_case_files():
    """Cases 2-5 were investigated separately; each file holds case, entities, edges, calls."""
    out = []
    for f in sorted((ROOT / "investigation" / "cases").glob("case*.json")):
        out.append(json.loads(f.read_text()))
    return out


def main():
    tavily = json.loads((NOTES / "tavily_calls.json").read_text())
    step_for = {"policy verification": "policy", "company context": "context"}
    for t in tavily:
        t.setdefault("entity_ids", [])
        t["step"] = step_for.get(t.get("purpose"), "policy")
        t["case_id"] = "case-1" if t["id"] in ("t012", "t013", "t014") else "general"
    for c in SAYARI_CALLS:
        c["case_id"] = "case-1"

    for e in ENTITIES:
        e["case_ids"] = ["case-1"]
        e["case_roles"] = {"case-1": e["role"]}
    for e in EDGES:
        e["case_ids"] = ["case-1"]
        e["confidence_reason"] = CONF_REASON_C1[e["id"]]

    entities = {e["id"]: e for e in ENTITIES}
    edges = list(EDGES)
    calls = SAYARI_CALLS + tavily + GENERAL_CALLS
    cases = [CASE1]

    for bundle in load_case_files():
        case = bundle["case"]
        cid = case["id"]
        for c in bundle["calls"]:
            c["case_id"] = cid
            c.setdefault("entity_ids", [])
            calls.append(c)
        for e in bundle["entities"]:
            e.setdefault("sayari_url", f"https://graph.sayari.com/resource/entity/{e['id']}")
            e.setdefault("risk_flags", []); e.setdefault("identifiers", {}); e.setdefault("type", "company")
            if e["id"] in entities:
                cur = entities[e["id"]]
                cur["source_call_ids"] = sorted(set(cur["source_call_ids"]) | set(e.get("source_call_ids", [])))
                cur["case_ids"] = sorted(set(cur["case_ids"]) | {cid})
                cur.setdefault("case_summaries", {})[cid] = e.get("summary", "")
                cur.setdefault("case_roles", {})[cid] = e.get("role", cur["role"])
            else:
                e["case_ids"] = [cid]
                e["case_roles"] = {cid: e.get("role", "contrast")}
                entities[e["id"]] = e
        for e in bundle["edges"]:
            missing = REQUIRED_EDGE - set(e)
            assert not missing, (cid, e.get("id"), missing)
            e.setdefault("hs_codes", []); e.setdefault("first_seen", None); e.setdefault("last_seen", None)
            e.setdefault("shipment_count", None); e.setdefault("confidence_reason", "")
            e["case_ids"] = [cid]
            edges.append(e)
        cases.append(case)

    cases.sort(key=lambda c: CASE_ORDER.index(c["id"]) if c["id"] in CASE_ORDER else 99)
    calls.sort(key=lambda c: c["timestamp"])
    entities = list(entities.values())
    timeline = json.loads((NOTES / "policy_timeline_raw.json").read_text())

    # Integrity checks: every referenced id must exist and be unique.
    ent_ids = {e["id"] for e in entities}
    call_ids = [c["id"] for c in calls]
    assert len(call_ids) == len(set(call_ids)), "duplicate call ids"
    call_ids = set(call_ids)
    edge_ids = [e["id"] for e in edges]
    assert len(edge_ids) == len(set(edge_ids)), "duplicate edge ids"
    edge_ids = set(edge_ids)
    for e in edges:
        assert e["source"] in ent_ids and e["target"] in ent_ids, e["id"]
        assert set(e["source_call_ids"]) <= call_ids, (e["id"], set(e["source_call_ids"]) - call_ids)
        assert e["confidence"] in ("documented", "corroborated", "inferred", "lead"), e["id"]
        assert e["edge_type"] in ("transactional", "contractual", "inferred"), e["id"]
    for e in entities:
        assert set(e["source_call_ids"]) <= call_ids, (e["id"], set(e["source_call_ids"]) - call_ids)
    for c in cases:
        for st in c["steps"]:
            assert set(st["edge_ids"]) <= edge_ids, (c["id"], st["title"], set(st["edge_ids"]) - edge_ids)
            assert set(st["node_ids"]) <= ent_ids, (c["id"], st["title"], set(st["node_ids"]) - ent_ids)
            assert set(st["call_ids"]) <= call_ids, (c["id"], st["title"], set(st["call_ids"]) - call_ids)
        for k in c.get("key_numbers", []):
            assert set(k["call_ids"]) <= call_ids, (c["id"], k)
        for col in c["verdict"].values():
            for v in col:
                assert set(v["call_ids"]) <= call_ids, (c["id"], v)
    for t in timeline:
        assert set(t["source_call_ids"]) <= call_ids, t["date"]
    for f in OVERVIEW["facts"]:
        assert set(f["call_ids"]) <= call_ids, f

    meta = {"as_of": AS_OF, "generated_by": "investigation/build_data.py"}
    out = {
        "entities.json": {**meta, "items": entities},
        "edges.json": {**meta, "items": edges},
        "cases.json": {**meta, "items": cases},
        "call_log.json": {**meta, "items": calls},
        "policy_timeline.json": {**meta, "items": timeline},
        "sources.json": {**meta, "items": SOURCES},
        "overview.json": {**meta, **OVERVIEW},
    }
    DATA.mkdir(exist_ok=True)
    for name, obj in out.items():
        (DATA / name).write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")
    n_s = sum(c["server"] == "sayari" for c in calls)
    print(f"{len(cases)} cases, {len(entities)} entities, {len(edges)} edges, "
          f"{len(calls)} calls ({n_s} Sayari, {len(calls) - n_s} Tavily), {len(timeline)} policy rows")


if __name__ == "__main__":
    main()
