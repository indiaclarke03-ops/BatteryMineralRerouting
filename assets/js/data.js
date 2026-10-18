/* Paper Trail: data loading and shared formatting helpers. */
window.PT = window.PT || {};

(function (PT) {
  const FILES = ["entities", "edges", "cases", "call_log", "policy_timeline", "sources", "overview", "curated", "buyers"];

  PT.load = async function () {
    if (PT._data) return PT._data;
    const parts = await Promise.all(
      FILES.map((f) => fetch(`data/${f}.json`).then((r) => {
        if (!r.ok) throw new Error(`Could not load data/${f}.json (${r.status})`);
        return r.json();
      }))
    );
    const d = {};
    FILES.forEach((f, i) => { d[f] = parts[i]; });
    d.asOf = d.entities.as_of;
    d.entityById = new Map(d.entities.items.map((e) => [e.id, e]));
    d.edgeById = new Map(d.edges.items.map((e) => [e.id, e]));
    d.callById = new Map(d.call_log.items.map((c) => [c.id, c]));
    d.caseById = new Map(d.cases.items.map((c) => [c.id, c]));
    PT._data = d;
    return d;
  };

  PT.esc = function (s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };

  PT.CONF = {
    documented: { label: "Documented", help: "A primary record shows it: dated shipment rows or a registry entry in Sayari, or the company's own stock-exchange or regulatory filing." },
    corroborated: { label: "Cross-checked", help: "Two independent sources agree, for example a Sayari link plus a company statement or filing. No single record states it in full." },
    inferred: { label: "Inferred", help: "Our judgment from matching details (same street address, same name, same buyers). No record states it." },
    lead: { label: "Lead", help: "One weak signal, such as a name match. Worth checking; don't rely on it." },
  };
  PT.PATTERN = {
    "rerouting-pattern": "Pattern found: Chinese inputs in, US shipments out",
    "complete-trail": "Full trail visible",
    "trail-not-started": "Not exporting yet: baseline set",
    "contrast-legitimate": "Contrast: non-Chinese owner",
    "trail-goes-dark": "Trail goes dark",
  };
  PT.ETYPE = {
    transactional: { label: "Shipment (transactional)", cls: "tx", help: "Goods moved: a customs or bill-of-lading record with product code (HS) and dates." },
    contractual: { label: "Ownership (contractual)", cls: "ct", help: "A company-registry or filing link: owns, subsidiary of, director of." },
    inferred: { label: "Inferred link", cls: "inf", help: "Worked out rather than stated: probable duplicate records, shared addresses, risk links." },
  };
  PT.ROLE = {
    parent: "Chinese parent / producer",
    trader: "Trader",
    producer: "Raw-material producer",
    transit_plant: "Third-country plant",
    us_buyer: "US buyer",
    contrast: "Registry contrast",
    buyer: "Buyer",
  };
  PT.COUNTRY = {
    CHN: "China", IDN: "Indonesia", USA: "United States", MOZ: "Mozambique", MDG: "Madagascar",
    ARE: "United Arab Emirates", KOR: "South Korea", MAR: "Morocco", OMN: "Oman", JPN: "Japan",
    VNM: "Vietnam", MYS: "Malaysia", THA: "Thailand", MEX: "Mexico", HKG: "Hong Kong", SGP: "Singapore",
    DEU: "Germany", ESP: "Spain", IND: "India", CAN: "Canada", GBR: "United Kingdom", AUS: "Australia", BRA: "Brazil",
  };
  PT.RELATION = {
    ships_to: "ships to", owns: "owns", possibly_same_as: "possibly the same as",
    shares_address: "shares an address with", group_name_match: "name matches group of",
    subsidiary_of: "is a subsidiary of", director_of: "is a director of", risk_adjacent: "is one hop from",
    shareholder_of: "owns a stake in", receives_from: "receives from", supply_agreement: "has a supply agreement with",
    officer_of: "is an officer of",
  };

  PT.confBadge = function (c) {
    const m = PT.CONF[c] || { label: c, help: "" };
    return `<span class="badge c-${PT.esc(c)}" title="${PT.esc(m.help)}">${PT.esc(m.label)}</span>`;
  };
  PT.etypeTag = function (t) {
    const m = PT.ETYPE[t];
    return `<span class="etype ${m.cls}"><span class="line" aria-hidden="true"></span>${PT.esc(m.label)}</span>`;
  };
  PT.scoreBadge = function (s) {
    return `<span class="badge sc-${PT.esc(s)}">${PT.esc(s)}</span>`;
  };
  PT.whyHTML = function (e) {
    return e.confidence_reason ? `<div class="why">Why ${PT.esc((PT.CONF[e.confidence] || {}).label || e.confidence)}: ${PT.esc(e.confidence_reason)} <a href="about.html#confidence">How we rate</a></div>` : "";
  };
  PT.pill = (lbl) => lbl ? `<span class="answer-pill ${PT.esc(String(lbl).replace(/\s+/g, "-"))}">${PT.esc(lbl)}</span>` : "";
  PT.qaHTML = function (c) {
    return `<div class="qa">
      <div class="q"><span class="qa-label">The question</span>${PT.esc(c.question)}</div>
      <div class="a"><span class="qa-label">What we found</span>${PT.pill(c.answer_label)}<div>${PT.esc(c.answer || c.headline)}</div></div>
      <div class="w"><span class="qa-label">Why it matters</span>${PT.esc(c.why_it_matters || "")}</div>
    </div>`;
  };
  PT.checkedHTML = function (c, opts = {}) {
    if (!c.last_checked) return "";
    const ids = (c.checked_call_ids || []).slice(0, opts.n || 4);
    return `<span class="checked" title="The date this case's key facts were last re-run against Sayari">✓ Last checked ${PT.fmtDate(c.last_checked)}${ids.length && !opts.plain ? " " + PT.receipts(ids) : ""}</span>`;
  };
  PT.receipts = function (ids) {
    if (!ids || !ids.length) return "";
    return `<span class="receipts">${ids.map((id) => `<a href="method.html#${PT.esc(id)}" title="Open call ${PT.esc(id)} in the call log">${PT.esc(id)}</a>`).join("")}</span>`;
  };
  PT.fmtDate = function (iso) {
    if (!iso) return "";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  };
  PT.country = (c) => PT.COUNTRY[c] || c;
  PT.edgeSentence = function (e, d) {
    const a = d.entityById.get(e.source), b = d.entityById.get(e.target);
    return `${a ? a.name : e.source} ${PT.RELATION[e.relation] || e.relation} ${b ? b.name : e.target}`;
  };
})(window.PT);
