# Verification pass: headline claims and policy facts

Checked 18 Oct 2026, against the site data built on 14 Oct 2026 (`data/*.json`, `investigation/cases/*.json`, `investigation/build_data.py`). Every Sayari and Tavily call made for this pass is listed in the call log at the bottom (v001 to v052). No repo files other than this one were changed.

Results are in four grades:

- **CONFIRMED**: the re-run matches the claim.
- **PARTLY**: the core is right, but a number, date or wording needs fixing.
- **NOT CONFIRMED**: the re-run contradicts the claim.
- **COULD NOT RE-RUN**: the tool failed.

## Summary table

| # | Claim | Check run (tool and key parameters) | Result | Notes |
|---|---|---|---|---|
| 1a | Case 1: BTR Indonesia shipped HS 3801.10 to Ultium Warren, Ultium Spring Hill, SK Battery America, StarPlus, GM and Tesla in 2024–2025 | `search_shipments` query "PT Indonesia BTR New Energy Material", HS 3801, arrival USA, 2024–2025, two pages (v001, v007). The same query with "INDONESIA BTR", departure IDN, arrival USA (v011) | **PARTLY** | All six buyers are confirmed. The IDN-departure query returns 24 rows: the original 19, plus 5 new Larpen rows dated Aug 2026. The site misses a whole flow, though. Record 2 (`dH3rqoht5wahpKLPJih3gA`) has about 31 more HS 3801 rows that US import data shows as leaving from **Singapore**, so a departure-IDN filter can't catch them. They are 26 rows to Ultium Cells Warren (arrivals 30 Jul to 21 Nov 2025; 22 coded 3801.10 and 4 coded 3801.90) and 5 rows to GM (arrivals 7 Apr 2025). There is also 1 GM row arriving 19 Sep 2026 and 4 undated 3801.90 rows. The query returns 55 rows in all. "About 19 rows" is therefore a floor, not the count. The claim that battery-maker shipments "stop after Aug 2025" is wrong. |
| 1b | Case 1: `find_beneficial_owners` returns 0 for the plant | `find_beneficial_owners` on `2omCekb1pDRKjhFOAqCNSw`, tried 4 ways (v002, v004, v010, v041). Then `search_entities` on the plant name (v043) and `find_beneficial_owners` on `ekoH1fr8BGvHc7UqYCY_YA` (v042) | **CONFIRMED in substance; anchor ID is stale** | Every call on `2omCekb1…` now fails: beneficial owners, profile, summary and traverse (v006, v008, v012). A name search returns one record, `ekoH1fr8BGvHc7UqYCY_YA`. It now carries the Indonesian tax ID (0625540349086000) and the LEI (254900G3L2Z0HNRV7W43), which the site attributes to `2omCekb1…`. `find_beneficial_owners` on it returns 0, so "no owner in Sayari" still holds. The anchor ID appears 45 times in `data/` (cases 3, edges 20, call_log 18, entities 2), and those Sayari links probably no longer resolve. |
| 2a | Case 2: BTR Mediterranean → BNUO (SGP) → BTR (Jiangsu) → BTR New Material Group, 100% at each step | `get_entity_profile` on `El_6QFk0rVRdYJanrqEtAA` (v017). `find_beneficial_owners` on it (v013) and on `NKDYreiU9nvqyC4RRZQDfA` in full mode (v016) | **CONFIRMED (with one caveat)** | Morocco → BNUO is 100% (shares_pct 100). BNUO → BTR (Jiangsu) → BTR New Material Group is returned as a shareholder chain. The traversal tools did not return percentages for steps 2 and 3, so those are not re-confirmed here. Caveat: the Singapore record of BTR (Jiangsu) (`tvq1Vka_Ta_4GBkadgw_9w`) links to the Chinese registry record (`zduDdSDo…`) only by a "possibly the same as" match. The site should say that one hop is a name and record match, not a filing. |
| 2b | Case 2: no graphite trade in or out of the Moroccan plant | `search_shipments` query "BTR Mediterranean" (v014). Narrowed to "BTR MEDITERRANEAN ANODE NEW MATERIAL TECHNOLOGY", departure IDN, full mode (v015) | **NOT CONFIRMED** | Sayari now holds **3 rows of HS 3801.10 (artificial graphite) from PT Indonesia BTR (Morowali/IMIP site) to BTR Mediterranean Anode New Material Technology, Tangier Tech, departing 19 Aug 2026**. Together they weigh 1,240 t and are worth about US$857,000. The source is Indonesian export data. The product text is just the consignee address, but the HS code is graphite. This looks like the plant's first graphite feed, sent from BTR's own Indonesian plant. The rows are probably newer than the site's 14 Oct build, or the build missed them because they sit under the trade record `1CjF5vzVgFFxVomroaYyaA`. The other 14 rows are construction goods (racks, pipes, cabinets, steel), which fits the site. |
| 3a | Case 3: no Sayari record for Zhongke's Sohar plant | `search_entities` "Zhongke Sohar" (v018) and "中科星城 苏哈尔" (v020). `search_shipments` "Zhongke", arrival OMN, from Jun 2025 (v021) | **CONFIRMED** | 0 hits. The one Chinese-name hit is an unrelated PowerChina construction branch. There are no shipments into Oman under the Zhongke name. |
| 3b | Case 3: Zhongke Shinzoom ships artificial graphite to EVE Energy Malaysia and Linergy Power | `search_shipments` "ZHONGKE SHINZOOM", arrival MYS (v019) | **CONFIRMED** | 32 rows, as the site says: 18 to EVE Energy Malaysia (Apr 2025 to Apr 2026) and 14 to Linergy Power (Sep 2025 to Feb 2026). Note that 13 of the 18 EVE rows carry HS 3801.90, not 3801.10, though the text says "artificial graphite". |
| 4a | Case 4: POSCO Holdings owns 58.2% of POSCO Future M | `get_entity_profile` on `Fj3vtxDroFyjyPsLgsnm2A`, relationships_limit 60 (v027). Also v022 and v026 | **CONFIRMED** | The DART-sourced shareholder link shows POSCO Holdings (포스코홀딩스(주)) at 58.2%. The other shareholders are Korean individuals, POSCO entities, the National Pension Service, POSTECH and an employee stock association. No Chinese owner appears. |
| 4b | Case 4: 95 HS 3801 rows Korea → US to GM, SK Battery America, Tesla, Panasonic and XALT | `search_trade_facets` scope shipments, query "POSCO FUTURE M", HS 3801, KOR → USA (v024) | **CONFIRMED** | 111 rows in the slice. The buyer counts are GM 36 + 1, SK Battery America 32, Tesla 13, Panasonic Energy 9 and XALT 3 + 1, which makes 95. The rest go to forwarders (Scan Global 14, FNS 1). Dates run Dec 2021 to Jul 2026, as the site says. |
| 5 | Case 5: Zichen Malaysia is 100% owned by Putailai (Singapore) and has no trade | `get_entity_profile` on `WG1hrSwGRdoLMIt997Z5-w` (v028). `search_shipments` "Zichen Malaysia" (v029) | **CONFIRMED** | Putailai (Singapore) Pte. Ltd. holds 100% (a second, person-typed record is marked former). Trade count: 0 sent and 0 received. Registered 23 Sep 2025. |
| 6a | Case 6: EVE Energy Malaysia receives HS 3801 from Chinese anode makers (BTR, Zhongke, Shanshan, Qingdao Taidongrui) | `search_trade_facets` "EVE ENERGY MALAYSIA", HS 3801, arrival MYS (v030) | **CONFIRMED** | 59 rows, Apr 2025 to Apr 2026. Taidongrui 19, Zhongke Shinzoom 18, BTR Sales 8 + 3, BTR Indonesia 4 + 1, Shanshan 4, Guizhou Zhongke 1, Hebei Kuntian 1. That is 9 records for 7 companies, matching the site. |
| 6b | Case 6: cells (HS 8507) go to US buyers (EVE Energy North America, Briggs & Stratton, Milwaukee Tool and others) | `search_trade_facets` HS 8507 → USA (v031). `search_shipments` "EVE ENERGY MALAYSIA" → USA from Oct 2025, export mode (v032) | **CONFIRMED** | 27 rows, Oct 2025 to Sep 2026, as the site says. EVE NA 7, Briggs & Stratton 3 + 2, TTI 2, plus Milwaukee, Stanley Black & Decker, Energizer, ProTechnologies, ABM Tucker and NRI/forwarder, and 7 with no buyer. 19 of the 27 carry HS 8507. The Briggs rows have no HS code in the data. |
| 6c | Case 6: after June 2026, departures move away from Penang | Same as v032 | **PARTLY** | The Jul to Sep 2026 rows depart Singapore (1 and 15 Jul), China (1 Sep) and one with no country (22 Sep). But one EVE NA row arriving **19 Jun 2026**, after the 8 June listing, still shows the "Pinang" port that Sayari geocodes as Indonesia. The step text ("After June 2026 …") is accurate. The red-flag note ("after the June 2026 1260H listing … instead of Penang") is not. |
| 7a | Case 7: 2 rows HS 3801.10 Hefei Gotion → Gotion Inc. (Fremont) on 23 Dec 2025 | `search_shipments` "GOTION", HS 3801, arrival USA, full mode (v033) | **CONFIRMED** | Exactly 2 rows from Korean export data, both departing Pusan 23 Dec 2025 for Tacoma. The consignee is 48660 Kato Road, Fremont. |
| 7b | Case 7: HS 8507 rows into Gotion US entities | `search_trade_facets` "GOTION", HS 8507, arrival USA (v035) | **CONFIRMED** | 145 rows (Mar 2023 to Sep 2026): 83 to Gotion Inc., 49 to 1st Choice Freight and 3 to the Gotion Illinois trade record. |
| 7c | Case 7: "some were routed via Jamaica" | `search_shipments` "GOTION", departure JAM, arrival USA, full mode (v034) | **PARTLY: the rows are real, but "routed via Jamaica" misleads** | There are 10 rows (9 of them HS 8507). Every one lists Port Bustamante (Kingston), Jamaica as the foreign port of lading and Houston as the arrival port. Most carry ZIM bills of lading with a Shanghai prefix (ZIMUSHH…); one set uses a Yantian prefix. The shipper is Hefei Gotion at 599 Daihe Road. Kingston is ZIM's Caribbean transshipment hub for Asia–US Gulf services, and US import manifests record the **last** foreign port, not the origin. So these are Chinese cells moved through a carrier hub. That is not a deliberate trade routing, and Jamaica is not an origin or processing step. Sayari also tags these rows with transit country "USA", which adds nothing. The rows are not invented, but they are a transshipment artefact of how US import data records ports. |
| 8a | Case 8: Twigg → Syrah Technologies (Vidalia), 7 rows Sep 2023 to Jan 2024 | `search_shipments` "Syrah Technologies", HS 2504, arrival USA (v036) | **CONFIRMED** | 7 rows from Twigg (`ffPlxyHu…`), arrivals 9 Sep 2023 to 24 Jan 2024. The unnamed-supplier flake rows are also visible; the site already covers them. |
| 8b | Case 8: Twigg / Syrah Global → BTR Indonesia | `search_shipments` "TWIGG EXPLORATION", arrival IDN (v039) and "SYRAH GLOBAL", arrival IDN (v040) | **CONFIRMED (minor ID change)** | 3 Twigg rows (5 Apr 2024, 25 Apr 2024, 22 Aug 2025) and 4 Syrah Global DMCC rows (Jan to Apr 2026), all natural flake (HS 2504.10) to BTR Indonesia, as the site says. The Aug 2025 row now sits under Twigg record `pINZVxJgOaXpyrNkPgaeBQ`, not the site's `wL21QEyuYMG1Gsp17Nx-1Q`. The buyer for all 7 rows is `ekoH1fr8…`, which is now the BTR Indonesia anchor (see 1b). |

