/* Paper Trail: Explore page (filters, side panel, list view). */
(function (PT) {
  const RISKY = /forced_labor|sheffield|uflpa|sanction|export_control|bis_entity/;

  async function init() {
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(document.getElementById("edge-list"), e); return; }
    const qc0 = new URLSearchParams(location.search).get("case");
    const h0 = decodeURIComponent(location.hash.slice(1));
    const hashCase = (d.entityById.get(h0) || d.edgeById.get(h0) || {}).case_ids;
    const startCase = qc0 && d.caseById.has(qc0) ? qc0 : (hashCase && hashCase[0]) || d.cases.items[0].id;

    const countries = [...new Set(d.entities.items.map((e) => e.country))].sort((a, b) => PT.country(a).localeCompare(PT.country(b)));
    const csel = document.getElementById("f-case");
    csel.insertAdjacentHTML("beforeend", d.cases.items.map((c, i) => `<option value="${c.id}">${i + 1}. ${PT.esc(c.title)}</option>`).join(""));
    csel.value = startCase;
    const tabs = document.getElementById("ex-tabs");
    tabs.innerHTML = d.cases.items.map((c, i) => `<button type="button" role="tab" data-case="${c.id}"><span>${i + 1}</span>${PT.esc(c.title)}</button>`).join("")
      + `<button type="button" role="tab" data-case=""><span>∗</span>All cases</button>`;
    const caseBox = document.getElementById("ex-case");
    function showCase(id) {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.case === id)));
      const c = d.caseById.get(id);
      caseBox.innerHTML = c ? `<div class="exc-q"><span class="qa-label">The question</span>${PT.esc(c.question)}</div>
        <div class="exc-a"><span class="qa-label">What we found</span>${PT.pill(c.answer_label)} ${PT.esc(c.answer_short || c.answer)} <a href="cases.html#${c.id}">Full case →</a></div>`
        : `<div class="exc-a">All ${d.cases.items.length} cases in one network: dense, but it shows the companies that appear in several cases, such as BTR, GM and Tesla.</div>`;
      history.replaceState(null, "", id ? `?case=${id}${location.hash}` : location.pathname);
    }
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      csel.value = b.dataset.case; showCase(b.dataset.case);
      if (graph) graph.setCase(b.dataset.case || undefined);
      csel.dispatchEvent(new Event("change", { bubbles: true }));
    });
    showCase(startCase);
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
