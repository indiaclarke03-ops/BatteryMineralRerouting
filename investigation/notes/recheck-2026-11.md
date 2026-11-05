# Monthly re-check, November 2026 (run 5 Nov 2026)

Scope: the monthly scheduled check of all 12 cases. For each case we resolved the main plant record, re-ran the ownership trace, and searched trade rows for the quoted plant name (graphite HS 3801 / 2504, cells HS 8507, nickel). Sayari date filters were not relied on; rows were judged by their own dates. Other re-checks ran earlier on 5 Nov (see `recheck-2026-11-05-a` to `-d`), so this run mostly confirms that nothing has moved since.

**Result: no new changes.** Two Sayari IDs (BTR Indonesia, Syrah Technologies LLC) still fail to open. Both are already mapped to their replacement records in `investigation/recheck_additions.json` (`retired_ids`), so no new action is needed. No new graphite, cell or nickel rows were dated after the earlier 5 Nov check, no first-ever exports appeared, and no ownership change was found. Sayari returned oversized shareholder lists for four plants; they were read from the saved result files.

## Summary table

| case | plant | what was checked | result | details |
|---|---|---|---|---|
| case-1 | PT Indonesia BTR New Energy Material | ID, owners, US trade | NO CHANGE | The old ID 2omCekb1… still errors (m2611-01). A name search finds one record, ekoH1fr8…, with the same Kendal/IMIP addresses and an LEI (m2611-13); this mapping is already in place. Ownership: 0 owners in Sayari (m2611-24), so the 60% BTR / 40% Stellar Investment card (from BTR exchange filings) stands. US rows: 68 in total; the latest are 16 Oct 2026 (3 rows to FNS Inc: artificial graphite 3801.10 and carbon anode material 3801.90), a 19 Sep 2026 row and a Jan 2026 row to Tesla (m2611-26). Nothing newer. |
| case-2 | BTR Mediterranean (Tangier) | summary, owners, trade (watch) | NO CHANGE | Both Moroccan records open (m2611-02, -09). Owners unchanged: BNUO International Holding (Singapore) and BTR New Material Group for the first company (m2611-15); Rian International Holding and BTR New Material Group for the anode company (m2611-20). Trade: 17 rows, all inbound. They are construction goods from China (racks, pipes, cabinets) and the three graphite rows from BTR Indonesia on 19 Aug 2026. No exports from Tangier (m2611-27). |
| case-3 | Zhongke Xingcheng Sohar (Oman) | search, trade (watch) | NO CHANGE | Still no Sayari record for the Oman project company (m2611-03, -37). No shipments arriving in Oman for "Zhongke" graphite (m2611-38). A web result lists the Shinzoom Oman plant as under construction (m2611-39). No ownership check was possible without a record. |
| case-4 | POSCO Future M | summary, owners, US trade | NO CHANGE | Record opens (m2611-04). Owners: POSCO Holdings (several records) plus NPS, POSTECH and the employee share association among 50 listed holders (m2611-16); consistent with the 58.2% card. US rows in Oct 2026 are cathode material (HS 2841.90) to GM and StarPlus Energy, none of graphite (m2611-30). |
| case-5 | Zichen Malaysia | summary, owners, trade (watch) | NO CHANGE | Record opens, still 0 trade, registered 23 Sep 2025 (m2611-05). Owners: Putailai (Singapore) Pte. Ltd. and the Shanghai Putailai shareholder list (m2611-17); no change to directors or shareholders seen. "Zichen Malaysia" returns 0 rows (m2611-28). Jiangxi Zichen (China) US rows: 10 in total, latest Jul 2025 (m2611-29). |
| case-6 | EVE Energy Malaysia | summary, owners, US trade | NO CHANGE | Record opens (m2611-06). Owners: EVE Asia Co., Limited and a long list of EVE Energy holders (m2611-18). US cell rows (8507): 29 in total; the latest is 12 Oct 2026 (7 rows to Briggs & Stratton via Singapore/China, Jul–Oct 2026) (m2611-31). Already on the site. |
| case-7 | Gotion Inc. (Fremont) and Gotion Illinois | summary, owners, graphite trade | NO CHANGE | Gotion, Inc. record is active as of 19 Oct 2026 (m2611-07). 0 owners in Sayari (m2611-19), so the card (Gotion High-Tech) rests on filings. Graphite (HS 3801) to the US: still the same 2 rows from Hefei Gotion, Dec 2025 (m2611-32). A web search found the 22 Oct 2026 report that Gotion settled with Green Charter Township and dropped the Big Rapids plant (m2611-40). This is already noted as tentative in the 5 Nov check. |
| case-8 | Syrah Technologies LLC (Vidalia) | ID, owners, trade | NO CHANGE | Old ID NvC-a… still errors (m2611-08). The name search returns four records; the current main one is I7QWK7f0… (m2611-14), already mapped. Owner: Syrah US Holdings Pty Ltd (m2611-25), as on the card. US rows (74): equipment from China, 2024 natural flake graphite from Mozambique, Panama and others; nothing dated after Jan 2026 for graphite (m2611-33). |
| case-9 | Ford's links to BTR | resolved via the BTR records | NO CHANGE | Uses the same BTR records as cases 1 and 2 (m2611-09, -20, -26, -27). No new Ford-linked row found; no new owner. |
| case-10 | Linergy Power (Ampace) | summary, owners, US trade | NO CHANGE | Record opens (m2611-10). Sayari still shows the CATL-side shareholder chain through Xiamen Ampace (m2611-21) and does not yet show TDK. The card's "TDK since Jun 2026" comes from press and is unchanged. Cell rows to the US run to 13 Sep 2026 (5 rows to Eaton) (m2611-34). |
| case-11 | CATL Hungary (Debrecen) | summary, owners, trade | NO CHANGE | Registry record active as of 22 Jul 2026 (m2611-11). Owner list shows CATL's shareholders without a percentage for CATL itself (m2611-22), as on the card. One inbound row (a transformer, Sep 2025) (m2611-35). |
| case-12 | PT Huayue Nickel Cobalt | summary, owners, US trade | NO CHANGE | Record opens (m2611-12). Beneficial owners: two individuals in Indonesia's register, the same two already on the site (the second name stays withheld) (m2611-23). The Huayou 57% / CMOC 30% / Nickel Industries 10% card is from filings and unchanged. US rows are valves (HS 8481), Nov 2025 to Feb 2026; no nickel rows (m2611-36). |