## Corrections needed

1. **Case 1: wrong anchor ID.** `2omCekb1pDRKjhFOAqCNSw` no longer resolves in Sayari: every tool call on it fails. The tax ID and LEI now sit on `ekoH1fr8BGvHc7UqYCY_YA`.
   - Wrong: the entity summary for `2omCekb1pDRKjhFOAqCNSw` ("The anchor record: tax ID, LEI and the most trade history (78 sent, 4,083 received).") and the summary for `ekoH1fr8BGvHc7UqYCY_YA` as "record 3".
   - Suggested: make `ekoH1fr8BGvHc7UqYCY_YA` the anchor ("PT. Indonesia BTR New Energy Material: tax ID 0625540349086000, LEI 254900G3L2Z0HNRV7W43"). Mark `2omCekb1…` as "retired or merged in Sayari after 14 Oct 2026". Then re-point the 45 references in `data/` and check the Sayari links.

2. **Case 1: the row count is too low.** In key_numbers:
   - Wrong: `19 | shipment rows from the plant to US buyers`
   - Suggested: `About 55 | HS 3801 shipment rows from the plant's records to US buyers, Dec 2024 – Sep 2026 (about 43 of them to the five battery/auto makers in 2024–2025)`
   - Alternatively, keep 19 and relabel it: "rows shipped direct from Indonesia; about 31 more were recorded as loaded in Singapore."

