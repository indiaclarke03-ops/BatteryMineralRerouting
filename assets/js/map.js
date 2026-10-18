/* Paper Trail: world map of the traced supply chains (D3 + TopoJSON, no map tiles). */
(function (PT) {
  const COL = { input: "#1F5FBF", output: "#1F5FBF", planned: "#6E6D66", owner: "#6B3FA0" };
  const W = 960, H = 540;

  PT.initMap = async function (el, card, d) {
    if (typeof d3 === "undefined" || typeof topojson === "undefined") {
      el.innerHTML = `<p class="graph-fallback">The map couldn't load. The case cards below have the same information.</p>`;
      return;
    }
    let world;
    try { world = await (await fetch("data/world-110m.json")).json(); } catch (e) { el.innerHTML = `<p class="graph-fallback">The map data couldn't load.</p>`; return; }
    const { places, flows } = d.curated.map;
    const screening = d.curated.screening;
    const countries = topojson.feature(world, world.objects.countries);
    countries.features = countries.features.filter((f) => f.id !== "010"); // drop Antarctica
    const involved = new Set(["156", "360", "504", "512", "410", "458", "840", "508"]); // CHN IDN MAR OMN KOR MYS USA MOZ

    const proj = d3.geoNaturalEarth1().rotate([-128, 0]).fitExtent([[6, 6], [W - 6, H - 6]], { type: "Sphere" });
    // Crop the poles slightly and nudge north, where most of the plants are.
    proj.scale(proj.scale() * 1.12).translate([W / 2, H / 2 + 40]);
    const path = d3.geoPath(proj);
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("class", "map-svg");
    svg.append("rect").attr("width", W).attr("height", H).attr("class", "map-sea");
    const defs = svg.append("defs");
    Object.entries(COL).forEach(([k, c]) => defs.append("marker").attr("id", `ma-${k}`).attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5)
      .attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse").append("path").attr("d", "M0,0 L10,5 L0,10 z").attr("fill", c));

    svg.append("path").attr("d", path({ type: "Sphere" })).attr("class", "map-sphere");
    svg.append("path").attr("d", path(d3.geoGraticule10())).attr("class", "map-grat");
    svg.append("g").selectAll("path").data(countries.features).join("path")
      .attr("d", path).attr("class", (f) => "map-country" + (involved.has(String(f.id)) ? " involved" : ""));

    const gFlows = svg.append("g");
    const flowSel = gFlows.selectAll("path").data(flows).join("path")
      .attr("d", (f) => path({ type: "LineString", coordinates: [[places[f.from].lon, places[f.from].lat], [places[f.to].lon, places[f.to].lat]] }))
      .attr("class", (f) => `map-flow t-${f.type}`)
      .attr("stroke", (f) => COL[f.type]).attr("marker-end", (f) => `url(#ma-${f.type})`);
    flowSel.append("title").text((f) => f.label);

    const tip = document.createElement("div");
    tip.className = "graph-tip"; tip.hidden = true; el.appendChild(tip);

    const caseIndex = new Map(d.cases.items.map((c, i) => [c.id, i + 1]));
    const pts = Object.entries(places).map(([k, p]) => ({ key: k, ...p, xy: proj([p.lon, p.lat]) }));
    const gPts = svg.append("g");
    const node = gPts.selectAll("g").data(pts).join("g")
      .attr("class", (p) => `map-pt k-${p.kind}` + (p.case && (d.caseById.get(p.case) || {}).plant_status !== "operating" ? " planned" : ""))
      .attr("transform", (p) => `translate(${p.xy[0]},${p.xy[1]})`)
      .attr("tabindex", (p) => (p.kind === "plant" ? 0 : null))
      .attr("role", (p) => (p.kind === "plant" ? "button" : null))
      .attr("aria-label", (p) => (p.kind === "plant" ? `Case ${caseIndex.get(p.case)}: ${p.name}` : null))
      .attr("aria-hidden", (p) => (p.kind === "plant" ? null : "true"));
    node.append("circle").attr("r", (p) => (p.kind === "plant" ? 11 : p.kind === "buyers" ? 10 : 5));
    node.filter((p) => p.kind === "plant").append("text").attr("class", "map-num").attr("dy", "0.35em").text((p) => caseIndex.get(p.case));

    function show(p) {
      if (!p || p.kind !== "plant") return;
      const c = d.caseById.get(p.case);
      const s = screening[p.case] || {};
      node.classed("active", (q) => q.key === p.key);
      flowSel.classed("dim", (f) => f.case !== p.case).classed("hot", (f) => f.case === p.case);
      card.innerHTML = `
        <span class="eyebrow">Case ${caseIndex.get(p.case)} · ${PT.esc(p.name)}</span>
        <h3>${PT.esc(c.title)}</h3>
        <dl class="mc-facts">
          <dt>Status</dt><dd>${PT.esc(s.status || c.plant_status || "")}</dd>
          <dt>Ultimate owner</dt><dd>${PT.esc(s.owner_top || "")}</dd>
          <dt>Chinese-owned?</dt><dd><strong>${PT.esc(s.chinese_owned || "–")}</strong> ${s.confidence ? PT.confBadge(s.confidence) : ""}</dd>
        </dl>
        <p>${PT.pill(c.answer_label)} ${PT.esc(c.answer_short)}</p>
        <p class="mc-links"><a href="cases.html#${c.id}">Read the case →</a> <a href="explore.html?case=${c.id}">See the network →</a></p>
        <p style="margin:var(--s-3) 0 0"><button type="button" class="linkish" data-reset>← All plants</button></p>`;
    }
    function idle() {
      node.classed("active", false); flowSel.classed("dim", false).classed("hot", false);
      card.innerHTML = `<span class="eyebrow">Choose a plant</span><h3>${d.cases.items.length} cases on the map</h3>
        <p class="muted">Click a numbered dot, or pick from the list.</p>
        <ul class="mc-list">${d.cases.items.map((c, i) => `<li><button type="button" data-case="${c.id}"><span>${i + 1}</span>${PT.esc(c.title)}</button></li>`).join("")}</ul>`;
    }
    node.on("click", (ev, p) => show(p))
      .on("keydown", (ev, p) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); show(p); } })
      .on("mouseenter", (ev, p) => {
        tip.innerHTML = `<strong>${PT.esc(p.name)}</strong>${p.note ? `<br>${PT.esc(p.note)}` : ""}${p.kind === "plant" ? `<br><span class="muted">Click for the finding</span>` : ""}`;
        tip.hidden = false;
      })
      .on("mousemove", (ev) => { const r = el.getBoundingClientRect(); tip.style.left = Math.min(ev.clientX - r.left + 14, r.width - 270) + "px"; tip.style.top = (ev.clientY - r.top + 14) + "px"; })
      .on("mouseleave", () => { tip.hidden = true; });
    card.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-case]");
      if (b) show(pts.find((p) => p.case === b.dataset.case));
      if (ev.target.closest("[data-reset]")) idle();
    });
    svg.on("click", (ev) => { if (ev.target.tagName === "path" && ev.target.classList.contains("map-sphere")) idle(); });
    idle();
  };
})(window.PT);
