# Verification pass 2: open gaps from verification.md

Checked 18 Oct 2026. This pass follows up the gaps left open by `verification.md` (calls v001 to v052) and the single-source claims in the case files. Every call is listed in the call log at the bottom (w001 to w030: 19 Tavily, 11 Sayari). No repo file other than this one was changed.

Grades:

- **RESOLVED**: a primary source (company filing, exchange announcement, government document or registry) gives the value.
- **PARTLY**: the core is answered, but only by secondary sources, or one piece is still missing.
- **STILL OPEN**: nothing usable found.

"Primary" here includes exchange filings read through mirror sites (Sina Finance bulletin pages, Xueqiu and East Money PDF copies of cninfo filings). Each is the company's own filing text, but the URL is a mirror and not cninfo itself.

## Results

| # | Item | Result | Value | Source (URL) | Call id |
|---|---|---|---|---|---|
| 1 | BTR's stake in PT Indonesia BTR New Energy Material; who "Stellar Investment" is | **RESOLVED (the site's 70/30 is wrong)** | **BTR holds 60%**, through its wholly owned BTR (Hong Kong) New Material. **40% is held by STELLAR INVESTMENT PTE. LTD.**, a Singapore company set up 7 Jul 2020 at 2 Battery Road, #27-01 Maybank Tower, and 100% owned by EVER RISING LIMITED. BTR's 2022 JV announcement (no. 2022-110) gives 60/40 at founding. BTR's 2025 guarantee announcement (FY2024 figures) still says "公司持股60%" for 印尼贝特瑞. It also gives registered capital of US$167.3m (US$148.57m paid in), set up 16 Jan 2023. Petromindo (Mar 2025) reports the same 60/40 and calls Stellar a subsidiary of **Tsingshan Holding Group**. That Tsingshan link is secondary: the BTR filing names only Ever Rising Ltd. The 70/30 split comes from a trade directory (battery-tech.net) and is not supported. | BSE announcement 2022-110: http://static.cninfo.com.cn/finalpage/2022-06-23/1213803583.PDF ; BSE guarantee announcement (Sina mirror): http://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?stockid=835185&id=10880479 ; Tsingshan link (secondary): https://www.petromindo.com/news/article/btr-confirms-its-phase-ii-anode-material-production-to-commence-in-2025 | w001, w002 |
| 2 | Shanghai Putailai's stake in Putailai (Singapore) and Zichen Malaysia | **RESOLVED** | Zichen Malaysia is a **wholly owned indirect subsidiary ("境外全资孙公司") of Shanghai Putailai**, i.e. 100% indirect. This is stated in Putailai's SSE announcement of 11 Mar 2026 on the 50 kt / US$297m Gurun, Kedah plant. Putailai (Singapore) is Putailai's **wholly owned subsidiary ("全资子公司")**, per its May 2023 SSE announcement on the Sweden project (reported by the China Battery Industry Association). The Singapore-to-Malaysia hop is given only by the Malaysian registry (Sayari v028). The SSE text says "wholly owned grandchild" without naming the intermediate company. | SSE announcement (Sina mirror): https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?stockid=603659&id=11990940 ; Singapore sub: http://www.chinabattery.org/content2/1309/1312/1054432.html | w003 |
| 3 | EVE Energy's stake in EVE Energy Malaysia | **RESOLVED** | **100%.** EVE's 2025 interim report subsidiary table lists EVE ENERGY MALAYSIA SDN. BHD. (registered capital MYR 507,887,000, Malaysia, manufacturing) at 100%, set up by EVE. EVE's 2023 interim report says EVE Asia Co., Ltd. (亿纬亚洲, HK) set it up on 30 Aug 2022, so the holding is indirect, through EVE Asia. EVE Asia itself is 100% held (US$409.5m registered capital). | EVE 2025 interim report (SZSE 300014): http://static.cninfo.com.cn/finalpage/2025-08-22/1224535979.PDF ; 2023 interim report: https://pdf.dfcfw.com/pdf/H2_AN202308241595704544_1.pdf | w004 |
| 4a | CATL's stake in Xiamen Ampace | **RESOLVED** | **CATL indirectly holds 59.5% of Xiamen Ampace (厦门新能安科技有限公司).** CATL's controlled subsidiary Xiamen Xinnenghe (厦门新能和科技) holds 85% of Xiamen Ampace, and CATL holds 70% of Xinnenghe. Xiamen Ampace is consolidated by CATL ("合并报表控股子公司"). | CATL 2026 guarantee-quota announcement, 10 Mar 2026: http://static.cninfo.com.cn/finalpage/2026-03-10/1225002226.PDF | w005 |
| 4b | Ampace Technology's stake in Linergy Power | **RESOLVED, but the owner has changed** | Before June 2026 Linergy was **100% owned by Ampace Technology Ltd** (Companies Commission Malaysia, as reported by The Edge). TDK then bought **100%** of Linergy for US$241.1m through Amperex Technology (Singapore) Pte. Ltd.: board approval 19 May 2026, share transfer scheduled 15 Jun 2026. TDK's Q1 FY2026 results (31 Jul 2026) say TDK acquired all shares in the quarter to 30 Jun 2026 and consolidated Linergy. Before the deal TDK "indirectly" held 25.5%. That matches ATL's 30% of Xinnenghe × 85% (our arithmetic). **Linergy has been a Japanese (TDK) subsidiary since about mid-June 2026.** Sayari still shows the old Ampace chain (w030), so its registry data lags. | TDK release: https://www.tdk.com/en/news_center/press/20260519_00.html ; TDK Q1 results: https://www.tdk.com/system/files/2026073100_lda9mypa_en.pdf ; SSM via The Edge: https://theedgemalaysia.com/node/804307 | w006, w007, w019, w030 |
| 5 | Volkswagen's stake in Gotion High-Tech | **RESOLVED (with a pending change)** | **24.28%** (440,630,983 shares) at 30 Jun 2026, the largest shareholder, per Gotion's 2026 interim report summary. It was 24.29% at 31 Dec 2025. On **28 Sep 2026** Gotion announced that Volkswagen (China) would sell **5.30%** (96.18m shares, RMB 2.317bn) to **Hefei Construction Investment (合肥市建设投资有限公司)**, a Hefei state-owned investor. After the sale VW would hold **18.98%** and stay the largest shareholder. Press reports say the transfer still needs SZSE confirmation and share registration. We did not find a completion notice. VW still waives part of its voting rights under the 2020 shareholder agreement, and Li Zhen remains the actual controller. | 2026 interim summary (SZSE 002074): http://static.cninfo.com.cn/finalpage/2026-08-25/1225495933.PDF ; 28 Sep transfer (press summary of the announcement): https://finance.eastmoney.com/a/202609293885850776.html ; https://timeline.sohu.com/news/pLGXZkO8ax | w008, w009 |
| 6 | Primary document saying Gotion High-Tech owns Gotion Inc. and Gotion Illinois | **RESOLVED (Chinese filing; still no US filing)** | Gotion High-Tech's **2023 annual report** calls GOTION, INC. "公司全资子公司" (the company's wholly owned subsidiary) when describing the 24 Oct 2023 Michigan agreements. It pairs the Chinese name 国轩高科（美国）有限公司 with "GOTION INC.". Its list of new subsidiaries has **国轩伊利诺伊新能源有限公司 (Gotion Illinois New Energy), set up Dec 2023, "子公司国轩高科（美国）有限公司持股100%"**, and two more US companies with the same 100% holder ("333 South Spruce LLC", the Manteno site address, and a New Energy Real Estate Holdings LLC). This closes the "name only" gap: the "Gotion High-Tech (USA)" in China's outbound-investment filings is Gotion, Inc. by the company's own name pairing. The Illinois REV agreement (DCEO, 6 Sep 2023) was signed by Gotion, Inc. (48660 Kato Road, Fremont) but **does not name a parent**. | Gotion 2023 annual report (Xueqiu mirror of SZSE filing): https://stockn.xueqiu.com/SZ002074/20240419794504.pdf ; REV agreement: https://dceo.illinois.gov/content/dam/soi/en/web/dceo/expandrelocate/incentives/rev-agreements/unity_tier_2_rev_agreement_redacted.pdf | w010, w011, w012, w013 |
| 7 | POSCO Future M "still uses Chinese spherical graphite" | **PARTLY** | Reputable 2025–26 press supports it, but no company figure was found. KED Global (Apr 2025): Korea imports **100%** of its spherical graphite from China, and POSCO Future M has made its Sejong natural-graphite anode from it. TheElec (Dec 2025) and EBN (Jun 2026): the first Korean spherical-graphite plant (Future Graph, Saemangeum, 37 kt/yr, about KRW 436bn) is under construction. It is due to complete in Q3 2027, with mass production in Q4 2027 or H2 2027. POSCO's own newsroom (16 Mar 2026) gives the non-Chinese route (African ore, Saemangeum) as a plan, not a current fact. It follows that natural-graphite anode made before late 2027 still uses imported, almost all Chinese, spherical graphite. **No POSCO Future M figure for its Chinese-origin share was found.** The only figures are Korea-wide: spherical 100% (KED 2025), and natural 97.7% / synthetic 98.8% of graphite imports from China (economy.ac, Oct 2025, citing trade data). | https://www.kedglobal.com/batteries/newsView/ked202504230002 ; https://www.thelec.kr/news/articleView.html?idxno=50114 ; https://kr.investing.com/news/stock-market-news/article-1985615 ; https://newsroom.posco.com/kr/%ED%8F%AC%EC%8A%A4%EC%BD%94%ED%93%A8%EC%B2%98%EC%97%A0-1%EC%A1%B0%EC%9B%90-%EC%9D%B8%EC%A1%B0%ED%9D%91%EC%97%B0-%EC%9D%8C%EA%B7%B9%EC%9E%AC-%EC%88%98%EC%A3%BC-%EC%9D%8C%EA%B7%B9%EC%9E%AC | w014, w015 |
| 8 | Zhongke Electric cancels the Morocco anode project (Jun 2026) | **RESOLVED (several outlets; cninfo PDF not retrieved)** | On **12 Jun 2026** Zhongke Electric (SZSE 300035) announced it would end three deferred projects: Ganmei (130 kt), Lanzhou New Area (100 kt) and the **Morocco 100 kt/yr integrated anode base** (signed Apr 2024, investment up to RMB 5bn). Together they were planned at about RMB 10.3bn. None had started real construction. The company is concentrating on Luzhou (300 kt) and **Oman**. Reported the same day by Caizhongshe (via Tencent News) and Gelonghui, and later by China Energy Net and 36Kr. It no longer rests on GraphiteHub alone. | https://news.qq.com/rain/a/20260612A098LF00 ; https://www.tradingview.com/news/gelonghui:7dbb2a2d8e3f9:0 ; https://www.sohu.com/a/1045355249_121925623 | w016 |
| 9 | EVE Energy on the 1260H list (Federal Register) | **RESOLVED** | **Federal Register Doc. 2026-11571, "Notice of Availability of Designation of Chinese Military Companies", published 10 Jun 2026** (signed 5 Jun 2026, filed 8 Jun 2026, docket DOD-2026-OS-1288, around page 35190). The list includes "EVE Energy Co., Ltd. (EVE Energy)", plus CALB Group and BYD. | https://www.federalregister.gov/documents/2026/06/10/2026-11571/notice-of-availability-of-designation-of-chinese-military-companies ; PDF: https://public-inspection.federalregister.gov/2026-11571.pdf | w017, w018 |
| 10a | Sayari re-scan: BTR Mediterranean | **No change** | 17 rows in all, the same as v015. 3 HS 3801.10 rows from BTR Indonesia (`ekoH1fr8…`, departing IDN, latest date 19 Aug 2026) and 14 Chinese construction-goods rows (earliest 2 Nov 2025). Nothing after 19 Aug 2026. The registry record `El_6QFk0rVRdYJanrqEtAA` still has trade 0/0, and the trade record `1CjF5vzVgFFxVomroaYyaA` has 4 received. | Sayari | w020, w021, w028 |
| 10b | Sayari re-scan: Zichen Malaysia | **No change** | `WG1hrSwGRdoLMIt997Z5-w`: trade 0/0. A shipment search on the name returns 0. | Sayari | w022, w023 |
| 10c | Sayari re-scan: Zhongke Sohar/Oman | **No change** | No shipments into Oman under "Zhongke". No Oman rows for "Sohar graphite anode" from 2026. No entity for a Zhongke Oman, Sohar or Hong Kong holding company (the 33 "Zhongke Xingcheng" hits are all Chinese, plus one Hunan trade record). | Sayari | w024, w025, w026, w027 |

