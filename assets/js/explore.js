/* Paper Trail: Explore page (filters, side panel, list view). */
(function (PT) {
  const RISKY = /forced_labor|sheffield|uflpa|sanction|export_control|bis_entity/;

  async function init() {
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(document.getElementById("edge-list"), e); return; }
    const qc0 = new URLSearchParams(location.search).get("case");
    const startCase = qc0 && d.caseById.has(qc0) ? qc0 : d.cases.items[0].id;

    const countries = [...new Set(d.entities.items.map((e) => e.country))].sort((a, b) => PT.country(a).localeCompare(PT.country(b)));
    const csel = document.getElementById("f-case");
    csel.insertAdjacentHTML("beforeend", d.cases.items.map((c, i) => `<option value="${c.id}">${i + 1}. ${PT.esc(c.title)}</option>`).join(""));
    csel.value = startCase;
    csel.addEventListener("change", () => { if (graph) graph.setCase(csel.value || undefined); });
    const sel = document.getElementById("f-country");
    sel.insertAdjacentHTML("beforeend", countries.map((c) => `<option value="${c}">${PT.esc(PT.country(c))}</option>`).join(""));

    const graph = PT.Graph(document.getElementById("graph"), d, { caseId: startCase });
    PT.graphChrome(document.querySelector("#graph").parentElement, graph, { toggles: true, onRebuild: () => apply() });



    const form = document.getElementById("filters");
    function apply() {
      const fd = new FormData(form);
      const etypes = new Set(fd.getAll("etype"));
      const confs = new Set(fd.getAll("conf"));
      const country = fd.get("country");
      const kase = fd.get("case");
      const hs = fd.get("hs");
      const risk = document.getElementById("f-risk").checked;
      const flagged = (id) => { const e = d.entityById.get(id); return e && e.risk_flags.some((f) => RISKY.test(f)); };
      const edgePred = (e) =>
        etypes.has(e.edge_type) && confs.has(e.confidence) &&
        (!kase || e.case_ids.includes(kase)) &&
        (!hs || e.hs_codes.some((h) => h.startsWith(hs))) &&
        (!country || d.entityById.get(e.source).country === country || d.entityById.get(e.target).country === country) &&
        (!risk || flagged(e.source) || flagged(e.target));
      const nodePred = () => true;
      const visible = d.edges.items.filter(edgePred);
      if (graph) graph.filter(edgePred, nodePred);
      document.getElementById("edge-list").innerHTML = visible.length ? PT.edgeListHTML(d, visible) : `<p class="muted">No links match these filters.</p>`;
      document.getElementById("f-count").textContent = `${visible.length} of ${d.edges.items.length} links shown`;
    }
    form.addEventListener("change", apply);
    form.addEventListener("reset", () => setTimeout(() => { apply(); if (graph) graph.fit(); }, 0));
    apply();

    // Deep link: explore.html#<entity or edge id>
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && graph && (d.entityById.has(h) || d.edgeById.has(h))) graph.showDetails(h);
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