## Watch list

| case | watch item | result |
|---|---|---|
| case-2 | First exports from Tangier; more graphite from BTR; which company is the shipper | No exports. Only the three 19 Aug 2026 graphite rows from BTR Indonesia, shipped to the anode company. Status unchanged. |
| case-3 | A Sayari record for the Oman company; Chinese inputs arriving; Zhongke Shinzoom as shipper | No record, no rows. Status unchanged. |
| case-5 | First needle coke or graphite imports; exports; ownership changes; Jiangxi Zichen to the US | No trade for Zichen Malaysia. Jiangxi Zichen's latest US row is Jul 2025. Status unchanged. |

## Web news (Tavily)

- A trade post (GraphiteHub, citing Benchmark) says Shinzoom's 200,000 t/yr Oman plant is under construction and that the company has cancelled some China projects; it also says Putailai has broken ground in Malaysia and BTR has 60 kt planned in Morocco. These are consistent with the "under construction" status. The post is a secondary source and was not confirmed against a primary document.
- The same post says BTR's parent said it would join the bankruptcy restructuring of Shanshan Group. This is outside the cases' scope and was not verified; flagged only for awareness.
- No new listing of any plant owner on a US government list turned up in the second search. The Gotion Big Rapids settlement is covered under case 7.

## Proposed site changes

None. All current site text still matches what the data shows. The only IDs that fail to open (BTR Indonesia 2omCekb1…, Syrah NvC-a…) are already mapped in `investigation/recheck_additions.json`.

Items to re-check at the next run, not changes: the 10 Nov 2026 end of China's Announcement No. 70 (covered in the 5 Nov policy re-check), and the pending Gotion High-Tech share transfer.

## Call log

