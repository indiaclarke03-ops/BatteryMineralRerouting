/* Paper Trail: Explore page (filters, side panel, list view). */
(function (PT) {
  const RISKY = /forced_labor|sheffield|uflpa|sanction|export_control|bis_entity/;

  function nodePanel(d, e) {
    const edges = d.edges.items.filter((x) => x.source === e.id || x.target === e.id);
    const ids = Object.entries(e.identifiers || {}).map(([k, v]) => `<dt>${PT.esc(k.toUpperCase())}</dt><dd class="id">${PT.esc(v)}</dd>`).join("");
    return `
      <span class="eyebrow">${PT.esc(PT.ROLE[e.role] || e.role)}</span>
      <h3>${PT.esc(e.name)}</h3>
      <p>${PT.esc(e.summary)}</p>
      <dl>
        <dt>Country</dt><dd>${PT.esc(PT.country(e.country))}</dd>
        ${ids}
        <dt>Sayari ID</dt><dd class="id"><a href="${PT.esc(e.sayari_url)}" rel="noopener">${PT.esc(e.id)}</a></dd>
        <dt>Links</dt><dd>${edges.length}</dd>
      </dl>
      ${e.risk_flags.length ? `<div><strong>Sayari risk flags</strong> <small class="muted">(context; most describe neighbours, not this entity. See <a href="about.html#flags">how to read flags</a>)</small><div class="flags">${e.risk_flags.map((f) => `<span class="flag-chip">${RISKY.test(f) ? "⚑ " : ""}${PT.esc(f)}</span>`).join("")}</div></div>` : `<p class="muted">No risk flags beyond country indices.</p>`}
      <p><strong>How we know:</strong> ${PT.receipts(e.source_call_ids)}</p>
      <ul>${edges.map((x) => `<li><a href="#edge-${x.id}" data-edge="${x.id}">${PT.esc(PT.edgeSentence(x, d))}</a></li>`).join("")}</ul>`;
  }

  function edgePanel(d, e) {
    return `
      <span class="eyebrow">Link ${PT.esc(e.id)}</span>
      <h3>${PT.esc(PT.edgeSentence(e, d))}</h3>
      <div class="case-meta">${PT.etypeTag(e.edge_type)} ${PT.confBadge(e.confidence)}</div>
      <p>${PT.esc(e.evidence)}</p>
      <dl>
        ${e.hs_codes.length ? `<dt>HS codes</dt><dd>${e.hs_codes.map((h) => `<span class="hs">${PT.esc(h)}</span>`).join(" ")}</dd>` : ""}
        ${e.first_seen ? `<dt>Dates</dt><dd>${PT.fmtDate(e.first_seen)}${e.last_seen && e.last_seen !== e.first_seen ? ` – ${PT.fmtDate(e.last_seen)}` : ""}</dd>` : ""}
        ${e.shipment_count ? `<dt>Rows</dt><dd>${e.shipment_count}</dd>` : ""}
      </dl>
      <p><strong>How we know:</strong> ${PT.receipts(e.source_call_ids)}</p>`;
  }

  async function init() {
    const panel = document.getElementById("panel");
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(panel, e); return; }

    const countries = [...new Set(d.entities.items.map((e) => e.country))].sort((a, b) => PT.country(a).localeCompare(PT.country(b)));
    const sel = document.getElementById("f-country");
    sel.insertAdjacentHTML("beforeend", countries.map((c) => `<option value="${c}">${PT.esc(PT.country(c))}</option>`).join(""));

    const graph = PT.Graph(document.getElementById("graph"), d, {
      onSelect(s) {
        if (!s) { panel.innerHTML = `<h3>Select something</h3><p class="muted">Click a company or a link in the graph.</p>`; return; }
        panel.innerHTML = s.kind === "node" ? nodePanel(d, d.entityById.get(s.id)) : edgePanel(d, d.edgeById.get(s.id));
      },
    });
    if (graph) document.querySelector("#graph").insertAdjacentHTML("afterend", PT.graphLegendHTML());

    panel.addEventListener("click", (ev) => {
      const a = ev.target.closest("[data-edge]");
      if (a && graph) { ev.preventDefault(); graph.select(a.dataset.edge); panel.innerHTML = edgePanel(d, d.edgeById.get(a.dataset.edge)); }
    });

    const form = document.getElementById("filters");
    function apply() {
      const fd = new FormData(form);
      const etypes = new Set(fd.getAll("etype"));
      const confs = new Set(fd.getAll("conf"));
      const country = fd.get("country");
      const hs = fd.get("hs");
      const risk = document.getElementById("f-risk").checked;
      const flagged = (id) => { const e = d.entityById.get(id); return e && e.risk_flags.some((f) => RISKY.test(f)); };
      const edgePred = (e) =>
        etypes.has(e.edge_type) && confs.has(e.confidence) &&
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
    document.getElementById("g-fit").addEventListener("click", () => graph && graph.fit());
    document.getElementById("g-layout").addEventListener("click", () => graph && graph.relayout());
    apply();

    // Deep link: explore.html#<entity or edge id>
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && graph) {
      if (d.entityById.has(h)) { graph.select(h); panel.innerHTML = nodePanel(d, d.entityById.get(h)); }
      else if (d.edgeById.has(h)) { graph.select(h); panel.innerHTML = edgePanel(d, d.edgeById.get(h)); }
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
