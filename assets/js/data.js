/* Paper Trail: data loading and shared formatting helpers. */
window.PT = window.PT || {};

(function (PT) {
  const FILES = ["entities", "edges", "cases", "call_log", "policy_timeline", "sources"];

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
    PT._data = d;
    return d;
  };

  PT.esc = function (s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };

  PT.CONF = {
    documented: { label: "Documented", help: "Sayari returned dated, HS-coded shipment rows or a registry record for this link." },
    corroborated: { label: "Corroborated", help: "Seen in Sayari's graph and supported by a second, independent signal (another tool or an open source)." },
    inferred: { label: "Inferred", help: "Our judgment from matching attributes (address, name, shared buyer). Not stated in any record." },
    lead: { label: "Lead", help: "A single weak signal. Needs checking before anyone relies on it." },
  };
  PT.ETYPE = {
    transactional: { label: "Transactional", cls: "tx", help: "Goods moved: a customs or bill-of-lading record with HS code and dates." },
    contractual: { label: "Contractual / corporate", cls: "ct", help: "A registry or filing link: owns, subsidiary of, director of." },
    inferred: { label: "Inferred", cls: "inf", help: "Derived rather than stated: possibly-same-as matches, shared addresses, risk adjacency." },
  };
  PT.ROLE = {
    parent: "Chinese parent / producer",
    trader: "Trader",
    producer: "Raw-material producer",
    transit_plant: "Third-country plant",
    us_buyer: "US buyer",
    contrast: "Registry contrast",
  };
  PT.COUNTRY = {
    CHN: "China", IDN: "Indonesia", USA: "United States", MOZ: "Mozambique", MDG: "Madagascar",
    ARE: "United Arab Emirates", KOR: "South Korea", MAR: "Morocco",
  };
  PT.RELATION = {
    ships_to: "ships to", owns: "owns", possibly_same_as: "possibly the same as",
    shares_address: "shares an address with", group_name_match: "name matches group of",
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