## Site updates

Edit the sources (`investigation/build_data.py`, `investigation/cases/*.json`, `investigation/curated.json`), then rebuild `data/*.json`. The same strings appear in `data/edges.json`, `data/entities.json`, `data/cases.json` and `data/curated.json`. Add the new sources (w-ids above) to the relevant `source_call_ids` or `call_ids`.

### Case 1 (BTR Indonesia): ownership percentage

1. `investigation/build_data.py`, edge `e010` evidence.
   - Current: "Not in Sayari (find_beneficial_owners returned 0; shortest path is trade only). BTR's own press release calls the plant its Indonesian facility; one trade directory gives 70% BTR, 30% Stellar Investment (single source)."
   - New: "Not in Sayari (find_beneficial_owners returned 0; shortest path is trade only). BTR's own Beijing Stock Exchange filings give the split: 60% BTR, through BTR (Hong Kong) New Material, and 40% Stellar Investment Pte. Ltd. of Singapore (JV announcement 2022-110; guarantee announcement with FY2024 figures, '公司持股60%'). The filing names Stellar's owner as Ever Rising Limited. Indonesian press says Stellar belongs to Tsingshan."
   - Also raise the edge confidence from "corroborated" to "documented" (an exchange filing), and add w001 and w002 to its sources.
2. `investigation/curated.json`, `screening/case-1/chain/0/stake`.
   - Current: "Not in Sayari; one trade directory says 70%"
   - New: "60% (BTR exchange filings; not in Sayari)"