3. **Case 1: the date range and the "stop after Aug 2025" sentence are wrong.**
   - Wrong (step 4): "Artificial graphite (HS 3801.10) leaves for Ultium Cells, SK Battery America, StarPlus Energy, GM and Tesla, Dec 2024 to Aug 2025."
   - Suggested: "Artificial graphite (HS 3801.10, some 3801.90) leaves for Ultium Cells, SK Battery America, StarPlus Energy, GM and Tesla, Dec 2024 to Nov 2025, with one more GM row in Sep 2026. Many of the Ultium and GM rows are recorded as loaded in Singapore."
   - Wrong (step 5): "Battery-maker shipments in our results stop after Aug 2025; later rows go to industrial buyers. We haven't tested why."
   - Suggested: "Rows shipped direct from Indonesia to battery makers stop after Aug 2025. Rows recorded as loaded in Singapore continue to Ultium Cells Warren until Nov 2025, and one reaches GM in Sep 2026. Industrial buyers (Aminco, Larpen) appear from Sep 2025."

4. **Case 2: the plant now has graphite trade.**
   - Wrong (headline): "The plant has no graphite trade yet, …"
   - Suggested: "The plant's first graphite feed has just appeared: 3 rows (1,240 t) of artificial graphite from BTR's own Indonesian plant, shipped 19 Aug 2026. It has no exports yet, …"
   - Wrong (answer): "Shipments: not yet. The plant is still being built and has no graphite trade."
   - Suggested: "Shipments: inbound only. In Aug 2026 BTR's Indonesian plant sent 1,240 t of artificial graphite (HS 3801.10) to the Tangier anode company; nothing has left the plant yet."
   - Wrong (key number): `0 | graphite shipments in or out of the Moroccan plant's six Sayari records`
   - Suggested: `3 in, 0 out | graphite shipments for the Moroccan plant (all from BTR Indonesia, Aug 2026)`
   - Also add an edge from `ekoH1fr8…` to `1CjF5vzVgFFxVomroaYyaA` (ships_to, HS 380110, 2026-08-19). Update the record summary for `1CjF5vzVgFFxVomroaYyaA` ("One inbound row from a Chinese construction contractor in late 2025.") to mention the 3 graphite rows. This also links Case 1 and Case 2 directly.

