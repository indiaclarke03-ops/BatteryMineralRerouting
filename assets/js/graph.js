/* Paper Trail: Cytoscape + dagre network graph. */
(function (PT) {
  const C = {
    tx: "#1F5FBF", ct: "#6B3FA0", inf: "#A86A12", ink: "#1A1A1A", ink3: "#6E6D66",
    rule: "#B9B6A8", teal: "#0F5E5C", risk: "#B42318", card: "#FFFFFF", paper: "#FAFAF7",
  };
  const RISKY = /forced_labor|sheffield|uflpa|sanction|export_control|bis_entity/;

  function shortName(n) {
    return n.replace(/,? (Co\.,? )?Ltd\.?$/i, "").replace(/ Co\.$/i, "").replace(/, LLC$/i, "").replace(/, Inc\.$/i, "")
      .replace(/^PT /, "PT ").replace(/ \(record (\d)\)/, " · rec. $1");
  }

  function elements(d, caseId) {
    const inCase = (x) => !caseId || (x.case_ids || []).includes(caseId);
    const edgesIn = d.edges.items.filter(inCase);
    const used = new Set(); edgesIn.forEach((e) => { used.add(e.source); used.add(e.target); });
    const nodes = d.entities.items.filter((e) => !caseId || used.has(e.id) || inCase(e)).map((e) => ({
      data: {
        id: e.id,
        label: `${e.risk_flags.some((f) => RISKY.test(f)) ? "⚑ " : ""}${shortName(e.name)}\n${PT.country(e.country)}`,
        role: e.role, country: e.country,
      },
      classes: [e.role, e.risk_flags.some((f) => RISKY.test(f)) ? "flagged" : ""].join(" "),
    }));
    const edges = edgesIn.map((e) => ({
      data: {
        id: e.id, source: e.source, target: e.target, etype: e.edge_type, conf: e.confidence,
        label: e.hs_codes.length ? e.hs_codes[0] : (e.relation === "possibly_same_as" ? "same as?" : e.relation === "owns" ? "owns" : ""),
      },
      classes: `${PT.ETYPE[e.edge_type].cls} conf-${e.confidence}`,
    }));
    return nodes.concat(edges);
  }

  const STYLE = [
    { selector: "node", style: {
      shape: "round-rectangle", "background-color": C.card, "border-width": 1.5, "border-color": C.rule,
      label: "data(label)", "text-wrap": "wrap", "text-max-width": 170, "font-family": "IBM Plex Sans, system-ui, sans-serif",
      "font-size": 13, color: C.ink, "text-valign": "center", "text-halign": "center",
      width: "label", height: "label", padding: "9px",
    } },
    { selector: "node.transit_plant", style: { "border-color": C.teal, "border-width": 2, "background-color": "#E3EFEE" } },
    { selector: `node[id = "2omCekb1pDRKjhFOAqCNSw"]`, style: { "border-width": 3.5, "font-weight": 700, "font-size": 14 } },
    { selector: "node.us_buyer", style: { "border-color": C.ink, "border-width": 1.5 } },
    { selector: "node.parent", style: { "border-color": C.ct, "border-width": 2.5, "font-weight": 600 } },
    { selector: "node.contrast", style: { "border-style": "dashed", color: C.ink3 } },
    { selector: "node.flagged", style: { color: C.ink } },
    { selector: "edge", style: {
      width: 2.2, "curve-style": "bezier", "target-arrow-shape": "triangle", "arrow-scale": 0.9,
      "font-family": "IBM Plex Mono, monospace", "font-size": 10, label: "data(label)", color: C.ink3,
      "text-background-color": C.paper, "text-background-opacity": 0.9, "text-background-padding": 2,
      "text-rotation": "autorotate",
    } },
    { selector: "edge.tx", style: { "line-color": C.tx, "target-arrow-color": C.tx, "line-style": "solid" } },
    { selector: "edge.ct", style: { "line-color": C.ct, "target-arrow-color": C.ct, "line-style": "dashed", "line-dash-pattern": [8, 4], width: 2.6 } },
    { selector: "edge.inf", style: { "line-color": C.inf, "target-arrow-color": C.inf, "line-style": "dotted", width: 2.8, "target-arrow-shape": "none" } },
    { selector: "edge.conf-lead", style: { opacity: 0.55, width: 1.5 } },
    { selector: ".faded", style: { opacity: 0.1, "text-opacity": 0.15 } },
    { selector: "edge.hl", style: { width: 4.5, opacity: 1, "z-index": 10 } },
    { selector: "node.hl", style: { "border-width": 3, opacity: 1, "z-index": 10 } },
    { selector: ":selected", style: { "overlay-color": "#FFD166", "overlay-opacity": 0.35, "overlay-padding": 6 } },
    { selector: ".hidden", style: { display: "none" } },
  ];

  PT.Graph = function (container, d, opts = {}) {
    if (typeof cytoscape === "undefined") {
      container.innerHTML = `<p class="graph-fallback">The graph library didn't load. The list view below shows the same links.</p>`;
      return null;
    }
    if (typeof cytoscapeDagre !== "undefined") cytoscape.use(cytoscapeDagre);
    const cy = cytoscape({
      container, elements: elements(d, opts.caseId), style: STYLE,
      wheelSensitivity: 0.25, minZoom: 0.25, maxZoom: 2.5, boxSelectionEnabled: false,
      autoungrabify: !!opts.locked,
    });
    const layout = () => cy.layout({ name: "dagre", rankDir: "LR", nodeSep: 18, rankSep: 70, edgeSep: 8, padding: 24, animate: false }).run();
    layout();

    if (opts.onSelect) {
      cy.on("tap", "node", (ev) => opts.onSelect({ kind: "node", id: ev.target.id() }));
      cy.on("tap", "edge", (ev) => opts.onSelect({ kind: "edge", id: ev.target.id() }));
      cy.on("tap", (ev) => { if (ev.target === cy) opts.onSelect(null); });
    }

    const api = {
      cy,
      setCase(caseId) {
        cy.elements().remove(); cy.add(elements(d, caseId)); layout(); cy.fit(undefined, 24);
      },
      relayout() { layout(); cy.fit(cy.elements().not(".hidden"), 24); },
      fit() { cy.fit(cy.elements().not(".hidden"), 24); },
      reset() { cy.elements().removeClass("faded hl"); cy.fit(undefined, 24); },
      highlight(edgeIds = [], nodeIds = []) {
        cy.elements().removeClass("hl");
        if (!edgeIds.length && !nodeIds.length) { cy.elements().removeClass("faded"); cy.fit(undefined, 24); return; }
        cy.elements().addClass("faded");
        let sel = cy.collection();
        edgeIds.forEach((id) => { const e = cy.getElementById(id); if (e.nonempty()) sel = sel.union(e).union(e.connectedNodes()); });
        nodeIds.forEach((id) => { const n = cy.getElementById(id); if (n.nonempty()) sel = sel.union(n); });
        sel.removeClass("faded").addClass("hl");
        cy.animate({ fit: { eles: sel, padding: 50 } }, { duration: 450 });
      },
      filter(edgePred, nodePred) {
        const keepNodes = new Set();
        const keepEdges = new Set();
        d.edges.items.forEach((e) => {
          if (cy.getElementById(e.id).nonempty() && edgePred(e) && nodePred(d.entityById.get(e.source)) && nodePred(d.entityById.get(e.target))) {
            keepEdges.add(e.id); keepNodes.add(e.source); keepNodes.add(e.target);
          }
        });
        cy.batch(() => {
          cy.edges().forEach((e) => e.toggleClass("hidden", !keepEdges.has(e.id())));
          cy.nodes().forEach((n) => n.toggleClass("hidden", !keepNodes.has(n.id())));
        });
        if (keepEdges.size) cy.fit(cy.elements().not(".hidden"), 24);
      },
      select(id) { cy.elements().unselect(); const el = cy.getElementById(id); if (el.nonempty()) { el.select(); cy.animate({ center: { eles: el } }, { duration: 300 }); } },
    };
    window.addEventListener("resize", () => { cy.resize(); });
    return api;
  };

  PT.graphLegendHTML = function () {
    return `<div class="graph-legend" aria-hidden="true">
      <span class="etype tx"><span class="line"></span>Shipment</span>
      <span class="etype ct"><span class="line"></span>Ownership</span>
      <span class="etype inf"><span class="line"></span>Inferred</span>
      <span>⚑ risk flag</span>
    </div>`;
  };

  /* Text list of edges: same data as the graph, for phones and screen readers. */
  PT.edgeListHTML = function (d, edges) {
    return `<ul class="edge-list">${edges.map((e) => `
      <li class="${PT.ETYPE[e.edge_type].cls}" id="edge-${e.id}">
        <div class="edge-head">${PT.etypeTag(e.edge_type)} ${PT.confBadge(e.confidence)} ${e.hs_codes.map((h) => `<span class="hs">HS ${PT.esc(h)}</span>`).join(" ")}</div>
        <div><strong>${PT.esc(PT.edgeSentence(e, d))}</strong></div>
        ${e.first_seen ? `<div class="muted">${PT.fmtDate(e.first_seen)}${e.last_seen && e.last_seen !== e.first_seen ? ` – ${PT.fmtDate(e.last_seen)}` : ""}${e.shipment_count ? ` · ${e.shipment_count} shipment row${e.shipment_count > 1 ? "s" : ""}` : ""}</div>` : ""}
        <div>${PT.esc(e.evidence)}</div>
        ${PT.whyHTML(e)}
        <div>How we know: ${PT.receipts(e.source_call_ids)}</div>
      </li>`).join("")}</ul>`;
  };
})(window.PT);