3. `investigation/build_data.py`, case-1 step 3 ("The owner: not in the registry").
   - Current: "… BTR's own press release calls the plant its Indonesian facility, so the ownership edge is shown with that source, not Sayari's."
   - New: "… BTR's own exchange filings show it holds 60% through BTR (Hong Kong). The other 40% belongs to Stellar Investment, a Singapore holding company that Indonesian press links to the Tsingshan nickel group. The ownership edge is shown with those filings, not Sayari's."
4. `investigation/build_data.py`, case-1 answer.
   - Current: "… so that link rests on BTR's own statements."
   - New: "… so that link rests on BTR's own filings (60%, with Tsingshan-linked Stellar Investment holding 40%)."

### Case 3 (Zhongke): Morocco cancellation

5. `investigation/cases/case3.json`, `calls/12/interpretation`.
   - Current: "… The Morocco cancellation still rests on GraphiteHub and the board notice it cites."
   - New: "… The Morocco cancellation is confirmed by Zhongke's own 12 Jun 2026 announcement, as reported by Caizhongshe, Gelonghui and China Energy Net. The project was a 100 kt/yr base signed in Apr 2024 (up to RMB 5bn) that was never built."

### Case 4 (POSCO Future M): Chinese spherical graphite

6. `investigation/cases/case4.json`, `case/steps/4/text`.
   - Current: "… The company says it still uses Chinese spherical graphite, so the gap is in coverage. …"
   - New: "… Korea still imports all its spherical graphite from China (KED Global, 2025). POSCO Future M's own spherical-graphite plant at Saemangeum is not due to produce until late 2027, so its natural-graphite anode still depends on Chinese spherical graphite. The gap is in coverage. No company figure for the Chinese share was found. …"
