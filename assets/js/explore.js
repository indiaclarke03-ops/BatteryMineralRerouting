/* Paper Trail | Minerals: Explore page (case picker, highlights, side panel, list view). */
(function (PT) {
  async function init() {
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(document.getElementById("edge-list"), e); return; }
    const qc0 = new URLSearchParams(location.search).get("case");
    const h0 = decodeURIComponent(location.hash.slice(1));
    const hashCase = (d.entityById.get(h0) || d.edgeById.get(h0) || {}).case_ids;
    let kase = qc0 && d.caseById.has(qc0) ? qc0 : (hashCase && hashCase[0]) || d.cases.items[0].id;

    const countries = [...new Set(d.entities.items.map((e) => e.country))].sort((a, b) => PT.country(a).localeCompare(PT.country(b)));
    const tabs = document.getElementById("ex-tabs");
    tabs.innerHTML = d.cases.items.map((c, i) => `<button type="button" role="tab" data-case="${c.id}"><span>${i + 1}</span>${PT.esc(c.title)}</button>`).join("")
      + `<button type="button" role="tab" data-case=""><span>∗</span>All cases</button>`;
    function showCase(id) {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.case === id)));
      history.replaceState(null, "", id ? `?case=${id}${location.hash}` : location.pathname);
    }
    const caseHTML = (id) => {
      const c = d.caseById.get(id);
      return c ? `<div class="ep-case"><div class="exc-q"><span class="qa-label">The question</span>${PT.esc(c.question)}</div>
        <div class="exc-a"><span class="qa-label">What we found</span>${PT.pill(c.answer_label)} ${PT.esc(c.answer_short || c.answer)} <a href="cases.html#${c.id}">Full case →</a><div style="margin-top:6px">${PT.checkedHTML(c, { plain: true })}</div></div></div>`
        : `<div class="ep-case"><div>All ${d.cases.items.length} cases in one network: dense, but it shows the companies that appear in several cases, such as BTR, GM and Tesla.</div></div>`;
    };
    showCase(kase);
    const sel = document.getElementById("f-country");
    sel.insertAdjacentHTML("beforeend", countries.map((c) => `<option value="${c}">${PT.esc(PT.country(c))}</option>`).join(""));

    const panel = document.getElementById("ex-panel");
    const graph = PT.Graph(document.getElementById("graph"), d, {
      caseId: kase || undefined, panel, fitAll: true, flow: true, chain: true, onClear: () => overview(),
    });
    PT.graphChrome(document.querySelector("#graph").parentElement, graph, { toggles: true, toggleHost: document.getElementById("ex-view"), onRebuild: () => { apply(); overview(); } });

    /* Default side panel: what's in this view, and every company as a clickable list. */
    function overview() {
      if (!graph) return;
      const groups = graph.lanes();
      const rows = groups.flatMap((g) => g.rows);
      const flagged = rows.filter((r) => r.flagged).length;
      const links = graph.cy.edges().filter((e) => !e.hasClass("hidden")).length;
      document.getElementById("risk-n").textContent = flagged;
      panel.innerHTML = `${caseHTML(kase)}
        <span class="eyebrow">In this view</span>
        <div class="ep-stats">
          <div><b>${rows.length}</b><span>companies and people</span></div>
          <div><b>${links}</b><span>links</span></div>
          <div><b>${flagged}</b><span>with a ⚑ risk flag</span></div>
        </div>
        <p class="ep-hint">Click a company or a line. Its whole chain lights up, and the evidence appears here.</p>
        ${groups.map((g) => `<h3 class="ep-h">${PT.esc(g.title)} <span class="muted">${g.rows.length}</span></h3>
          <ul class="ep-list">${g.rows.map((r) => `<li><button type="button" data-node="${PT.esc(r.id)}">${r.flagged ? `<span class="ep-flag" title="Has a Sayari risk flag">⚑</span>` : ""}<span>${PT.esc(r.name)}</span><small>${PT.esc(PT.country(r.country))}</small></button></li>`).join("")}</ul>`).join("")}`;
      panel.scrollTop = 0;
    }
    panel.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-node]");
      if (b && graph) graph.showDetails(b.dataset.node);
    });

    const form = document.getElementById("filters");
    function apply() {
      const fd = new FormData(form);
      const etypes = new Set(fd.getAll("etype"));
      const confs = new Set(fd.getAll("conf"));
      const country = fd.get("country");
      const hs = fd.get("hs");
      const risk = document.getElementById("f-risk").checked;
      const hsHit = (e) => e.hs_codes.some((h) => h.startsWith(hs));
      // "Show" settings remove links; "Highlight" settings only pick out companies.
      const edgePred = (e) => etypes.has(e.edge_type) && confs.has(e.confidence) && (!kase || e.case_ids.includes(kase));
      const visible = d.edges.items.filter(edgePred);
      let hit = null, listed = visible;
      if (graph) {
        graph.filter(edgePred, () => true);
        const edgeHas = (el) => el.data("ids").some((id) => hsHit(d.edgeById.get(id)));
        const on = risk || country || hs;
        hit = on ? graph.spotlight({
          risk,
          edge: hs ? edgeHas : null,
          node: (n) => (!risk || n.data("flagged"))
            && (!country || n.data("members").some((m) => d.entityById.get(m).country === country))
            && (!hs || n.connectedEdges().some(edgeHas)),
        }) : (graph.spotlight(null), null);
      }
      if (risk || country || hs) {
        const flagged = (id) => { const e = d.entityById.get(id); return e && e.risk_flags.some((f) => PT.RISKY.test(f)); };
        listed = visible.filter((e) => (!hs || hsHit(e))
          && (!country || d.entityById.get(e.source).country === country || d.entityById.get(e.target).country === country)
          && (!risk || flagged(e.source) || flagged(e.target)));
      }
      document.getElementById("edge-list").innerHTML = listed.length ? PT.edgeListHTML(d, listed) : `<p class="muted">No links match these settings.</p>`;
      document.getElementById("f-count").textContent = hit === null ? "" : `${hit} highlighted`;
      document.getElementById("list-count").textContent = `${listed.length} of ${d.edges.items.length} links`;
      document.getElementById("risk-note").hidden = !risk;
    }

    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      kase = b.dataset.case; showCase(kase);
      if (graph) graph.setCase(kase || undefined);
      apply(); overview();
    });
    form.addEventListener("change", apply);
    form.addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("reset", () => setTimeout(() => { apply(); if (graph) { graph.clearFocus(); graph.fit(); } }, 0));
    apply(); overview();

    // Deep link: explore.html#<entity or edge id>
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && graph && (d.entityById.has(h) || d.edgeById.has(h))) graph.showDetails(h);
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