5. **Case 2: caveat on the ownership hop.** Add to the ownership step: "The Singapore record of BTR (Jiangsu) is matched to the Chinese registry record by name and address ('possibly the same as'), not by a shared identifier."

6. **Case 6: red-flag wording.**
   - Wrong: "No spike, but after the June 2026 1260H listing the US rows depart Singapore, Yantian and Pusan instead of Penang."
   - Suggested: "No spike. One row on 19 Jun 2026, after the 8 Jun listing, still left from 'Pinang'. From July 2026 the US rows depart Singapore, Yantian or Pusan instead of Penang."

7. **Case 7: the Jamaica wording.** The text appears in `cases.json` (case-7 step 3), `edges.json` (3 edges), `entities.json` (2 summaries) and `call_log.json`.
   - Wrong: "Lithium-ion cells and packs (HS 8507) arrive from Hefei Gotion and the group's Tongcheng plant, some via Jamaica."
   - Suggested: "… from Hefei Gotion and the group's Tongcheng plant. Some US import rows list Kingston, Jamaica as the last port: that is a ZIM transshipment hub, and the bills of lading were issued in Shanghai and Yantian, so these are Chinese shipments, not a Jamaican route."
   - Make the same change wherever the edges and summaries say "(one via Jamaica)", "via Jamaica" or "routed via Jamaica". For example: "Li-ion cells (HS 8507.60), 3 rows arriving 23 Aug 2026, transshipped at Kingston, Jamaica (ZIM), to a US freight forwarder."