7. `investigation/cases/case4.json`, `case/headline`.
   - Current: "… while the company says it still uses Chinese spherical graphite."
   - New: "… while press reports and the company's own plans show it still depends on Chinese spherical graphite until its Saemangeum plant starts in late 2027."
8. `investigation/curated.json`, `screening/case-4/inputs`.
   - Current: "… (to Dec 2023 in the data; the company says it still uses some)."
   - New: "… (to Dec 2023 in the data; Korean spherical graphite is all imported from China until Saemangeum starts in late 2027)."

### Case 5 (Putailai / Zichen Malaysia)

9. `investigation/cases/case5.json`, `case/steps/3/text`.
   - Current: "… and Putailai's own announcement calls Zichen Malaysia a wholly owned subsidiary. …"
   - New: "… Putailai's SSE announcement of 11 Mar 2026 calls Zichen Malaysia a 'wholly owned overseas grandchild company' (境外全资孙公司), and a 2023 announcement calls Putailai (Singapore) a wholly owned subsidiary. …"
10. `investigation/curated.json`, `screening/case-5/chain/0/stake`.
    - Current: "Not shown"
    - New: "100% (SSE announcements)"

### Case 6 (EVE Malaysia and Linergy Power)

11. `investigation/cases/case6.json`, `case/caveats/6`.
    - Current: "Ownership percentages are missing for EVE Asia → EVE Malaysia and for CATL → Xiamen Ampace."
    - New: "Ownership percentages come from company filings, not Sayari. EVE's interim report shows EVE Malaysia at 100%, and CATL's March 2026 announcement shows CATL holding 59.5% of Xiamen Ampace."
