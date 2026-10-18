# Changelog

## Iteration 1.4 · 18 Oct 2026
- Four new cases:
  - 9: Ford's links to BTR
  - 10: CATL, Ampace and Linergy, now TDK-owned
  - 11: CATL Debrecen, an EU comparison
  - 12: Huayou nickel in Indonesia
- Case 2 corrected: the anode company is most likely BTR Mediterranean Anode.
- Ownership deepened from company filings (`verification-2.md`):
  - BTR holds 60% of BTR Indonesia; the other 40% is Stellar Investment.
  - EVE Malaysia is 100% owned; Putailai's Malaysian plant is 100% owned.
  - CATL holds 59.5% of Xiamen Ampace, and TDK bought Linergy in Jun 2026.
  - Volkswagen holds 24.28% of Gotion, falling to 18.98%.
  - Gotion's annual report confirms it wholly owns its US subsidiaries.
  - The 1260H listing is confirmed in the Federal Register.
- Due Diligence lists every remaining unknown, with the document that would settle it.
- Check a Buyer:
  - wider HS 3801/8507 supplier scans for Ford, Panasonic and LG Energy Solution
  - a step-by-step guide and prompt to check any buyer
  - freight forwarders separated out
- "Last checked" dates on every case; a monthly cloud re-check routine that opens pull requests.
- Home: executive summary, a guided tour, a seventh finding.
- Social preview card, favicon, and Open Graph tags on every page.
- Accessibility: axe-core audit (WCAG 2 A/AA plus best practice) passes on every page after contrast, ARIA and heading fixes.

## Iteration 1.3 · 18 Oct 2026
- Re-check of every headline claim and policy date (52 calls; `investigation/notes/verification.md`). Corrections:
  - Case 1: about 55 rows, including Singapore-loaded ones; shipments to Ultium continue to Nov 2025. Sayari merged the anchor record.
  - Case 2: first graphite into Tangier from BTR Indonesia (1,240 t, 19 Aug 2026).
  - Case 7: "via Jamaica" rows explained as ZIM transshipment at Kingston.
  - Case 6: port wording. Policy: EVE 1260H confirmed; truce extended to 10 Jan 2027, but Announcement 70 still ends 10 Nov 2026.
- Home page:
  - new headline
  - world map of the eight supply chains
  - simpler case cards with one-line answers
  - findings as a numbered list
  - walkthrough graph and verdict removed
  - glossary collapsed
- New pages:
  - **Check a Buyer:** suppliers, owners and shipments for a chosen US buyer.
  - **Due Diligence:** ownership screening, supplier questions and a watch list.
- Explore:
  - four-column layout (owners → suppliers → plant → buyers)
  - case tabs, with filters tucked away
  - duplicate buyer records merged
  - readable starting zoom
- About: removed the audience sentence and updated the purpose.

## Iteration 1.2 · 14 Oct 2026 (before class, second review)
- Three more cases:
  - EVE Energy Malaysia, rerouting at the cell level
  - Gotion's plants inside the US
  - Syrah Mozambique → Louisiana, a non-Chinese benchmark
- Graph redesign: duplicate records merged, colour by role, hover focus with tooltips, line width by shipment count, zoom controls, a details drawer.
- Every case opens with the question, the answer and why it matters.
- Relevant individuals are named with their roles; nominee directors are not.
- Removed the feedback box from the home page.

## Iteration 1.1 · 14 Oct 2026 (before class, after India's first review)
- Expanded from one plant to five cases: BTR Indonesia, BTR Morocco, Zhongke Oman, a Korean contrast case, and Putailai Malaysia (picked by corridor scan).
- New plain-language home page:
  - key-number tiles with sources
  - a "why this matters" explainer
  - a rerouting diagram
  - case cards with an answer type
  - a per-case walkthrough
  - a glossary
- "Corroborated" renamed "Cross-checked". About now has a "How we rate confidence" section with thresholds and reasoning, and every link shows a "Why" line.
- All companies named. Individuals (directors, officers) are not.
- Method: replay and scorecard grouped by case; four new lessons about the tool.

## Iteration 1 · 14 Oct 2026
- Case 1 traced: PT Indonesia BTR New Energy Material, using 24 logged Sayari MCP calls.
  - Transactional: HS 3801.10 from the plant to five US cell or auto makers (Dec 2024 – Aug 2025); HS 3801 into the plant from China.
  - Contractual: no registry ownership in Sayari; BTR ownership from open sources only.
  - Inferred: five fragmented records resolved by shared address; a supplier sharing the BTR Building address.
- Policy timeline verified with 14 Tavily calls. Corrections to concept.md:
  - Commerce AD/CVD finals were published in the Federal Register on 17 Feb 2026, announced 11 Feb.
  - The CVD rate is 66.82–66.86%.
  - The USITC's finding was "material retardation", not no injury.
  - Added China's Announcements 58 and 70 (2025).
- Site: The Trace (5-step stepper with ← →), Explore (filters, side panel, list view), Case Files (Passport vs. Paper Trail), Method (replay, scorecard, rubric, Fuse.js log search), About.
- Case 2 (Morocco) logged as a lead.