8. **Case 8: entity ID drift (minor).** The Aug 2025 Twigg → BTR Indonesia row now sits under Twigg record `pINZVxJgOaXpyrNkPgaeBQ`, not `wL21QEyuYMG1Gsp17Nx-1Q`. Re-point the edge, or add `pINZVx…` as a fourth Twigg record.

9. **Case 3: optional precision.** "32 artificial-graphite rows" is correct, but 13 of the 18 EVE rows are coded HS 3801.90. Suggest "32 rows of artificial graphite (HS 3801.10 or 3801.90)".

## Policy updates (checked 18 Oct 2026)

- **EVE Energy on the Section 1260H list: confirmed.** The Department of Defense/War released its updated list on **8 June 2026**, and the Federal Register notice is dated 10 June 2026. It added 65 entities, including EVE Energy Co., Ltd., with CALB, BYD and NIO among the battery and EV names. DoD procurement from listed entities has been banned since 30 June 2026. Sources:
  - The list itself on media.defense.gov, as cited in the site's t601. I could not retrieve it again in this pass: a domain-restricted search for war.gov, defense.gov and federalregister.gov returned nothing (v052).
  - Holland & Knight, Jul 2026: https://www.hklaw.com/en/insights/publications/2026/07/department-of-war-updates-section-1260h
  - WilmerHale, 11 Jun 2026: https://www.wilmerhale.com/en/insights/client-alerts/20260611-pentagon-adds-65-new-entities-to-the-1260h-list-of-chinese-military-companies
  - DLA Piper, 18 Jun 2026, which cites the 10 Jun Federal Register notice: https://www.dlapiper.com/en-us/insights/publications/2026/06/dod-updates-and-expands-list-of-chinese-military-companies-operating-in-us-under-section-1260h
  - Suggested wording: "published 8 June 2026 (Federal Register, 10 June 2026)".

- **China's suspension of the Oct 2025 graphite/battery controls (Announcement No. 70, to 10 Nov 2026): no legal change found, but the political deadline has moved.** On **28 Sep 2026** MOFCOM confirmed that the US–China "Kuala Lumpur arrangement" is extended to **10 Jan 2027**. It said the measures suspended "through November 10, 2026" are covered. No new numbered MOFCOM/GACC announcement amends Announcement 70's 10 Nov 2026 end date. Law firms and trade press (Thomson Reuters, 12 Oct; FXStreet, 14 Oct) note the gap: the truce runs to 10 Jan 2027, but the legal suspension still ends 10 Nov 2026 unless a new announcement is issued. Suggested site wording: "Suspended until 10 Nov 2026 under Announcement No. 70. On 28 Sep 2026 MOFCOM said the wider truce runs to 10 Jan 2027, but as of 18 Oct no new announcement has moved the legal end date." Re-check after 10 Nov 2026. Sources:
  - Global Times, MOFCOM's 10 outcomes, 28 Sep 2026: https://www.globaltimes.cn/page/202609/1371502.shtml
  - China Briefing, 28 Sep 2026: https://www.china-briefing.com/news/xi-trump-meeting-washington-takeaways
  - Thomson Reuters, 12 Oct 2026: https://tax.thomsonreuters.com/blog/section-301-exclusions-expiration
  - FXStreet, 14 Oct 2026: https://www.fxstreet.com/analysis/chinas-rare-earth-leverage-has-an-expiration-date-november-10-heres-what-beijing-is-deciding-202610141348
  - Related: MOFCOM Announcement No. 26 of 2026 (24 Jun, effective 1 Jul) set up a reporting mechanism for strategic-mineral export-control violations, including transshipment through third countries (secondary source: exploverse.com).