12. `investigation/cases/case6.json`, `case/verdict/not_visible/1/text`.
    - Current: "EVE Asia's percentage in the Malaysian plant, and CATL's percentage in Xiamen Ampace."
    - New: Move this to "detected", with the text "From filings, not Sayari: EVE Malaysia is 100% EVE (through EVE Asia), and CATL holds 59.5% of Xiamen Ampace through Xiamen Xinnenghe (85%)." Cite w004 and w005.
13. `investigation/curated.json`, `screening/case-6/chain/1/stake`.
    - Current: "Shareholder (% not shown)"
    - New: "100% (EVE interim report)"
14. `investigation/cases/case6.json`, `case/steps/4/text`.
    - Current: "Linergy Power in Selangor was registered in Dec 2024. Its shareholder is Ampace Technology (Hong Kong), whose Xiamen parent counts CATL among its shareholders. …"
    - New: "Linergy Power in Selangor was registered in Dec 2024. Until June 2026 it was 100% owned by Ampace Technology (Hong Kong), whose Xiamen parent is 59.5% owned by CATL. In June 2026 Japan's TDK bought all of it for US$241m through ATL's Singapore arm, so the Aug–Sep 2026 Eaton rows were shipped under TDK ownership. Sayari's registry data still shows the old Ampace chain. …"
15. `investigation/cases/case6.json`, `entities/32/summary`.
    - Current: "… Its shareholder is Ampace Technology Limited (Hong Kong), part of a Xiamen group co-owned by CATL. …"
    - New: "… Owned 100% by Ampace Technology Limited (Hong Kong; CATL 59.5% further up) until June 2026, when TDK's Amperex Technology (Singapore) bought 100%. Sayari has not caught up with the sale. …"
16. `investigation/cases/case6.json`, `edges/34/evidence`.
    - Current: "Malaysian company data names Ampace Technology Limited as Linergy Power's shareholder; no percentage."
    - New: "Malaysian company data names Ampace Technology Limited as Linergy Power's shareholder (100% per SSM, reported by The Edge). This is historical: TDK bought 100% in June 2026 (TDK release of 19 May 2026; Q1 results of 31 Jul 2026)."
    - Add a new edge: Amperex Technology (Singapore) / TDK → Linergy Power, owns, 100%, from Jun 2026, source w006/w007/w019.
17. `investigation/cases/case6.json`, `entities/34/summary`.
    - Current: "… Its shareholders include CATL, 厦门新能和科技有限公司 and four Xiamen partnerships; shares not returned."
    - New: "… 85% held by 厦门新能和科技 (Xiamen Xinnenghe: CATL 70%, ATL 30%), with the rest held by four Xiamen partnerships. CATL holds 59.5% indirectly and consolidates it (CATL announcement, 10 Mar 2026)."
18. `investigation/cases/case6.json`, `case/passport/4/paper_trail`.
    - Current: "… Linergy → Ampace (HK) → Xiamen Ampace → CATL among shareholders."
    - New: "… Linergy → Ampace (HK) → Xiamen Ampace (CATL 59.5%) until Jun 2026; TDK (Japan) 100% since then."
19. 1260H source: `investigation/cases/case6.json`, `calls/18` (t601) result_summary. Add: "Federal Register notice 2026-11571 (published 10 Jun 2026, docket DOD-2026-OS-1288) lists 'EVE Energy Co., Ltd. (EVE Energy)'." Add the Federal Register URL to the t601 sources and to the 1260H entry in `data/sources.json` and the policy timeline. In `verification.md`, the line "I could not retrieve it again in this pass" is now superseded (w018).

