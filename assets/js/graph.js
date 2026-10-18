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
    return String(n).replace(/\s*\((trade record[^)]*|[^)]*misspelt record|[^)]*record \d+|record \d+)\)\s*$/i, "")
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
      // Known duplicate buyer records (e.g. misspellings), curated on the Check a Buyer page
      ((d.curated && d.curated.buyer_groups) || []).filter((g) => g.category !== "forwarder").forEach((g) => {
        const present = g.ids.filter((i) => parent.has(i));
        for (let i = 1; i < present.length; i++) { const a = find(present[i]), b = find(present[0]); if (a !== b) parent.set(a, b); }
      });
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

    const groupName = new Map();
    ((d.curated && d.curated.buyer_groups) || []).forEach((g) => g.ids.forEach((i) => groupName.set(i, g.name)));
    const nodeEls = [];
    groups.forEach((ids) => {
      const id = rep.get(ids[0]);
      const e = d.entityById.get(id);
      const display = ids.length > 1 && groupName.has(id) ? groupName.get(id) : e.name;
      const role = (caseId && e.case_roles && e.case_roles[caseId]) || e.role;
      const flagged = ids.some((x) => (d.entityById.get(x).risk_flags || []).some((f) => RISKY.test(f)));
      const extra = ids.length > 1 ? ` · ${ids.length} records` : "";
      nodeEls.push({
        data: { id, members: ids, label: `${flagged ? "⚑ " : ""}${shortName(display)}\n${PT.country(e.country)}${extra}` },
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
        id: m.id, source: m.source, target: m.target, conf: m.conf, ids: m.ids, rel: m.rel,
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
    { selector: "node.lane", style: {
      "background-opacity": 0, "border-width": 0, label: "data(label)", "font-family": "IBM Plex Mono, monospace",
      "font-size": 13, "font-weight": 600, color: "#0F5E5C", "text-transform": "uppercase", width: 200, height: 24, events: "no",
    } },
  ];

  PT.nodePanel = function (d, e, members, caseId) {
    const edges = d.edges.items.filter((x) => x.source === e.id || x.target === e.id);
    const ids = Object.entries(e.identifiers || {}).map(([k, v]) => `<dt>${PT.esc(k.toUpperCase())}</dt><dd class="id">${PT.esc(v)}</dd>`).join("");
    return `
      <span class="eyebrow">${PT.esc(PT.ROLE[(caseId && e.case_roles && e.case_roles[caseId]) || e.role] || e.role || "")}${e.type === "person" ? " · person" : ""}</span>
      <h3>${PT.esc(e.name)}</h3>
      <p>${PT.esc(e.summary)}</p>
      ${members && members.length > 1 ? `<div class="callout" style="margin-bottom:var(--s-3)"><strong>${members.length} Sayari records merged here</strong> (judged to be the same company):<ul style="margin:4px 0 0">${members.map((m) => `<li><a href="${PT.esc((d.entityById.get(m) || {}).sayari_url || "#")}" rel="noopener">${PT.esc(d.entityById.get(m).name)}</a></li>`).join("")}</ul></div>` : ""}
      ${e.case_summaries ? Object.entries(e.case_summaries).map(([cid, t]) => `<p class="muted" style="font-size:var(--fs-1)"><strong>${PT.esc((PT._data.caseById.get(cid) || {}).title || cid)}:</strong> ${PT.esc(t)}</p>`).join("") : ""}
      <p style="font-size:var(--fs-1)">Appears in: ${(e.case_ids || []).map((cid) => `<a href="cases.html#${cid}">${PT.esc((PT._data.caseById.get(cid) || {}).title || cid)}</a>`).join(" · ")}</p>
      <dl>
        <dt>Country</dt><dd>${PT.esc(PT.country(e.country))}</dd>
        ${ids}
        <dt>Sayari ID</dt><dd class="id">${e.sayari_url ? `<a href="${PT.esc(e.sayari_url)}" rel="noopener">${PT.esc(e.id)}</a>` : `None: not in Sayari (placeholder ${PT.esc(e.id)})`}</dd>
        <dt>Links</dt><dd>${edges.length}</dd>
      </dl>
      ${e.risk_flags.length ? `<div><strong>Sayari risk flags</strong> <small class="muted">(context; most describe neighbours, not this entity. See <a href="about.html#flags">how to read flags</a>)</small><div class="flags">${e.risk_flags.map((f) => `<span class="flag-chip">${RISKY.test(f) ? "⚑ " : ""}${PT.esc(f)}</span>`).join("")}</div></div>` : `<p class="muted">No risk flags beyond country indices.</p>`}
      <p><strong>How we know:</strong> ${PT.receipts(e.source_call_ids)}</p>
      ${edges.length ? `<p style="margin-bottom:4px"><strong>Links</strong> <span class="muted" style="font-size:var(--fs-0)">(click one for details)</span></p>` : ""}
      <ul>${edges.map((x) => `<li><a href="#edge-${x.id}" data-edge="${x.id}">${PT.esc(PT.edgeSentence(x, d))}</a></li>`).join("")}</ul>`;
  };

  PT.edgePanel = function (d, e, ids) {
    if (ids && ids.length > 1) {
      return `<span class="eyebrow">${ids.length} links combined</span><h3>${PT.esc(PT.edgeSentence(e, d))}</h3>
        <p class="muted" style="font-size:var(--fs-1)">These come from different records of the same companies.</p>` +
        PT.edgeListHTML(d, ids.map((i) => d.edgeById.get(i)));
    }
    return `
      <span class="eyebrow">Link ${PT.esc(e.id)}</span>
      <h3>${PT.esc(PT.edgeSentence(e, d))}</h3>
      <div class="case-meta">${PT.etypeTag(e.edge_type)} ${PT.confBadge(e.confidence)}</div>
      <p>${PT.esc(e.evidence)}</p>
      ${PT.whyHTML(e)}
      <dl>
        ${e.hs_codes.length ? `<dt>HS codes</dt><dd>${e.hs_codes.map((h) => `<span class="hs">${PT.esc(h)}</span>`).join(" ")}</dd>` : ""}
        ${e.first_seen ? `<dt>Dates</dt><dd>${PT.fmtDate(e.first_seen)}${e.last_seen && e.last_seen !== e.first_seen ? ` – ${PT.fmtDate(e.last_seen)}` : ""}</dd>` : ""}
        ${e.shipment_count ? `<dt>Rows</dt><dd>${e.shipment_count}</dd>` : ""}
      </dl>
      <p><strong>How we know:</strong> ${PT.receipts(e.source_call_ids)}</p>`;
  };



  /* Lane layout for a single case: Owners & people | Suppliers | The plant | Buyers.
     Every case reads left to right in the same structure. */
  const LANES = ["Owners and people", "Suppliers and inputs", "The plant", "Buyers and outputs"];
  function laneLayout(cy) {
    cy.remove(".lane");
    const nodes = cy.nodes();
    if (!nodes.length) return;
    let P = nodes.filter(".transit_plant");
    if (P.empty()) P = nodes.max((n) => n.degree()).ele.collection();
    const col = new Map(); const depth = new Map(); const weight = new Map();
    P.forEach((n) => col.set(n.id(), 2));
    const isP = (id) => col.get(id) === 2 && P.getElementById(id).nonempty();
    const OWNERSHIP = new Set(["owns", "shareholder_of", "subsidiary_of", "director_of", "officer_of"]);
    const tx = cy.edges(".tx"), inf = cy.edges(".inf");
    const ct = cy.edges(".ct").filter((e) => OWNERSHIP.has(e.data("rel")));
    // Owners: walk up ownership/officer links from the plant
    let changed = true, level = 1;
    while (changed && level < 8) {
      changed = false;
      ct.forEach((e) => {
        const s = e.data("source"), t = e.data("target");
        if (!col.has(s) && (isP(t) || col.get(t) === 0)) { col.set(s, 0); depth.set(s, (depth.get(t) || 0) + 1); changed = true; }
      });
      level++;
    }
    // Buyers (after owners, so an owner that also buys stays with the owners): shipments leaving the plant
    tx.forEach((e) => { if (isP(e.data("source")) && !col.has(e.data("target"))) { col.set(e.data("target"), 3); weight.set(e.data("target"), (weight.get(e.data("target")) || 0) + e.data("w")); } });
    // Suppliers: shipments into the plant
    tx.forEach((e) => { if (isP(e.data("target")) && !col.has(e.data("source"))) { col.set(e.data("source"), 1); weight.set(e.data("source"), (weight.get(e.data("source")) || 0) + e.data("w")); } });
    // Known buyers always sit on the buyer side
    nodes.forEach((n) => { if (!col.has(n.id()) && (n.hasClass("us_buyer") || n.hasClass("buyer"))) col.set(n.id(), 3); });
    // Duplicate-record leads sit with the plant
    inf.forEach((e) => { [[e.data("source"), e.data("target")], [e.data("target"), e.data("source")]].forEach(([a, b]) => { if (!col.has(a) && isP(b)) col.set(a, 2); }); });
    // Everything else joins its nearest placed neighbour
    for (let pass = 0; pass < 4; pass++) {
      nodes.forEach((n) => {
        if (col.has(n.id())) return;
        const nb = n.neighborhood("node").filter((m) => col.has(m.id()));
        if (nb.nonempty()) {
          const m = nb[0], c = col.get(m.id());
          const shipped = n.edgesWith(m).filter(".tx");
          const receives = shipped.filter((e) => e.data("source") === m.id()).nonempty(); // goods flow m -> n
          const sends = shipped.filter((e) => e.data("target") === m.id()).nonempty();    // goods flow n -> m
          // Follow the goods: downstream of anything goes right, upstream of the plant or a supplier goes left.
          const target = receives ? 3 : sends && c >= 1 ? 1 : c === 2 ? 1 : c;
          col.set(n.id(), target);
          if (target === 0) depth.set(n.id(), (depth.get(m.id()) || 0));
        }
      });
    }
    nodes.forEach((n) => { if (!col.has(n.id())) col.set(n.id(), 1); });

    const X = [0, 330, 660, 990], GAP = 22;
    const pos = {}; let top = Infinity;
    [0, 1, 2, 3].forEach((c) => {
      let list = nodes.filter((n) => col.get(n.id()) === c);
      if (!list.length) return;
      list = list.sort((a, b) => c === 0 ? (depth.get(b.id()) || 0) - (depth.get(a.id()) || 0) || a.data("label").localeCompare(b.data("label"))
        : c === 2 ? b.degree() - a.degree() : (weight.get(b.id()) || 0) - (weight.get(a.id()) || 0) || a.data("label").localeCompare(b.data("label")));
      // Long buyer lists wrap into extra sub-columns to the right, so the network stays compact.
      const PER = c === 3 ? Math.max(14, Math.ceil(list.length / 3)) : list.length;
      for (let k = 0; k * PER < list.length; k++) {
        const chunk = list.slice(k * PER, (k + 1) * PER);
        const hs = chunk.map((n) => n.outerHeight());
        const total = hs.reduce((a, h) => a + h + GAP, -GAP);
        let y = -total / 2;
        chunk.forEach((n, i) => { pos[n.id()] = { x: X[c] + k * 225, y: y + hs[i] / 2 }; y += hs[i] + GAP; });
        top = Math.min(top, -total / 2);
      }
    });
    nodes.positions((n) => pos[n.id()]);
    const used = [0, 1, 2, 3].filter((c) => nodes.some((n) => col.get(n.id()) === c));
    cy.add(used.map((c) => ({ group: "nodes", data: { id: `lane-${c}`, label: LANES[c] }, classes: "lane", position: { x: X[c], y: top - 60 } })));
  }

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
      autoungrabify: true, // nodes can't be dragged; clicking only opens details
    });
    const layout = () => {
      if (caseId && opts.lanes !== false) laneLayout(cy);
      else cy.layout({ name: "dagre", rankDir: "LR", nodeSep: 24, rankSep: 120, edgeSep: 12, padding: 30, animate: false }).run();
    };
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

    // Details drawer: clicking a company or a line shows what we know about it.
    const drawer = document.createElement("aside");
    drawer.className = "side-panel card drawer";
    drawer.setAttribute("aria-live", "polite");
    drawer.hidden = true;
    frame.appendChild(drawer);
    const close = () => { drawer.hidden = true; cy.elements().unselect(); };
    const openNode = (id, members) => {
      const e = d.entityById.get(id); if (!e) return;
      drawer.innerHTML = `<button type="button" class="drawer-close" aria-label="Close details">×</button>` + PT.nodePanel(d, e, members || [id], caseId);
      drawer.hidden = false; drawer.scrollTop = 0;
    };
    const openEdge = (id, ids) => {
      const e = d.edgeById.get(id); if (!e) return;
      drawer.innerHTML = `<button type="button" class="drawer-close" aria-label="Close details">×</button>` + PT.edgePanel(d, e, ids);
      drawer.hidden = false; drawer.scrollTop = 0;
    };
    drawer.addEventListener("click", (ev) => {
      if (ev.target.closest(".drawer-close")) { close(); return; }
      const a = ev.target.closest("[data-edge]");
      if (a) { ev.preventDefault(); const el = elOfEdge(a.dataset.edge); if (el && el.nonempty()) { cy.elements().unselect(); el.select(); openEdge(el.data("ids")[0], el.data("ids")); } else openEdge(a.dataset.edge); }
    });
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !drawer.hidden) close(); });
    cy.on("tap", "node", (ev) => { const n = ev.target; openNode(n.id(), n.data("members")); if (opts.onSelect) opts.onSelect({ kind: "node", id: n.id() }); });
    cy.on("tap", "edge", (ev) => { const e = ev.target; openEdge(e.data("ids")[0], e.data("ids")); if (opts.onSelect) opts.onSelect({ kind: "edge", id: e.data("ids")[0] }); });
    cy.on("tap", (ev) => { if (ev.target === cy) close(); });
    cy.on("mouseover", "node, edge", () => { container.style.cursor = "pointer"; });
    cy.on("mouseout", "node, edge", () => { container.style.cursor = ""; });

    const elOfEdge = (id) => { const m = built.origToEl.get(id); return m ? cy.getElementById(m) : cy.collection(); };
    const elOfNode = (id) => cy.getElementById(built.rep.get(id) || id);

    const api = {
      cy,
      get merged() { return merge; },
      setCase(id) { caseId = id; api.rebuild(); },
      setMerge(on) { merge = on; api.rebuild(); },
      rebuild() {
        drawer.hidden = true;
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
          if (!el.data("ids")) return;
          const ok = el.data("ids").some((id) => edgePred(d.edgeById.get(id)));
          const s = d.entityById.get(el.data("source")), t = d.entityById.get(el.data("target"));
          if (ok && nodePred(s) && nodePred(t)) { keepEdges.add(el.id()); keepNodes.add(el.data("source")); keepNodes.add(el.data("target")); }
        });
        cy.batch(() => {
          cy.edges().forEach((e) => e.toggleClass("hidden", !keepEdges.has(e.id())));
          cy.nodes().not(".lane").forEach((n) => n.toggleClass("hidden", !keepNodes.has(n.id())));
        });
        if (keepEdges.size) fitReadable();
      },
      showDetails(id) {
        api.select(id);
        if (d.edgeById.has(id)) { const el = elOfEdge(id); openEdge(id, el && el.nonempty() ? el.data("ids") : [id]); }
        else { const n = elOfNode(id); openNode(n.nonempty() ? n.id() : id, n.nonempty() ? n.data("members") : [id]); }
      },
      select(id) {
        cy.elements().unselect();
        const el = d.edgeById.has(id) ? elOfEdge(id) : elOfNode(id);
        if (el && el.nonempty()) { el.select(); cy.animate({ center: { eles: el }, zoom: Math.max(cy.zoom(), 0.9) }, { duration: 300 }); }
      },
    };
    window.addEventListener("resize", () => cy.resize());
    (PT._graphs = PT._graphs || []).push(api);
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