- **PFE / FEOC guidance from Treasury and the IRS since Feb 2026: nothing new found.** Notice 2026-15 (12 Feb 2026) is still the operative guidance. No proposed PFE regulations or PFE-specific MACR safe-harbor tables have been reported up to 18 Oct 2026. The statute still requires the tables by **31 Dec 2026**, and the effective-control and Hong Kong questions remain open (Hunterbrook, 13 Aug 2026, says no guidance yet on whether Hong Kong counts as China). Sources:
  - IRS IRB 2026-11: https://www.irs.gov/irb/2026-11_IRB
  - Cravath, 16 Mar 2026: https://www.cravath.com/a/web/iGTgX35otUHmiakNRt2HRz/bncFE9/irs-interim-guidance-on-feoc-rules-compliance-with-the-material-assistance-restrictions.pdf
  - Tax Law Center: https://taxlawcenter.org/blog/treasury-releases-first-round-of-prohibited-foreign-entity-guidance
  - Hunterbrook, 13 Aug 2026: https://hntrbrk.com/investigations/jinko

- **Gotion Big Rapids, Michigan.** In June 2026 Gotion filed an amended complaint in federal court in Grand Rapids seeking money damages from Green Charter Township. In Jan 2026 the Attorney General demanded repayment of US$23.7m to the Michigan Strategic Fund. On 30 Aug 2026 the township and Gotion asked for a magistrate-led settlement conference. The site's "now in court" is correct; consider adding "settlement talks requested Aug 2026". Sources:
  - mlive, Jun 2026: https://www.mlive.com/news/grand-rapids/2026/06/gotion-seeks-millions-from-michigan-township-after-ev-battery-plant-sunk.html
  - Big Rapids News, Aug/Sep 2026: https://www.bigrapidsnews.com/news/article/green-charter-township-gotion-request-settlement-22410310.php

- **Gotion Manteno, Illinois.** Still operating. A residents' lawsuit in Kankakee County is in its third year. Separately, Congress has barred the Pentagon from buying Gotion batteries from Oct 2027 (Epoch Times; single source, verify before use). Nothing found that changes the site's "operating, about 300 staff" line. Source: https://www.theepochtimes.com/article/a-chinese-battery-plant-moved-into-this-illinois-town-on-state-money-its-residents-cant-vote-it-out-6078010