### Case 7 (Gotion US)

20. `investigation/cases/case7.json`, `case/steps/1/text`.
    - Current: "… California lists no shareholders, and Sayari found no owners for Gotion, Inc. … Registry data also lists Volkswagen (China) Investment as a shareholder of the parent, with no percentage."
    - New: "… California lists no shareholders, and Sayari found no owners for Gotion, Inc. Gotion High-Tech's own 2023 annual report closes the gap: it calls GOTION, INC. (国轩高科（美国）有限公司) a wholly owned subsidiary, and lists Gotion Illinois New Energy as 100% held by it. … Volkswagen (China) Investment held 24.28% of the parent at 30 Jun 2026. In Sep 2026 it agreed to sell 5.30% to a Hefei state investor, which will leave it with 18.98%."
21. `investigation/cases/case7.json`, `case/headline`.
    - Current: "… Chinese records show Gotion High-Tech owning a US subsidiary through Hefei Gotion, but US registries list no shareholder, so the last link rests on name and press."
    - New: "… Gotion High-Tech's annual report names Gotion, Inc. as a wholly owned subsidiary and Gotion Illinois as 100% owned by it. US registries still list no shareholder."
22. `investigation/cases/case7.json`, `case/answer`.
    - Current: "… Ownership only in part: Chinese registry data traces Gotion High-Tech down to a US subsidiary, but no US record shows who owns the Fremont or Manteno companies."
    - New: "… Ownership, yes, from the parent's own annual report (Gotion, Inc. wholly owned; Gotion Illinois 100% under it). No US record shows it."
23. `investigation/cases/case7.json`, `case/verdict/not_visible/0/text`.
    - Current: "Who owns Gotion, Inc. and Gotion Illinois, from any US record. California and SAM list no shareholders."
    - Keep the text, and add to "detected": "Gotion High-Tech 2023 annual report: GOTION, INC. is a wholly owned subsidiary; Gotion Illinois New Energy is 100% held by it (set up Dec 2023)." Cite w013.
24. `investigation/cases/case7.json`, `case/verdict/detected/3/text` and `case/verdict/not_visible/3/text`.
    - Current: "Volkswagen (China) Investment is listed as a shareholder of Gotion High-Tech in registry data (no percentage)." / "The size of Volkswagen's stake."
    - New (detected): "Volkswagen (China) Investment holds 24.28% of Gotion High-Tech (2026 interim report), cut to 18.98% under a 5.30% sale to Hefei Construction Investment agreed 28 Sep 2026." Delete the not_visible item.
25. `investigation/cases/case7.json`, `entities/3/summary`.
    - Current: "A US subsidiary of Hefei Gotion, recorded in China's outbound-investment filings. It has no US address or identifier, so we can't tie it to Gotion, Inc. by record. The name is the only link."
    - New: "A US subsidiary recorded in China's outbound-investment filings. Gotion High-Tech's 2023 annual report pairs this Chinese name (国轩高科（美国）有限公司) with 'GOTION INC.' and calls it wholly owned, so it is Gotion, Inc. of Fremont."
26. `investigation/cases/case7.json`, `edges/4/evidence`.
    - Current: "… The press describes Gotion, Inc. as the US subsidiary of Gotion High-Tech. No US filing names the shareholder."
    - New: "… Gotion High-Tech's 2023 annual report calls GOTION, INC. its wholly owned subsidiary. No US filing names the shareholder."
    - Add an owns edge Gotion, Inc. → Gotion Illinois New Energy, 100%, source w013.
27. `investigation/cases/case7.json`, `entities/16/summary` and `edges/18/evidence`.
    - Current: "… it gives no percentage." / "No percentage is given."
    - New: "24.28% at 30 Jun 2026 (Gotion interim report); 18.98% once the 5.30% sale to Hefei Construction Investment, agreed 28 Sep 2026, completes."
28. `investigation/curated.json`, `screening/case-7/chain/0/stake` and `chain/2/stake`.
    - Current: "Volkswagen (China) is a shareholder; % not shown" / "Parent"
    - New: "Volkswagen (China) 24.28% (falling to 18.98%)" / "100% (annual report)"

