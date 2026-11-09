/* Paper Trail | Minerals: Cytoscape + dagre network graph.
   Readability rules: duplicate records (possibly-same-as) merge into one node by default;
   nodes are coloured by role; line width follows shipment count; clicking lights up a company's
   whole chain without removing the rest. Moving arrows show the direction of goods and ownership. */
(function (PT) {
  const C = {
    tx: "#1F5FBF", ct: "#6B3FA0", inf: "#A86A12", ink: "#1A1A1A", ink2: "#4A4A45", ink3: "#6E6D66",
    rule: "#B9B6A8", teal: "#0F5E5C", risk: "#B42318", card: "#FFFFFF", paper: "#FAFAF7",
  };
  const RISKY = PT.RISKY = /forced_labor|sheffield|uflpa|sanction|export_control|bis_entity/;
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
        data: { id, members: ids, flagged, name: shortName(display), country: e.country, label: `${flagged ? "⚑ " : ""}${shortName(display)}\n${PT.country(e.country)}${extra}` },
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
      shape: "round-rectangle", "background-color": "#EAF1FB", "border-width": 1.5, "border-color": "#9DB8E0",
      label: "data(label)", "text-wrap": "wrap", "text-max-width": 160, "font-family": "IBM Plex Sans, system-ui, sans-serif",
      "font-size": 12.5, "line-height": 1.25, color: C.ink, "text-valign": "center", "text-halign": "center",
      width: 178, height: "label", padding: "9px", "transition-property": "opacity, border-width", "transition-duration": 180,
    } },
    { selector: "node.parent", style: { "background-color": "#F1EAFB", "border-color": C.ct, "font-weight": 600 } },
    { selector: "node.person", style: { "background-color": "#FFFFFF", "border-color": C.ct, "border-style": "dashed", "font-size": 12, width: 170 } },
    { selector: "node.transit_plant", style: { "background-color": C.teal, "border-color": C.teal, color: "#FFFFFF", "font-weight": 700, "font-size": 13.5, width: 182 } },
    { selector: "node.us_buyer", style: { "background-color": "#FFFFFF", "border-color": C.ink, "border-width": 2 } },
    { selector: "node.buyer", style: { "background-color": "#FFFFFF", "border-color": C.ink3 } },
    { selector: "node.contrast", style: { "background-color": "#F7F6F1", "border-color": C.rule, "border-style": "dashed", color: C.ink2 } },
    { selector: "node.merged", style: { "border-width": 4, "border-style": "double" } },
    { selector: "edge", style: {
      width: "data(w)", "curve-style": "bezier", "target-arrow-shape": "triangle", "arrow-scale": 1, "edge-distances": "node-position",
      "font-family": "IBM Plex Mono, monospace", "font-size": 11, label: "", color: C.ink,
      "text-background-color": "#FFFFFF", "text-background-opacity": 1, "text-background-padding": 3,
      "text-background-shape": "round-rectangle", opacity: 0.62, "transition-property": "opacity", "transition-duration": 180,
    } },
    { selector: "edge.tx", style: { "line-color": C.tx, "target-arrow-color": C.tx } },
    { selector: "edge.ct", style: { "line-color": C.ct, "target-arrow-color": C.ct, "line-style": "dashed", "line-dash-pattern": [9, 5] } },
    { selector: "edge.inf", style: { "line-color": C.inf, "target-arrow-color": C.inf, "line-style": "dotted", "target-arrow-shape": "none" } },
    { selector: "edge.conf-lead", style: { opacity: 0.32 } },
    { selector: "edge.labelled", style: { label: "data(label)" } },
    { selector: "node.hover", style: { "underlay-color": C.teal, "underlay-opacity": 0.14, "underlay-padding": 6, "underlay-shape": "round-rectangle" } },
    { selector: "edge.hover", style: { opacity: 1, "z-index": 9 } },
    { selector: ".sp-dim", style: { opacity: 0.62, "text-opacity": 0.8 } },
    { selector: "edge.sp-dim", style: { opacity: 0.3 } },
    { selector: "edge.sp-on", style: { opacity: 1 } },
    { selector: "node.sp-on", style: { "underlay-color": "#E0A100", "underlay-opacity": 0.28, "underlay-padding": 7, "underlay-shape": "round-rectangle", "border-width": 3 } },
    { selector: "node.sp-risk", style: { "underlay-color": C.risk, "underlay-opacity": 0.26, "underlay-padding": 8, "border-color": C.risk, "border-width": 3.5 } },
    { selector: ".faded", style: { opacity: 0.32, "text-opacity": 0.5 } },
    { selector: "edge.faded", style: { opacity: 0.12 } },
    { selector: "edge.hl", style: { opacity: 1, "z-index": 10 } },
    { selector: "node.hl", style: { opacity: 1, "text-opacity": 1, "z-index": 10 } },
    { selector: "node:selected", style: { "border-color": "#E0A100", "border-width": 4, "underlay-color": "#E0A100", "underlay-opacity": 0.3, "underlay-padding": 8, "underlay-shape": "round-rectangle" } },
    { selector: "edge:selected", style: { "line-color": "#E0A100", "target-arrow-color": "#E0A100", opacity: 1, label: "data(label)" } },
    { selector: ".hidden", style: { display: "none" } },
    { selector: "node.lane", style: {
      "background-opacity": 0, "border-width": 0, label: "data(label)", "font-family": "IBM Plex Mono, monospace",
      "font-size": 14, "font-weight": 600, color: "#0F5E5C", "text-wrap": "wrap", "text-max-width": "data(w)", width: "data(w)", height: 24, events: "no",
    } },
        { selector: "node.lane.none", style: { "font-size": 12, "font-weight": 400, color: C.ink3, "text-wrap": "wrap", "text-transform": "none", "font-family": "IBM Plex Sans, sans-serif" } },
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



  /* Lane layout. Every case has the same four buckets, left to right: owners and people, suppliers
     and inputs, the plant, buyers and outputs. A bucket can hold several columns. Columns further
     from the plant hold companies further from it, and long lists wrap into extra columns.
     An empty bucket stays as a narrow, labelled column. */
  const LANE = ["Owners and people", "Suppliers and inputs", "The plant", "Buyers and outputs"];
  function laneLayout(cy) {
    cy.remove(".lane");
    const nodes = cy.nodes();
    if (!nodes.length) return null;
    let P = nodes.filter(".transit_plant");
    if (P.empty()) P = nodes.max((n) => n.degree()).ele.collection();
    const lane = new Map(), depth = new Map(), weight = new Map();
    P.forEach((n) => lane.set(n.id(), "plant"));
    const isP = (id) => lane.get(id) === "plant";
    const OWNERSHIP = new Set(["owns", "shareholder_of", "subsidiary_of", "director_of", "officer_of"]);
    const tx = cy.edges(".tx"), inf = cy.edges(".inf");
    const ct = cy.edges(".ct").filter((e) => OWNERSHIP.has(e.data("rel")));
    // Owners: walk up ownership and officer links from the plant
    let changed = true, level = 1;
    while (changed && level < 8) {
      changed = false;
      ct.forEach((e) => {
        const s = e.data("source"), t = e.data("target");
        if (!lane.has(s) && (isP(t) || lane.get(t) === "own")) { lane.set(s, "own"); depth.set(s, (depth.get(t) || 0) + 1); changed = true; }
      });
      level++;
    }
    const add = (id, w) => weight.set(id, (weight.get(id) || 0) + w);
    // Buyers come after owners, so an owner that also buys stays with the owners
    tx.forEach((e) => { const t = e.data("target"); if (isP(e.data("source")) && !lane.has(t)) { lane.set(t, "buy"); add(t, e.data("w")); } });
    tx.forEach((e) => { const s = e.data("source"); if (isP(e.data("target")) && !lane.has(s)) { lane.set(s, "sup"); add(s, e.data("w")); } });
    nodes.forEach((n) => { if (!lane.has(n.id()) && (n.hasClass("us_buyer") || n.hasClass("buyer"))) lane.set(n.id(), "buy"); });
    // Probable duplicates of the plant sit with the plant
    inf.forEach((e) => { [[e.data("source"), e.data("target")], [e.data("target"), e.data("source")]].forEach(([a, b]) => { if (!lane.has(a) && isP(b)) lane.set(a, "plant"); }); });
    // Everything else follows the goods from its nearest placed neighbour
    for (let pass = 0; pass < 4; pass++) {
      nodes.forEach((n) => {
        if (lane.has(n.id())) return;
        const nb = n.neighborhood("node").filter((m) => lane.has(m.id()));
        if (nb.empty()) return;
        const m = nb[0], c = lane.get(m.id());
        const shipped = n.edgesWith(m).filter(".tx");
        const receives = shipped.filter((e) => e.data("source") === m.id()).nonempty();
        lane.set(n.id(), receives ? "buy" : c === "own" ? "own" : "sup");
      });
    }
    nodes.forEach((n) => { if (!lane.has(n.id())) lane.set(n.id(), "sup"); });
    // Second-tier flows get their own lane, so an arrow never runs up or down inside a column
    const fromPlant = new Set(), toPlant = new Set();
    tx.forEach((e) => { if (isP(e.data("source"))) fromPlant.add(e.data("target")); if (isP(e.data("target"))) toPlant.add(e.data("source")); });
    tx.forEach((e) => {
      const s = e.data("source"), t = e.data("target");
      if (lane.get(s) === "buy" && lane.get(t) === "buy" && !fromPlant.has(t)) lane.set(t, "on");
      if (lane.get(s) === "sup" && lane.get(t) === "sup" && !toPlant.has(s)) lane.set(s, "up");
    });

    // Columns, left to right. The busiest companies sit nearest the plant.
    const list = (k) => nodes.filter((n) => lane.get(n.id()) === k).toArray();
    const byName = (a, b) => a.data("label").localeCompare(b.data("label"));
    const byWeight = (a, b) => (weight.get(b.id()) || 0) - (weight.get(a.id()) || 0) || byName(a, b);
    const wrapped = (arr) => {
      const per = Math.max(12, Math.ceil(arr.length / 3)), out = [];
      for (let i = 0; i < arr.length; i += per) out.push(arr.slice(i, i + per));
      return out;
    };
    const ownerDepth = (n) => Math.min(3, depth.get(n.id()) || 1);
    const owners = list("own");
    const buckets = [
      [3, 2, 1].flatMap((d) => wrapped(owners.filter((n) => ownerDepth(n) === d).sort(byName))),
      [...wrapped(list("up").sort(byWeight)).reverse(), ...wrapped(list("sup").sort(byWeight)).reverse()],
      [list("plant").sort((a, b) => b.degree() - a.degree())].filter((c) => c.length),
      [...wrapped(list("buy").sort(byWeight)), ...wrapped(list("on").sort(byWeight))],
    ];

    const SUB_GAP = 44, LANE_GAP = 96, EMPTY_W = 100, CORRIDOR = 38;
    const cols = [], bucketBox = [];
    let cursor = 0;
    buckets.forEach((columns, b) => {
      const x0 = cursor;
      if (!columns.length) cols.push({ b, x: cursor + EMPTY_W / 2, w: EMPTY_W, nodes: [] });
      columns.forEach((nodesIn, i) => {
        const w = Math.max(...nodesIn.map((n) => n.outerWidth()));
        cols.push({ b, x: cursor + w / 2, w, nodes: nodesIn });
        cursor += w + (i < columns.length - 1 ? SUB_GAP : 0);
      });
      if (!columns.length) cursor += EMPTY_W;
      bucketBox[b] = { x0, x1: cursor };
      cursor += LANE_GAP;
    });

    // Rows sit near the companies they connect to, which keeps lines from crossing
    const pos = {};
    const pull = (n) => {
      const ys = n.neighborhood("node").map((m) => pos[m.id()]).filter(Boolean).map((q) => q.y);
      return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 0;
    };
    const inBucket = (b) => cols.filter((c) => c.b === b && c.nodes.length);
    [[2, 1], [1, -1], [3, 1], [0, -1]].forEach(([b, dir]) => {
      const cs = inBucket(b);
      if (!cs.length) return;
      const pitch = Math.max(...cs.flatMap((c) => c.nodes.map((n) => n.outerHeight()))) + CORRIDOR;
      (dir > 0 ? cs : [...cs].reverse()).forEach((c) => {
        c.nodes = c.nodes.map((n) => [n, pull(n)]).sort((p, q) => p[1] - q[1] || byWeight(p[0], q[0])).map((x) => x[0]);
        c.nodes.forEach((n, r) => { pos[n.id()] = { x: c.x, y: (r - (c.nodes.length - 1) / 2) * pitch }; });
      });
    });
    nodes.positions((n) => pos[n.id()]);

    const colOf = new Map();
    cols.forEach((c, i) => c.nodes.forEach((n) => colOf.set(n.id(), i)));
    routeEdges(cy, cols, colOf, isP, CORRIDOR);

    const yAll = Object.values(pos).map((q) => q.y);
    const top = Math.min(...yAll) - 80, bottom = Math.max(...yAll) + 80;
    const bands = bucketBox.map((k, b) => ({ c: b === 2 ? 2 : 1, x0: k.x0 - 22, x1: k.x1 + 22, y0: top - 44, y1: bottom }));
    const labels = bucketBox.flatMap((k, b) => {
      const x = (k.x0 + k.x1) / 2, empty = !buckets[b].length;
      // Each title's box spans its whole bucket, so the title can never be wider than its box
      const w = Math.max(96, k.x1 - k.x0);
      const head = { id: `lane-${b}`, label: LANE[b].toUpperCase(), w, x, y: top - 18, cls: "lane" };
      return empty ? [head, { id: `lane-${b}-none`, label: "None in\nthe records", w, x, y: top + 54, cls: "lane none" }] : [head];
    });
    cy.add(labels.map((l) => ({ group: "nodes", data: { id: l.id, label: l.label, w: l.w }, classes: l.cls, position: { x: l.x, y: l.y } })));
    const lanes = buckets.map((columns, b) => ({ title: LANE[b], ids: columns.flat().map((n) => n.id()) })).filter((l) => l.ids.length);
    return { lanes, bands, height: bottom - top + 60, width: cursor - LANE_GAP };
  }

  /* Every line runs in the clear space between rows and columns, so it never passes behind a company
     it doesn't connect to. Lines that share an end share a track, and other lines get their own. */
  function routeEdges(cy, cols, colOf, isP, CORRIDOR) {
    const offsets = (step) => {
      const seen = new Map();
      return (key, hub, max) => {
        if (!seen.has(key)) seen.set(key, new Map());
        const m = seen.get(key);
        if (!m.has(hub)) { const i = m.size; m.set(hub, Math.min(max, Math.ceil(i / 2) * step) * (i % 2 ? 1 : -1)); }
        return m.get(hub);
      };
    };
    const gapTrack = offsets(9), rowTrack = offsets(7);
    const gapX = (i, hub) => { // the gap to the right of column i
      if (i < 0) return cols[0].x - cols[0].w / 2 - 12;
      const l = cols[i].x + cols[i].w / 2, r = cols[i + 1].x - cols[i + 1].w / 2;
      return (l + r) / 2 + gapTrack(`g${i}`, hub, (r - l) / 2 - 10);
    };
    const boxesIn = (i, j) => cols.slice(i, j + 1).flatMap((c) => c.nodes.map((n) => {
      const y = n.position("y"), h = n.outerHeight() / 2;
      return [y - h, y + h];
    }));
    const clearY = (i, j, y, toward, hub) => {
      const boxes = boxesIn(i, j);
      const free = (q) => boxes.every(([t, b]) => q < t - 8 || q > b + 8);
      if (free(y)) return y;
      const options = boxes.flatMap(([t, b]) => [t - CORRIDOR / 2, b + CORRIDOR / 2]).filter(free);
      const cost = (q) => Math.abs(q - y) + Math.abs(q - toward) * 0.01;
      const best = options.sort((p, q) => cost(p) - cost(q))[0];
      return best + rowTrack(`r${i}:${Math.round(best)}`, hub, CORRIDOR / 2 - 13);
    };
    cy.edges().forEach((e) => {
      const a = e.source(), b = e.target();
      const kind = e.hasClass("tx") ? "tx" : e.hasClass("inf") ? "inf" : "ct";
      const hubNode = isP(a.id()) ? a : isP(b.id()) ? b : a.degree() >= b.degree() ? a : b;
      const hub = `${hubNode.id()}|${kind}`;
      const ca = colOf.get(a.id()), cb = colOf.get(b.id());
      let pts = [];
      if (ca === cb) { // same column: step out into the gap beside it
        const x = gapX(ca - 1, hub);
        pts = [{ x, y: a.position("y") }, { x, y: b.position("y") }];
      } else {
        const [L, R, cL, cR] = ca < cb ? [a, b, ca, cb] : [b, a, cb, ca];
        let y = L.position("y"), i = cL + 1;
        const end = R.position("y");
        while (i < cR) { // cross each bucket in the way through a clear row
          let j = i;
          while (j + 1 < cR && cols[j + 1].b === cols[i].b) j++;
          const next = clearY(i, j, y, end, hub);
          if (Math.abs(next - y) > 0.5) { const x = gapX(i - 1, hub); pts.push({ x, y }, { x, y: next }); y = next; }
          i = j + 1;
        }
        if (Math.abs(end - y) > 0.5) { const x = gapX(cR - 1, hub); pts.push({ x, y }, { x, y: end }); }
        if (ca > cb) pts.reverse();
      }
      e.scratch("route", pts);
      if (!pts.length) { e.style({ "curve-style": "straight" }); return; }
      const p = a.position(), q = b.position();
      const dx = q.x - p.x, dy = q.y - p.y, len2 = dx * dx + dy * dy, len = Math.sqrt(len2);
      e.style({
        "curve-style": "round-segments", "segment-radius": 12, "edge-distances": "node-position",
        "segment-weights": pts.map((c) => (((c.x - p.x) * dx + (c.y - p.y) * dy) / len2).toFixed(4)).join(" "),
        "segment-distances": pts.map((c) => (((c.y - p.y) * dx - (c.x - p.x) * dy) / len).toFixed(1)).join(" "),
      });
    });
  }

  /* Points along a drawn edge, in graph coordinates. */
  function edgePoints(e) {
    return [e.sourceEndpoint(), ...(e.scratch("route") || []), e.targetEndpoint()];
  }

  /* Small arrows travelling along the lines. Inferred and lead links stay still: nothing is known to move. */
  function flowLayer(cy, frame, container) {
    const cv = document.createElement("canvas");
    cv.className = "graph-flow";
    frame.appendChild(cv);
    const ctx = cv.getContext("2d");
    let on = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tracks = null, boxes = [], raf = 0, seen = true;
    const size = () => {
      const r = window.devicePixelRatio || 1;
      cv.width = container.clientWidth * r; cv.height = container.clientHeight * r;
      cv.style.width = container.clientWidth + "px"; cv.style.height = container.clientHeight + "px";
    };
    function collect() {
      boxes = cy.nodes().not(".lane").filter((n) => n.visible()).map((n) => n.boundingBox({ includeLabels: false, includeUnderlays: false }));
      tracks = cy.edges().filter((e) => e.visible() && !e.hasClass("inf") && !e.hasClass("conf-lead")).map((e) => {
        const pts = edgePoints(e), cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
        return { e, pts, cum, len: cum[cum.length - 1], color: e.hasClass("tx") ? C.tx : C.ct, speed: e.hasClass("tx") ? 46 : 26, size: 5 + e.data("w") * 0.5 };
      });
    }
    function at(tr, d) {
      let i = 1;
      while (i < tr.cum.length - 1 && tr.cum[i] < d) i++;
      const a = tr.pts[i - 1], b = tr.pts[i], u = (d - tr.cum[i - 1]) / ((tr.cum[i] - tr.cum[i - 1]) || 1);
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ang: Math.atan2(b.y - a.y, b.x - a.x) };
    }
    function frameDraw(now) {
      raf = 0;
      if (!on || !seen) return;
      if (!tracks) collect();
      const r = window.devicePixelRatio || 1, z = cy.zoom(), p = cy.pan();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(r * z, 0, 0, r * z, r * p.x, r * p.y);
      ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 1.1;
      const SPACE = 130;
      tracks.forEach((tr) => {
        if (tr.len < 40) return;
        const dimmed = tr.e.hasClass("faded") || tr.e.hasClass("sp-dim");
        ctx.globalAlpha = dimmed ? 0.25 : 1;
        ctx.fillStyle = tr.e.selected() ? "#E0A100" : tr.color;
        const off = ((now / 1000) * tr.speed) % SPACE;
        for (let d = off + 6; d < tr.len - 12; d += SPACE) {
          const q = at(tr, d), s = tr.size;
          if (boxes.some((b) => q.x > b.x1 && q.x < b.x2 && q.y > b.y1 && q.y < b.y2)) continue; // lines run behind companies
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.ang);
          ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * 0.7, s * 0.72); ctx.lineTo(-s * 0.7, -s * 0.72); ctx.closePath();
          ctx.fill(); ctx.stroke(); ctx.restore();
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frameDraw);
    }
    const start = () => { if (on && seen && !raf) raf = requestAnimationFrame(frameDraw); };
    if ("IntersectionObserver" in window) new IntersectionObserver((en) => { seen = en[0].isIntersecting; start(); }).observe(container);
    size(); start();
    return {
      dirty() { tracks = null; },
      resize() { size(); },
      get on() { return on; },
      set(v) {
        on = v;
        if (!v) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); if (raf) cancelAnimationFrame(raf); raf = 0; } else start();
      },
    };
  }

  /* Soft column backgrounds behind the graph. */
  function bandLayer(cy, frame, container) {
    const cv = document.createElement("canvas");
    cv.className = "graph-bands";
    frame.insertBefore(cv, frame.firstChild);
    const ctx = cv.getContext("2d");
    let bands = [];
    function paint() {
      const r = window.devicePixelRatio || 1;
      if (cv.width !== container.clientWidth * r || cv.height !== container.clientHeight * r) {
        cv.width = container.clientWidth * r; cv.height = container.clientHeight * r;
        cv.style.width = container.clientWidth + "px"; cv.style.height = container.clientHeight + "px";
      }
      const z = cy.zoom(), p = cy.pan();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(r * z, 0, 0, r * z, r * p.x, r * p.y);
      bands.forEach((b) => {
        ctx.fillStyle = b.c === 2 ? "rgba(15,94,92,.07)" : "rgba(26,26,26,.03)";
        ctx.beginPath(); ctx.roundRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, 12); ctx.fill();
      });
    }
    cy.on("viewport resize", paint);
    return { set(b) { bands = b || []; paint(); } };
  }

  PT.Graph = function (container, d, opts = {}) {
    if (typeof cytoscape === "undefined") {
      container.innerHTML = `<p class="graph-fallback">The graph library didn't load. The list view shows the same links.</p>`;
      return null;
    }
    let merge = opts.merge !== false;
    let caseId = opts.caseId;
    let built = build(d, caseId, merge);
    const frame = container.parentElement;
    const cy = cytoscape({
      container, elements: built.els, style: STYLE,
      minZoom: 0.05, maxZoom: 2.5, boxSelectionEnabled: false,
      userZoomingEnabled: false, // the page scrolls past the graph; the buttons do the zooming
      autoungrabify: true, // nodes can't be dragged; clicking only opens details
    });
    const under = bandLayer(cy, frame, container);
    const flow = flowLayer(cy, frame, container);
    let lanes = null;
    const baseHeight = container.clientHeight;
    const shown = () => cy.elements().not(".hidden");
    /* A busy case gets a taller graph, so each company keeps its own readable row. */
    function sizeFrame() {
      const READABLE = 0.72, MAX = 2600;
      let h = baseHeight;
      if (lanes) {
        const z = Math.min(READABLE, (container.clientWidth - 40) / lanes.width);
        h = Math.max(baseHeight, Math.min(MAX, lanes.height * z + 40));
      }
      container.style.height = h + "px";
      cy.resize(); flow.resize();
    }
    function fitWhole() {
      sizeFrame();
      cy.fit(shown(), 20);
      if (cy.zoom() > 1) { cy.zoom(1); cy.center(shown()); }
    }
    const layout = () => { lanes = laneLayout(cy); flow.dirty(); };
    layout();
    // If the site's fonts arrive after the graph is drawn, measure and lay out again in the real fonts
    if (document.fonts && !(document.fonts.check("600 14px 'IBM Plex Mono'") && document.fonts.check("12.5px 'IBM Plex Sans'"))) {
      Promise.all([document.fonts.load("600 14px 'IBM Plex Mono'"), document.fonts.load("12.5px 'IBM Plex Sans'"), document.fonts.load("600 12.5px 'IBM Plex Sans'")]).then(() => {
        cy.nodes().forEach((n) => { const l = n.data("label"); n.data("label", l + " "); n.data("label", l); });
        layout(); fitWhole(); under.set(lanes && lanes.bands);
      }).catch(() => {});
    }
    fitWhole();
    under.set(lanes && lanes.bands);

    // Hover: a tooltip and a soft emphasis. The rest of the graph stays as it is.
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
    cy.on("mouseover", "node, edge", (ev) => {
      const el = ev.target;
      tip.innerHTML = tipText(el); tip.hidden = false;
      el.addClass("hover");
      if (el.isNode()) el.connectedEdges().addClass("hover");
    });
    cy.on("mouseout", "node, edge", () => {
      tip.hidden = true;
      cy.elements().removeClass("hover");
    });
    cy.on("mousemove", (ev) => {
      if (tip.hidden) return;
      const p = ev.renderedPosition || { x: 0, y: 0 };
      tip.style.left = Math.max(4, Math.min(p.x + 14, container.clientWidth - 270)) + "px";
      tip.style.top = (p.y + 16) + "px";
    });

    // Details open in the side panel beside the graph.
    const CLOSE = `<button type="button" class="drawer-close" aria-label="Close details">×</button>`;
    const panel = opts.panel;
    const fill = (html) => { panel.innerHTML = CLOSE + html; panel.scrollTop = 0; };

    /* Light up everything upstream and downstream of a company or line. The rest stays visible, just quieter. */
    function chainOf(el) {
      if (el.isNode()) return el.union(el.predecessors()).union(el.successors());
      return el.union(el.connectedNodes()).union(el.source().predecessors()).union(el.target().successors());
    }
    function lightChain(el) {
      cy.batch(() => {
        cy.elements().removeClass("faded hl");
        if (!el || el.empty()) return;
        const on = chainOf(el);
        cy.elements().not(on).not(".lane").addClass("faded");
        on.addClass("hl");
      });
    }
    const close = () => {
      cy.elements().unselect();
      lightChain(null);
      if (opts.onClear) opts.onClear();
    };
    const openNode = (id, members) => {
      const e = d.entityById.get(id); if (!e) return;
      fill(PT.nodePanel(d, e, members || [id], caseId));
    };
    const openEdge = (id, ids) => {
      const e = d.edgeById.get(id); if (!e) return;
      fill(PT.edgePanel(d, e, ids));
    };
    panel.addEventListener("click", (ev) => {
      if (ev.target.closest(".drawer-close")) { close(); return; }
      const a = ev.target.closest("[data-edge]");
      if (a) { ev.preventDefault(); const el = elOfEdge(a.dataset.edge); if (el && el.nonempty()) { cy.elements().unselect(); el.select(); lightChain(el); openEdge(el.data("ids")[0], el.data("ids")); } else openEdge(a.dataset.edge); }
    });
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && cy.$(":selected").nonempty()) close(); });
    cy.on("tap", "node", (ev) => { const n = ev.target; lightChain(n); openNode(n.id(), n.data("members")); if (opts.onSelect) opts.onSelect({ kind: "node", id: n.id() }); });
    cy.on("tap", "edge", (ev) => { const e = ev.target; lightChain(e); openEdge(e.data("ids")[0], e.data("ids")); if (opts.onSelect) opts.onSelect({ kind: "edge", id: e.data("ids")[0] }); });
    cy.on("tap", (ev) => { if (ev.target === cy) close(); });
    cy.on("mouseover", "node, edge", () => { container.style.cursor = "pointer"; });
    cy.on("mouseout", "node, edge", () => { container.style.cursor = ""; });

    const elOfEdge = (id) => { const m = built.origToEl.get(id); return m ? cy.getElementById(m) : cy.collection(); };
    const elOfNode = (id) => cy.getElementById(built.rep.get(id) || id);

    const api = {
      cy,
      get merged() { return merge; },
      setCase(id) { caseId = id; cy.elements().unselect(); api.rebuild(); },
      setMerge(on) { merge = on; api.rebuild(); },
      rebuild() {
        built = build(d, caseId, merge);
        cy.elements().remove(); cy.add(built.els); layout(); fitWhole();
        under.set(lanes && lanes.bands);
      },
      fit() { cy.animate({ fit: { eles: shown(), padding: 20 } }, { duration: 300 }); },
      zoom(f) { cy.animate({ zoom: { level: cy.zoom() * f, renderedPosition: { x: container.clientWidth / 2, y: Math.min(container.clientHeight, window.innerHeight) / 2 } } }, { duration: 200 }); },
      clearFocus() { close(); },
      /* Company list for a side panel, grouped by lane. */
      lanes() {
        const row = (id) => { const n = cy.getElementById(id); return { id, name: n.data("name"), country: n.data("country"), flagged: n.data("flagged"), hidden: n.hasClass("hidden") }; };
        if (lanes) return lanes.lanes.map((l) => ({ title: l.title, rows: l.ids.map(row) }));
        return [{ title: "Companies and people", rows: cy.nodes().not(".lane").map((n) => row(n.id())).sort((a, b) => a.name.localeCompare(b.name)) }];
      },
      /* Highlight matching companies and quieten the rest. Nothing is removed. */
      spotlight(match) {
        let n = 0;
        cy.batch(() => {
          cy.elements().removeClass("sp-dim sp-on sp-risk");
          if (!match) return;
          const nodes = cy.nodes().not(".lane");
          const on = nodes.filter(match.node);
          n = on.length;
          on.addClass(match.risk ? "sp-on sp-risk" : "sp-on");
          nodes.not(on).addClass("sp-dim");
          cy.edges().forEach((e) => {
            const lit = on.has(e.source()) || on.has(e.target());
            e.addClass(lit && (!match.edge || match.edge(e)) ? "sp-on" : "sp-dim");
          });
        });
        return n;
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
        flow.dirty();
      },
      showDetails(id) {
        api.select(id);
        if (d.edgeById.has(id)) { const el = elOfEdge(id); lightChain(el); openEdge(id, el && el.nonempty() ? el.data("ids") : [id]); }
        else { const n = elOfNode(id); lightChain(n); openNode(n.nonempty() ? n.id() : id, n.nonempty() ? n.data("members") : [id]); }
      },
      select(id) {
        cy.elements().unselect();
        const el = d.edgeById.has(id) ? elOfEdge(id) : elOfNode(id);
        if (el && el.nonempty()) el.select();
      },
      get motion() { return flow.on; },
      setMotion(on) { flow.set(on); },
    };
    window.addEventListener("resize", () => { cy.resize(); flow.resize(); });
    (PT._graphs = PT._graphs || []).push(api);
    return api;
  };

  /* Zoom, motion and view controls in the bar above the graph, and the key below it. */
  PT.graphChrome = function (frame, api, opts) {
    if (!api) return;
    const host = opts.toggleHost;
    const roles = ["parent", "officer", "trader", "transit_plant", "us_buyer"];
    host.insertAdjacentHTML("beforeend", `
      <div class="graph-toggles">
        <label><input type="checkbox" data-merge ${api.merged ? "checked" : ""}> Merge duplicate records</label>
        <label><input type="checkbox" data-labels> Product codes on lines</label>
      </div>
      <div class="graph-tools" role="toolbar" aria-label="Graph controls">
        <button type="button" data-z="1.25" title="Zoom in" aria-label="Zoom in">+</button>
        <button type="button" data-z="0.8" title="Zoom out" aria-label="Zoom out">−</button>
        <button type="button" data-fit title="Show the whole network" aria-label="Show the whole network">⤢</button>
        <button type="button" data-motion></button>
      </div>`);
    frame.insertAdjacentHTML("afterend", `
      <div class="graph-key" aria-hidden="true">
        ${roles.map((r) => `<span class="lg-node lg-${r}">${PT.ROLE_STYLE[r].label}</span>`).join("")}
        <span class="lg-node lg-merged">Merged records</span>
        <span class="etype tx"><span class="line"></span>Shipment: left to right</span>
        <span class="etype ct"><span class="line"></span>Ownership: left to right</span>
        <span class="etype inf"><span class="line"></span>Inferred</span>
        <span class="muted">Inside a bucket, companies further from the plant sit further out · thicker blue line = more shipments · ⚑ risk flag · click to trace a chain · drag to pan</span>
      </div>`);
    host.querySelectorAll("[data-z]").forEach((b) => b.addEventListener("click", () => api.zoom(+b.dataset.z)));
    host.querySelector("[data-fit]").addEventListener("click", () => api.fit());
    const mo = host.querySelector("[data-motion]");
    const label = () => { const t = api.motion ? "Pause the moving arrows" : "Play the moving arrows"; mo.textContent = api.motion ? "❚❚" : "▶"; mo.title = t; mo.setAttribute("aria-label", t); };
    label();
    mo.addEventListener("click", () => { api.setMotion(!api.motion); label(); });
    host.querySelector("[data-merge]").addEventListener("change", (e) => { api.setMerge(e.target.checked); if (opts.onRebuild) opts.onRebuild(); });
    host.querySelector("[data-labels]").addEventListener("change", (e) => api.showLabels(e.target.checked));
  };
})(window.PT);