| id | tool | params | result |
|---|---|---|---|
| m2611-01 | sayari.get_entity_summary | entity 2omCekb1… (BTR Indonesia, case 1 main ID) | error again |
| m2611-02 | sayari.get_entity_summary | entity El_6QFk0… (BTR Mediterranean New Material Technology) | Opens; Tangier, registered Oct 2023, 0 trade |
| m2611-03 | sayari.search_entities | "Zhongke Xingcheng" Sohar, limit 5 | 0 records |
| m2611-04 | sayari.get_entity_summary | entity Fj3vtxDr… (POSCO Future M) | Opens; 10,370 sent, 1,799 received |
| m2611-05 | sayari.get_entity_summary | entity WG1hrSwG… (Zichen Malaysia) | Opens; registered 23 Sep 2025; 0 trade |
| m2611-06 | sayari.get_entity_summary | entity _WCNtC_i… (EVE Energy Malaysia) | Opens; 140 sent, 3,602 received |
| m2611-07 | sayari.get_entity_summary | entity jtptt0xX… (Gotion, Inc.) | Opens; active status dated 19 Oct 2026 |
| m2611-08 | sayari.get_entity_summary | entity NvC-a4Bg… (Syrah Technologies, case 8 main ID) | error again |
| m2611-09 | sayari.get_entity_summary | entity Z57YvgOY… (BTR Mediterranean Anode) | Opens; registered May 2024; 0 trade |
| m2611-10 | sayari.get_entity_summary | entity ySemfyJJ… (Linergy Power) | Opens; 94 sent, 2,775 received |
| m2611-11 | sayari.get_entity_summary | entity VyUeBf-i… (CATL Hungary registry record) | Opens; active as of 22 Jul 2026 |
| m2611-12 | sayari.get_entity_summary | entity d36wLU72… (PT Huayue Nickel Cobalt) | Opens; 384 sent, 24,795 received |
| m2611-13 | sayari.search_entities | "PT Indonesia BTR New Energy Material", limit 5 | 1 record, ekoH1fr8…, with tax ID, LEI and Kendal/IMIP addresses |
| m2611-14 | sayari.search_entities | "Syrah Technologies", limit 5 | 4 records; main is I7QWK7f0…; NvC-a… not listed |
| m2611-15 | sayari.find_beneficial_owners | entity El_6QFk0…, limit 10 | 2 owners: BNUO International Holding and BTR New Material Group |
| m2611-16 | sayari.find_beneficial_owners | entity Fj3vtxDr…, limit 10 | 50 holders (saved to file): POSCO Holdings records, POSTECH, share association, individuals |
| m2611-17 | sayari.find_beneficial_owners | entity WG1hrSwG…, limit 10 | 50 holders (saved to file): Putailai (Singapore) first, then Shanghai Putailai shareholders |
| m2611-18 | sayari.find_beneficial_owners | entity _WCNtC_i…, limit 10 | 50 holders (saved to file): EVE Asia Co., Limited first, then EVE Energy holders |
| m2611-19 | sayari.find_beneficial_owners | entity jtptt0xX…, limit 10 | 0 owners |
| m2611-20 | sayari.find_beneficial_owners | entity Z57YvgOY…, limit 10 | 2 owners: Rian International Holding and BTR New Material Group |
| m2611-21 | sayari.find_beneficial_owners | entity ySemfyJJ…, limit 10 | 50 holders (saved to file): CATL-side chain via Xiamen Ampace; no TDK record |
| m2611-22 | sayari.find_beneficial_owners | entity VyUeBf-i…, limit 10 | 50 holders (saved to file): CATL shareholders, funds and US individuals |
| m2611-23 | sayari.find_beneficial_owners | entity d36wLU72…, limit 10 | 2 individuals from Indonesia's register, both already on the site |
| m2611-24 | sayari.find_beneficial_owners | entity ekoH1fr8…, limit 10 | 0 owners |
| m2611-25 | sayari.find_beneficial_owners | entity I7QWK7f0…, limit 10 | 1 owner: Syrah US Holdings Pty Ltd |
| m2611-26 | sayari.search_shipments | "INDONESIA BTR NEW ENERGY MATERIAL", arrival USA, compact | 68 rows; latest 16 Oct 2026 (FNS Inc, 3801.10 and 3801.90), then 19 Sep 2026 |
| m2611-27 | sayari.search_shipments | "BTR MEDITERRANEAN", no country filter, compact | 17 inbound rows (construction goods; 3 graphite rows 19 Aug 2026); no exports |
| m2611-28 | sayari.search_shipments | "ZICHEN MALAYSIA", compact | 0 rows |
| m2611-29 | sayari.search_shipments | "JIANGXI ZICHEN", arrival USA, compact | 10 rows of graphite; latest Jul 2025 |
| m2611-30 | sayari.search_shipments | "POSCO FUTURE M", arrival USA, compact | Large result; Oct 2026 rows are cathode material (HS 2841.90) to GM and StarPlus |
| m2611-31 | sayari.search_shipments | "EVE ENERGY MALAYSIA", arrival USA, compact | 29 rows; latest 12 Oct 2026 (HS 8507, Briggs & Stratton) |
| m2611-32 | sayari.search_shipments | "GOTION", HS 3801, arrival USA, compact | 2 rows, Hefei Gotion to Gotion Inc., Dec 2025 |
| m2611-33 | sayari.search_shipments | "SYRAH TECHNOLOGIES", arrival USA, compact | 74 rows; equipment from China, 2024 natural flake graphite; nothing new in graphite |
| m2611-34 | sayari.search_shipments | "LINERGY POWER", arrival USA, compact | 17 rows of cells; latest 13 Sep 2026 (Eaton) |
| m2611-35 | sayari.search_shipments | "CONTEMPORARY AMPEREX TECHNOLOGY HUNGARY", compact | 1 row, a transformer, Sep 2025 |
| m2611-36 | sayari.search_shipments | "HUAYUE NICKEL COBALT", arrival USA, compact | 55 rows; valves only (HS 8481), no nickel rows |
| m2611-37 | sayari.search_entities | Zhongke Xingcheng Oman Sohar graphite, limit 5 | 0 records |
| m2611-38 | sayari.search_shipments | "ZHONGKE" graphite, arrival OMN, compact | 0 rows |
| m2611-39 | tavily.tavily_search | BTR Tangier, Zhongke Sohar, Zichen Malaysia news, past month | Trade-post items on Oman, Malaysia and Morocco plants; nothing contradicting current status |
| m2611-40 | tavily.tavily_search | Huayou, Gotion, EVE, CATL on US lists, past month | Gotion Big Rapids settlement reported 22 Oct 2026; no new list additions found |