## Call log

| id | tool | params | result |
|---|---|---|---|
| w001 | tavily.tavily_search | "贝特瑞 印尼 PT Indonesia BTR New Energy Material 持股 70% 控股子公司 年度报告", advanced, 8 | BTR guarantee announcement: 印尼贝特瑞 "公司持股60%", US$167.3m capital, set up 16 Jan 2023. cninfo 2022-110: BTR HK 60% / STELLAR INVESTMENT PTE. LTD. 40%, Stellar 100% owned by Ever Rising Ltd. battery-tech.net source of 70/30 |
| w002 | tavily.tavily_search | "PT Indonesia BTR New Energy Material shareholders Stellar Investment Morowali IMIP anode", advanced, 8 | Petromindo (Mar 2025): 60/40, Stellar a Tsingshan subsidiary. Reuters (Aug 2024) names BTR and Singapore's Stellar Investment |
| w003 | tavily.tavily_search | "璞泰来 马来西亚 紫宸 负极材料 项目 全资子公司 璞泰来（新加坡） 公告", advanced, 8 | Putailai SSE announcement 11 Mar 2026: Zichen Malaysia "境外全资孙公司". 2023: Putailai (Singapore) "全资子公司" |
| w004 | tavily.tavily_search | "亿纬锂能 马来西亚 亿纬亚洲 持股比例 子公司 EVE ENERGY MALAYSIA 年度报告 2025", advanced, 8 | EVE 2025 interim report: EVE Energy Malaysia 100%. 2023 interim report: set up by EVE Asia 30 Aug 2022 |
| w005 | tavily.tavily_search | "宁德时代 厦门新能安 持股比例 年度报告 联营 新能安科技", advanced, 8 | CATL 10 Mar 2026 announcement: Xinnenghe holds 85% of Xiamen Ampace; CATL indirect 59.5%; consolidated |
| w006 | tavily.tavily_search | "Linergy Power Sdn Bhd Ampace Malaysia battery plant Selangor shareholder", advanced, 8 | TDK (19 May 2026) to buy 100% of Linergy for US$241.1m via Amperex Technology (Singapore); TDK already indirect 25.5%. The Edge: SSM shows 100% Ampace Technology Ltd |
| w007 | tavily.tavily_search | "TDK Linergy Power acquisition completed June 2026 Amperex Technology Singapore", from 2026-06-01, 6 | 1 Malay social post repeating the deal; no completion notice |
| w008 | tavily.tavily_search | "国轩高科 2026年半年度报告 大众汽车（中国）投资有限公司 持股比例 前十名股东", advanced, 8 | 2026 interim summary: VW (China) 24.28%, 440,630,983 shares; 24.29% at end-2025 |
| w009 | tavily.tavily_search | "国轩高科 大众中国 持股比例 降至18.98% 权益变动 2026年9月", from 2026-09-01, advanced, 6 | 28 Sep 2026: VW (China) to transfer 5.30% to 合肥市建设投资有限公司, RMB 2.317bn; 24.28% → 18.98%; still largest holder |
| w010 | tavily.tavily_search | "国轩高科 年度报告 子公司 Gotion Inc. 美国 持股比例 100% Gotion Illinois 伊利诺伊", advanced, 8 | Gotion 2023 annual report: 国轩伊利诺伊新能源有限公司 (Dec 2023) held 100% by 国轩高科（美国）有限公司 |
| w011 | tavily.tavily_search | "Gotion Inc. wholly owned subsidiary of Gotion High-Tech Illinois Manteno incentive agreement DCEO EDGE Kankakee County", advanced, 8 | Illinois governor press release, REV agreement PDF (Gotion, Inc., 6 Sep 2023); Crain's: "wholly owned U.S. subsidiary" (secondary) |
| w012 | tavily.tavily_extract | DCEO REV agreement PDF, query "parent subsidiary Affiliates" | Signed by Gotion, Inc. (Chen Li, President, Fremont); mentions Affiliates; no parent named |
| w013 | tavily.tavily_extract | Gotion 2023 annual report PDF (Xueqiu), query "国轩高科（美国）有限公司 GOTION, INC. 持股比例" | "公司全资子公司GOTION, INC." (Michigan agreements, 24 Oct 2023); "国轩高科（美国）有限公司（GOTION INC.）" |
| w014 | tavily.tavily_search | "POSCO Future M Chinese spherical graphite dependence share 2026 natural graphite anode imports China", from 2025-01-01, advanced, 8 | KED (Apr 2025): Korea's spherical graphite 100% from China; economy.ac: 97.7% natural / 98.8% synthetic; no company share |
| w015 | tavily.tavily_search | "포스코퓨처엠 구형흑연 중국산 비중 2026 음극재 새만금 구형흑연 공장", from 2025-06-01, advanced, 8 | TheElec (Dec 2025): Saemangeum 37 kt, complete Q3 2027; EBN (Jun 2026): on schedule; POSCO newsroom (Mar 2026): plan only; no company %; blog claim "전량 수입" (not used) |
| w016 | tavily.tavily_search | "中科电气 终止 摩洛哥 负极材料 项目 公告 2026年6月 董事会", from 2026-05-01, advanced, 8 | 12 Jun 2026 announcement ends Ganmei, Lanzhou and Morocco (100 kt, Apr 2024, ≤RMB 5bn) projects; Caizhongshe, Gelonghui, China Energy Net, 36Kr |
| w017 | tavily.tavily_search | "Federal Register 'Entities Identified as Chinese Military Companies…' Section 1260H 2026 notice", from 2026-05-15, advanced, 8 | FR Doc 2026-11571, published 10 Jun 2026; public-inspection PDF; law-firm alerts |
| w018 | tavily.tavily_extract | federalregister.gov 2026-11571, query "EVE Energy Co., Ltd. CALB Gotion" | List includes "EVE Energy Co., Ltd. (EVE Energy)", CALB, BYD; docket DOD-2026-OS-1288; dated 5 Jun 2026 |
| w019 | tavily.tavily_search | "TDK Linergy Power share transfer completion wholly-owned subsidiary", include_domains tdk.com, 5 | TDK Q1 results (31 Jul 2026): acquired all Linergy shares in the quarter to 30 Jun 2026; consolidated |
| w020 | sayari.search_trade_facets | scope shipments, query "\"BTR MEDITERRANEAN\"" | 17 rows (14 CHN, 3 IDN); HS 380110 ×3; latest 19 Aug 2026; no new rows |
| w021 | sayari.get_entity_summary | entity El_6QFk0rVRdYJanrqEtAA | Tangier Tech SASU, registered 9 Oct 2023, LEI 8945002T04JUT1ZWQG56; trade 0/0 |
| w022 | sayari.get_entity_summary | entity WG1hrSwGRdoLMIt997Z5-w | Zichen Malaysia, registered 23 Sep 2025; trade 0/0 |
| w023 | sayari.search_shipments | query "\"ZICHEN MALAYSIA\"", limit 10 | 0 rows |
| w024 | sayari.search_trade_facets | scope shipments, query "ZHONGKE", arrival OMN | 0 rows |
| w025 | sayari.search_entities | query "\"Zhongke\" Oman Sohar", limit 10 | 0 |
| w026 | sayari.search_entities | query "\"Zhongke Xingcheng\"", limit 10 | 33 hits, all Chinese companies (plus a Hunan trade record); no HK or Oman entity |
| w027 | sayari.search_trade_facets | scope shipments, query "Sohar graphite anode", arrival OMN, from 2026-01-01 | 0 rows |
| w028 | sayari.get_entity_summary | entity 1CjF5vzVgFFxVomroaYyaA | BTR Mediterranean Anode trade record; received 4, sent 0; unchanged |
| w029 | sayari.search_entities | query "\"Linergy Power\"", limit 5 | Linergy Power Sdn Bhd ySemfyJJesFbfxEgW2SgCg (Serendah, Selangor) |
| w030 | sayari.find_beneficial_owners | entity ySemfyJJesFbfxEgW2SgCg, max_depth 3, limit 10 | Still Ampace Technology Ltd → Xiamen Ampace → CATL, Xinnenghe and partnerships; no TDK / Amperex (Singapore) |

Budget: 19 Tavily calls (16 searches, 3 extracts) and 11 Sayari calls, within the planned 15–25 and 10–15. No calls failed.
