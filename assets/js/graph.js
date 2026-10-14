/* Paper Trail: Cytoscape + dagre network graph.
   Readability rules: duplicate records (possibly-same-as) merge into one node by default;
   nodes are coloured by role; edge labels appear on hover; line width follows shipment count. */
(function (PT) {
  const C = {
    tx: "#1F5FBF", ct: "#6B3FA0", inf: "#A86A12", ink: "#1A1A1A", ink2: "#4A4A45", ink3: "#6E6D66",
    rule: "#B9B6A8", teal: "#0F5E5C", risk: "#B42318", card: "#FFFFFF", paper: "#FAFAF7",
  };
  const RISKY = /forced_labor|sheffield|uflpa|sanction|export_control|bis_entity/;
  const CONF_RANK = { documented: 4, corroborated: 3, inferred: 2, lead: 1 };

  PT.ROLE_STYLE = {
    parent: { label: "Parent / owner" },
    officer: { label: "Person" },
    trader: { label: "Supplier" },
    transit_plant: { label: "The plant" },
    us_buyer: { label: "US buyer" },
  };

  function shortName(n) {
    return String(n)
      .replace(/,? (Co\.,? )?Ltd\.?$/i, "").replace(/ (Sdn\.? Bhd\.?|Pte\.? Ltd\.?|LLC|Inc\.?|Lda|S\.A\.|\(SASU\))\.?$/i, "")
      .replace(/\s+/g, " ").trim();
  }

  /* Build the (possibly merged) element set for a case. */
  function build(d, caseId, merge) {
    const inCase = (x) => !caseId || (x.case_ids || []).includes(caseId);
    const edges = d.edges.items.filter(inCase);
    const used = new Set(); edges.forEach((e) => { used.add(e.source); used.add(e.target); });
    const nodes = d.entities.items.filter((e) => used.has(e.id));

    // Union-find over possibly_same_as links (not Leads) to merge duplicate records.
    const parent = new Map(nodes.map((n) => [n.id, n.id]));
    const find = (x) => { while (parent.get(x) !== x) x = parent.get(x); return x; };
    if (merge) {
      edges.filter((e) => e.relation === "possibly_same_as" && e.confidence !== "lead")
        .forEach((e) => { const a = find(e.source), b = find(e.target); if (a !== b) parent.set(a, b); });
    }
    const degree = new Map();
    edges.forEach((e) => { degree.set(e.source, (degree.get(e.source) || 0) + 1); degree.set(e.target, (degree.get(e.target) || 0) + 1); });
    const groups = new Map();
    nodes.forEach((n) => { const r = find(n.id); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(n.id); });
    const rep = new Map();
    groups.forEach((ids) => {
      const best = ids.slice().sort((a, b) => (degree.get(b) || 0) - (degree.get(a) || 0) || a.localeCompare(b))[0];
      ids.forEach((id) => rep.set(id, best));
    });

    const nodeEls = [];
    groups.forEach((ids) => {
      const id = rep.get(ids[0]);
      const e = d.entityById.get(id);
      const role = (caseId && e.case_roles && e.case_roles[caseId]) || e.role;
      const flagged = ids.some((x) => (d.entityById.get(x).risk_flags || []).some((f) => RISKY.test(f)));
      const extra = ids.length > 1 ? ` · ${ids.length} records` : "";
      nodeEls.push({
        data: { id, members: ids, label: `${flagged ? "⚑ " : ""}${shortName(e.name)}\n${PT.country(e.country)}${extra}` },
        classes: [role || "contrast", e.type === "person" ? "person" : "", ids.length > 1 ? "merged" : ""].join(" "),
      });
    });

    const edgeMap = new Map();
    const origToEl = new Map();
    edges.forEach((e) => {
      const s = rep.get(e.source), t = rep.get(e.target);
      if (s === t) { origToEl.set(e.id, null); return; } // a link between merged records
      const key = `${s}|${t}|${e.relation}|${e.edge_type}`;
      let m = edgeMap.get(key);
      if (!m) {
        m = { id: e.id, source: s, target: t, etype: e.edge_type, conf: e.confidence, rel: e.relation, ids: [], hs: new Set(), count: 0 };
        edgeMap.set(key, m);
      }
      m.ids.push(e.id);
      (e.hs_codes || []).forEach((h) => m.hs.add(h));
      m.count += e.shipment_count || 0;
      if (CONF_RANK[e.confidence] > CONF_RANK[m.conf]) m.conf = e.confidence;
      origToEl.set(e.id, m.id);
    });
    const edgeEls = [...edgeMap.values()].map((m) => ({
      data: {
        id: m.id, source: m.source, target: m.target, conf: m.conf, ids: m.ids,
        label: m.hs.size ? "HS " + [...m.hs].slice(0, 2).join(", ") : (PT.RELATION[m.rel] || m.rel),
        w: 2 + Math.min(5, Math.log2(1 + m.count) * 1.4),
      },
      classes: `${PT.ETYPE[m.etype].cls} conf-${m.conf}`,
    }));
    return { els: nodeEls.concat(edgeEls), rep, origToEl };
  }

  const STYLE = [
    { selector: "node", style: {
      shape: "round-rectangle", "background-color": "#F2F1EB", "border-width": 1.5, "border-color": C.rule,
      label: "data(label)", "text-wrap": "wrap", "text-max-width": 165, "font-family": "IBM Plex Sans, system-ui, sans-serif",
      "font-size": 13, "line-height": 1.25, color: C.ink, "text-valign": "center", "text-halign": "center",
      width: 185, height: "label", padding: "11px",
    } },
    { selector: "node.parent", style: { "background-color": "#EFE7F8", "border-color": C.ct, "border-width": 2.5, "font-weight": 600 } },
    { selector: "node.person", style: { shape: "round-rectangle", "background-color": "#FFFFFF", "border-color": C.ct, "border-style": "dashed", "font-size": 12, width: 160 } },
    { selector: "node.transit_plant", style: { "background-color": C.teal, "border-color": C.teal, color: "#FFFFFF", "font-weight": 700, "font-size": 14, width: 205 } },
    { selector: "node.us_buyer", style: { "background-color": "#FFFFFF", "border-color": C.ink, "border-width": 2 } },
    { selector: "node.buyer", style: { "background-color": "#FFFFFF", "border-color": C.ink3 } },
    { selector: "node.contrast", style: { "background-color": "#FFFFFF", "border-style": "dashed", color: C.ink2 } },
    { selector: "node.merged", style: { "border-width": 4, "border-style": "double" } },
    { selector: "edge", style: {
      width: "data(w)", "curve-style": "bezier", "target-arrow-shape": "triangle", "arrow-scale": 1.1,
      "font-family": "IBM Plex Mono, monospace", "font-size": 11, label: "", color: C.ink,
      "text-background-color": "#FFFFFF", "text-background-opacity": 1, "text-background-padding": 3,
      "text-background-shape": "round-rectangle", opacity: 0.8,
    } },
    { selector: "edge.tx", style: { "line-color": C.tx, "target-arrow-color": C.tx } },
    { selector: "edge.ct", style: { "line-color": C.ct, "target-arrow-color": C.ct, "line-style": "dashed", "line-dash-pattern": [9, 5] } },
    { selector: "edge.inf", style: { "line-color": C.inf, "target-arrow-color": C.inf, "line-style": "dotted", "target-arrow-shape": "none" } },
    { selector: "edge.conf-lead", style: { opacity: 0.4 } },
    { selector: "edge.labelled", style: { label: "data(label)" } },
    { selector: ".faded", style: { opacity: 0.08, "text-opacity": 0.12 } },
    { selector: "edge.hl", style: { opacity: 1, label: "data(label)", "z-index": 10 } },
    { selector: "node.hl", style: { opacity: 1, "z-index": 10 } },
    { selector: "node:selected", style: { "border-color": "#E0A100", "border-width": 4 } },
    { selector: "edge:selected", style: { "line-color": "#E0A100", "target-arrow-color": "#E0A100", opacity: 1, label: "data(label)" } },
    { selector: ".hidden", style: { display: "none" } },
  ];

  PT.Graph = function (container, d, opts = {}) {
    if (typeof cytoscape === "undefined") {
      container.innerHTML = `<p class="graph-fallback">The graph library didn't load. The list view shows the same links.</p>`;
      return null;
    }
    if (typeof cytoscapeDagre !== "undefined" && !PT._dagreReg) { cytoscape.use(cytoscapeDagre); PT._dagreReg = true; }
    let merge = opts.merge !== false;
    let caseId = opts.caseId;
    let built = build(d, caseId, merge);
    const cy = cytoscape({
      container, elements: built.els, style: STYLE,
      wheelSensitivity: 0.2, minZoom: 0.2, maxZoom: 2.5, boxSelectionEnabled: false,
    });
    const layout = () => cy.layout({ name: "dagre", rankDir: "LR", nodeSep: 24, rankSep: 120, edgeSep: 12, padding: 30, animate: false }).run();
    const MIN = opts.minZoom || 0.75;
    function fitReadable() {
      cy.fit(cy.elements().not(".hidden"), 30);
      if (cy.zoom() < MIN) {
        const plant = cy.nodes(".transit_plant").sort((a, b) => b.degree() - a.degree())[0] || cy.nodes().max((n) => n.degree()).ele;
        cy.zoom(MIN);
        if (plant) cy.center(plant);
      }
    }
    layout();
    fitReadable();

    // Hover: tooltip + neighbourhood focus.
    const frame = container.parentElement;
    const tip = document.createElement("div");
    tip.className = "graph-tip"; tip.hidden = true;
    frame.appendChild(tip);
    const tipText = (el) => {
      if (el.isNode()) {
        const e = d.entityById.get(el.id());
        const n = el.data("members").length;
        return `<strong>${PT.esc(e.name)}</strong><br>${PT.esc(PT.ROLE[e.role] || e.role || "")} · ${PT.esc(PT.country(e.country))}${n > 1 ? `<br>${n} Sayari records merged` : ""}<br><span class="muted">Click for details</span>`;
      }
      const ids = el.data("ids");
      const e = d.edgeById.get(ids[0]);
      return `<strong>${PT.esc(PT.edgeSentence(e, d))}</strong>${ids.length > 1 ? ` <span class="muted">(+${ids.length - 1} more)</span>` : ""}<br>${PT.esc((PT.ETYPE[e.edge_type] || {}).label)} · ${PT.esc((PT.CONF[el.data("conf")] || {}).label)}${(e.hs_codes || []).length ? ` · ${PT.esc(el.data("label"))}` : ""}`;
    };
    let locked = false;
    cy.on("mouseover", "node, edge", (ev) => {
      const el = ev.target;
      tip.innerHTML = tipText(el); tip.hidden = false;
      if (locked) return;
      const nb = el.isNode() ? el.closedNeighborhood() : el.union(el.connectedNodes());
      cy.elements().addClass("faded"); nb.removeClass("faded").addClass("hl");
    });
    cy.on("mouseout", "node, edge", () => {
      tip.hidden = true;
      if (locked) return;
      cy.elements().removeClass("faded hl");
    });
    cy.on("mousemove", (ev) => {
      if (tip.hidden) return;
      const p = ev.renderedPosition || { x: 0, y: 0 };
      tip.style.left = Math.max(4, Math.min(p.x + 14, container.clientWidth - 270)) + "px";
      tip.style.top = (p.y + 16) + "px";
    });

    if (opts.onSelect) {
      cy.on("tap", "node", (ev) => opts.onSelect({ kind: "node", id: ev.target.id(), members: ev.target.data("members") }));
      cy.on("tap", "edge", (ev) => opts.onSelect({ kind: "edge", id: ev.target.data("ids")[0], ids: ev.target.data("ids") }));
      cy.on("tap", (ev) => { if (ev.target === cy) opts.onSelect(null); });
    }

    const elOfEdge = (id) => { const m = built.origToEl.get(id); return m ? cy.getElementById(m) : cy.collection(); };
    const elOfNode = (id) => cy.getElementById(built.rep.get(id) || id);

    const api = {
      cy,
      get merged() { return merge; },
      setCase(id) { caseId = id; api.rebuild(); },
      setMerge(on) { merge = on; api.rebuild(); },
      rebuild() {
        built = build(d, caseId, merge);
        locked = false;
        cy.elements().remove(); cy.add(built.els); layout(); fitReadable();
      },
      relayout() { layout(); api.fit(); },
      fit() { cy.animate({ fit: { eles: cy.elements().not(".hidden"), padding: 30 } }, { duration: 300 }); },
      zoom(f) { cy.animate({ zoom: { level: cy.zoom() * f, renderedPosition: { x: container.clientWidth / 2, y: container.clientHeight / 2 } } }, { duration: 200 }); },
      reset() { locked = false; cy.elements().removeClass("faded hl"); fitReadable(); },
      fitAll() { cy.animate({ fit: { eles: cy.elements().not(".hidden"), padding: 30 } }, { duration: 300 }); },
      highlight(edgeIds = [], nodeIds = []) {
        cy.elements().removeClass("hl faded");
        if (!edgeIds.length && !nodeIds.length) { locked = false; cy.fit(undefined, 30); return; }
        let sel = cy.collection();
        edgeIds.forEach((id) => { const e = elOfEdge(id); if (e.nonempty()) sel = sel.union(e).union(e.connectedNodes()); });
        nodeIds.forEach((id) => { const n = elOfNode(id); if (n.nonempty()) sel = sel.union(n); });
        if (sel.empty()) { locked = false; return; }
        locked = true;
        cy.elements().addClass("faded");
        sel.removeClass("faded").addClass("hl");
        cy.animate({ fit: { eles: sel, padding: 60 } }, { duration: 450 });
      },
      showLabels(on) { cy.edges().toggleClass("labelled", !!on); },
      filter(edgePred, nodePred) {
        const keepNodes = new Set(), keepEdges = new Set();
        cy.edges().forEach((el) => {
          const ok = el.data("ids").some((id) => edgePred(d.edgeById.get(id)));
          const s = d.entityById.get(el.data("source")), t = d.entityById.get(el.data("target"));
          if (ok && nodePred(s) && nodePred(t)) { keepEdges.add(el.id()); keepNodes.add(el.data("source")); keepNodes.add(el.data("target")); }
        });
        cy.batch(() => {
          cy.edges().forEach((e) => e.toggleClass("hidden", !keepEdges.has(e.id())));
          cy.nodes().forEach((n) => n.toggleClass("hidden", !keepNodes.has(n.id())));
        });
        if (keepEdges.size) cy.fit(cy.elements().not(".hidden"), 30);
      },
      select(id) {
        cy.elements().unselect();
        const el = d.edgeById.has(id) ? elOfEdge(id) : elOfNode(id);
        if (el && el.nonempty()) { el.select(); cy.animate({ center: { eles: el }, zoom: Math.max(cy.zoom(), 0.9) }, { duration: 300 }); }
      },
    };
    window.addEventListener("resize", () => cy.resize());
    return api;
  };

  /* Controls + legend overlay, shared by Home, Explore and Case Files. */
  PT.graphChrome = function (frame, api, opts = {}) {
    if (!api) return;
    const roles = ["parent", "officer", "trader", "transit_plant", "us_buyer"];
    frame.insertAdjacentHTML("beforeend", `
      <div class="graph-tools" role="toolbar" aria-label="Graph controls">
        <button type="button" data-z="1.25" title="Zoom in" aria-label="Zoom in">+</button>
        <button type="button" data-z="0.8" title="Zoom out" aria-label="Zoom out">−</button>
        <button type="button" data-fit title="Show the whole network" aria-label="Show the whole network">⤢</button>
      </div>`);
    frame.insertAdjacentHTML("afterend", `
      <div class="graph-key" aria-hidden="true">
        ${roles.map((r) => `<span class="lg-node lg-${r}">${PT.ROLE_STYLE[r].label}</span>`).join("")}
        <span class="lg-node lg-merged">Merged records</span>
        <span class="etype tx"><span class="line"></span>Shipment</span>
        <span class="etype ct"><span class="line"></span>Ownership</span>
        <span class="etype inf"><span class="line"></span>Inferred</span>
        <span class="muted">Thicker blue line = more shipments · ⚑ risk flag · hover to focus · drag to pan · ⤢ shows everything</span>
      </div>`);
    frame.querySelectorAll("[data-z]").forEach((b) => b.addEventListener("click", () => api.zoom(+b.dataset.z)));
    frame.querySelector("[data-fit]").addEventListener("click", () => api.fitAll());
    if (opts.toggles) {
      const bar = document.createElement("div");
      bar.className = "graph-toggles";
      bar.innerHTML = `
        <label><input type="checkbox" data-merge ${api.merged ? "checked" : ""}> Merge duplicate records of the same company</label>
        <label><input type="checkbox" data-labels> Show product codes on lines</label>`;
      frame.parentElement.insertBefore(bar, frame);
      bar.querySelector("[data-merge]").addEventListener("change", (e) => { api.setMerge(e.target.checked); if (opts.onRebuild) opts.onRebuild(); });
      bar.querySelector("[data-labels]").addEventListener("change", (e) => api.showLabels(e.target.checked));
    }
  };

  /* Text list of edges: same data as the graph, for phones and screen readers. */
  PT.edgeListHTML = function (d, edges) {
    return `<ul class="edge-list">${edges.map((e) => `
      <li class="${PT.ETYPE[e.edge_type].cls}" id="edge-${e.id}">
        <div class="edge-head">${PT.etypeTag(e.edge_type)} ${PT.confBadge(e.confidence)} ${(e.hs_codes || []).map((h) => `<span class="hs">HS ${PT.esc(h)}</span>`).join(" ")}</div>
        <div><strong>${PT.esc(PT.edgeSentence(e, d))}</strong></div>
        ${e.first_seen ? `<div class="muted">${PT.fmtDate(e.first_seen)}${e.last_seen && e.last_seen !== e.first_seen ? ` – ${PT.fmtDate(e.last_seen)}` : ""}${e.shipment_count ? ` · ${e.shipment_count} shipment row${e.shipment_count > 1 ? "s" : ""}` : ""}</div>` : ""}
        <div>${PT.esc(e.evidence)}</div>
        ${PT.whyHTML(e)}
        <div>How we know: ${PT.receipts(e.source_call_ids)}</div>
      </li>`).join("")}</ul>`;
  };
})(window.PT);