- **BTR Morocco (Tangier).** CSCEC, the builder, reported on 14 Jul 2026 that the 60,000 t/yr anode plant at Mohammed VI Tangier Tech City is "advancing steadily", with phased production from 2026 (https://english.cscec.com/CompanyNews/CorporateNews/202607/3951946.html). This fits the first graphite inflow found in Sayari for Aug 2026 (correction 4). Two further leads, from a single secondary source (Morocco Konnect on LinkedIn) and not verified:
  - Ford has prepaid US$120m to BTR's Tangier anode subsidiary.
  - US Commerce set a 66.82% countervailing duty rate for BTR (final, 10 Feb 2026), but the ITC voted 2–1 negative on 12 Mar 2026, so no order was issued.
  - Check both against BTR's 2025 annual report and the ITC before using them.

- **Zhongke Oman (Sohar).** Nothing new found since the May 2026 groundbreaking (v051). The site's "under construction" stands.

## Call log

All calls were made on 18 Oct 2026. Results are paraphrased.

| id | tool | params | result |
|---|---|---|---|
| v001 | sayari.search_shipments | query "PT Indonesia BTR New Energy Material", hs 3801, arrival USA, 2024-01-01–2025-12-31, limit 50, compact | 55 rows. Record 2 (dH3r…) sent 26 rows to Ultium Warren (Jul–Nov 2025, via SGP) and 5 to GM (Apr 2025) + 1 (Sep 2026). Record ekoH… rows to SKBA, Ultium W/SH, StarPlus, Aminco, Larpen |
| v002 | sayari.find_beneficial_owners | entity 2omCekb1… | error ("unexpected error") |
| v003 | sayari.search_shipments | page 2 with limit | refused: limit not allowed with page_token |
| v004 | sayari.find_beneficial_owners | entity 2omCekb1…, max_depth 4, limit 15 | error |
| v005 | sayari.search_shipments | page 2 with response_mode | refused: response_mode not allowed with page_token |
| v006 | sayari.traverse_network | entity 2omCekb1…, ownership relationships, depth 2 | error |
| v007 | sayari.search_shipments | page 2 of v001 | 5 more rows: 1 StarPlus (Mar 2025) and 4 undated 3801.90 rows from record 2 |
| v008 | sayari.get_entity_profile | entity 2omCekb1… | error |
| v009 | sayari.search_shipments | query "\"INDONESIA BTR\" Tesla", arrival USA | 0 |
| v010 | sayari.find_beneficial_owners | entity 2omCekb1…, compact | error |
| v011 | sayari.search_shipments | query "\"INDONESIA BTR\"", IDN→USA, limit 50, compact | 24 rows: Larpen 7, StarPlus 5 (2 cosmetics HS), Ultium W 3, Aminco 3, Ultium SH 2, GM 1+1, SKBA 1, Tesla 1 |
| v012 | sayari.get_entity_summary | entity 2omCekb1… | error |
| v013 | sayari.find_beneficial_owners | entity El_6QFk0rVRdYJanrqEtAA | BNUO (SGP), then BTR (Jiangsu) Singapore record via a "possibly same as" hop |
| v014 | sayari.search_shipments | query "\"BTR Mediterranean\"", limit 25, compact | 17 rows: construction goods 2025–26, plus 3 HS 380110 rows BTR Indonesia → BTR Mediterranean Anode, 19 Aug 2026 |
| v015 | sayari.search_shipments | query "BTR MEDITERRANEAN ANODE NEW MATERIAL TECHNOLOGY", departure IDN, full | 3 rows, 40 t + 1,160 t + 40 t, about US$857k total, Morowali → Tangier, Indonesian export data |
| v016 | sayari.find_beneficial_owners | entity NKDYreiU9nvqyC4RRZQDfA, limit 10, full | BTR (Jiangsu) → (possibly same as) Chinese record → BTR New Material Group → individual shareholders; no % in output |
| v017 | sayari.get_entity_profile | entity El_6QFk0rVRdYJanrqEtAA, limit 20 | Shareholder and beneficial owner BNUO 100%; trade 0 sent / 0 received; registered 9 Oct 2023 |
| v018 | sayari.search_entities | query "Zhongke Sohar" | 0 |
| v019 | sayari.search_shipments | query "\"ZHONGKE SHINZOOM\"", arrival MYS, limit 40 | 32 rows: EVE Energy Malaysia 18 (Apr 2025–Apr 2026), Linergy 14 (Sep 2025–Feb 2026) |
| v020 | sayari.search_entities | query "中科星城 苏哈尔" | 1 unrelated hit (PowerChina Anhui branch) |
| v021 | sayari.search_shipments | query "Zhongke", arrival OMN, from 2025-06-01 | 0 |
| v022 | sayari.find_beneficial_owners | entity Fj3vtxDroFyjyPsLgsnm2A, depth 1, limit 10 | 10 Korean shareholders (individuals and POSCO steel); no Chinese owner |
| v023 | sayari.search_shipments | query "\"POSCO FUTURE M\"", hs 3801, KOR→USA, limit 50 | 111 rows in total; sample shows GM, SKBA, Tesla, Panasonic and forwarder rows |
| v024 | sayari.search_trade_facets | scope shipments, same filters as v023 | Buyers GM 36, SKBA 32, Tesla 13, Panasonic 9, Scan Global 8+6, XALT 3+1, GM LLC 1, FNS 1; Dec 2021–Jul 2026 |
| v025 | sayari.get_entity_profile | entity Fj3v…, limit 15 | Truncated; 59 shareholder links in total |
| v026 | sayari.traverse_network | entity Fj3v…, has_shareholder, companies, depth 1, full | POSCO Holdings (3 records), NPS, POSTECH, POSCO, ESOP; no % |
| v027 | sayari.get_entity_profile | entity Fj3v…, limit 60 | POSCO Holdings 58.2% (DART) |
| v028 | sayari.get_entity_profile | entity WG1hrSwGRdoLMIt997Z5-w | Putailai (Singapore) 100%; trade 0/0; registered 23 Sep 2025 |
| v029 | sayari.search_shipments | query "\"Zichen Malaysia\"" | 0 |
| v030 | sayari.search_trade_facets | scope shipments, "EVE ENERGY MALAYSIA", hs 3801, arrival MYS | 59 rows, 9 supplier records, Apr 2025–Apr 2026 |
| v031 | sayari.search_trade_facets | scope shipments, "EVE ENERGY MALAYSIA", hs 8507, arrival USA | 19 rows; latest 19 Jun 2026 |
| v032 | sayari.search_shipments | "EVE ENERGY MALAYSIA", arrival USA, from 2025-10-01, export | 27 rows Oct 2025–Sep 2026; Jul–Sep 2026 rows via SGP/CHN; one 19 Jun 2026 row from "Pinang" (IDN) |
| v033 | sayari.search_shipments | "GOTION", hs 3801, arrival USA, full | 2 rows, Hefei Gotion → Gotion Inc., Pusan 23 Dec 2025 → Tacoma |
| v034 | sayari.search_shipments | "GOTION", departure JAM, arrival USA, full | 10 rows, all Port Bustamante (Kingston) → Houston; ZIM Shanghai/Yantian bills of lading; Chinese shippers |
| v035 | sayari.search_trade_facets | scope shipments, "GOTION", hs 8507, arrival USA | 145 rows; departures CHN 131, JAM 9, KOR 2; Gotion Inc. 83, 1st Choice 49 |
| v036 | sayari.search_shipments | "Syrah Technologies", hs 2504, arrival USA | Twigg → Syrah Technologies 7 rows, Sep 2023–Jan 2024; plus 8 unnamed-supplier flake rows |
| v037 | sayari.search_shipments | "\"INDONESIA BTR\" graphite", arrival IDN, hs 2504 | 0 (buyer-name query misses) |
| v038 | sayari.search_shipments | "Twigg OR \"Syrah Global\"", arrival IDN | 0 (known OR quirk) |
| v039 | sayari.search_shipments | "\"TWIGG EXPLORATION\"", arrival IDN | 3 rows to BTR Indonesia (Apr 2024 ×2, Aug 2025); Aug row under Twigg record pINZVx… |
| v040 | sayari.search_shipments | "\"SYRAH GLOBAL\"", arrival IDN | 4 rows to BTR Indonesia, Jan–Apr 2026 |
| v041 | sayari.find_beneficial_owners | entity 2omCekb1…, depth 2, limit 5 | error |
| v042 | sayari.find_beneficial_owners | entity ekoH1fr8BGvHc7UqYCY_YA | 0 owners |
| v043 | sayari.search_entities | "\"PT Indonesia BTR New Energy Material\"" | 1 record: ekoH1fr8… with Indonesian tax ID and LEI |
| v044 | tavily.tavily_search | "EVE Energy Section 1260H list …", from 2026-01-01, advanced | Holland & Knight, Dentons, WilmerHale, Cleary, DLA Piper: EVE added 8 Jun 2026 (FR notice 10 Jun) |
| v045 | tavily.tavily_search | "China MOFCOM suspension … Announcement 70 … November 2026", from 2026-09-01 | Announcement 70 end date still 10 Nov 2026; no extension text found |
| v046 | tavily.tavily_search | "MOFCOM US China trade truce extended January 10 2027 …", news, from 2026-09-15 | MOFCOM confirmed truce extension to 10 Jan 2027 on 28 Sep; legal suspension date unchanged |
| v047 | tavily.tavily_search | "Treasury IRS proposed regulations prohibited foreign entity … safe harbor tables 2026", from 2026-03-01 | Only Notice 2026-15 and commentary; tables due 31 Dec 2026 |
| v048 | tavily.tavily_search | "prohibited foreign entity proposed regulations effective control …", news, from 2026-06-01 | No proposed regs reported; Hunterbrook notes open questions (Aug 2026) |
| v049 | tavily.tavily_search | "Gotion Manteno … Big Rapids … lawsuit October 2026", news, from 2026-08-01 | 1 low-value social-media hit |
| v050 | tavily.tavily_search | "Gotion Big Rapids Michigan Strategic Fund lawsuit ruling 2026 Manteno", advanced, from 2026-06-01 | Amended complaint for damages (Jun 2026); settlement conference requested (Aug 2026); Manteno residents' suit ongoing |
| v051 | tavily.tavily_search | "BTR Tangier Morocco anode plant production 2026 OR Zhongke … Oman Sohar …", advanced, from 2026-06-01 | CSCEC: BTR 60 kt anode plant advancing, phased production from 2026; nothing new on Zhongke Oman |
| v052 | tavily.tavily_search | 1260H list text, include_domains federalregister.gov / war.gov / defense.gov | 0 results |

Notes on budget: the Sayari call count (43) is above the planned 25–35. Ten calls were failures: eight on the retired anchor ID and two refused pagination calls. Eight Tavily searches were spent on research and one on a failed primary-source lookup.
