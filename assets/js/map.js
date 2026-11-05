/* Paper Trail | Minerals: world map of the traced supply chains (D3 + TopoJSON, no map tiles).
   Choosing a plant turns the map to fit its route, then plays the route one step at a time. */
(function (PT) {
  const COL = { input: "#1F5FBF", output: "#0F5E5C", planned: "#5E5D57", owner: "#6B3FA0" };
  const W = 1200, H = 680;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const wrap = (x) => ((x + 540) % 360) - 180;
  const fmtRange = (a, b) => (!a && !b ? "" : a && b && a !== b ? `${PT.fmtDate(a)} – ${PT.fmtDate(b)}` : PT.fmtDate(a || b));

  /* Sample a great-circle leg, for working out where a route fits. */
  function samples(places, leg) {
    const a = [places[leg.from].lon, places[leg.from].lat], b = [places[leg.to].lon, places[leg.to].lat];
    const f = d3.geoInterpolate(a, b);
    return d3.range(0, 1.001, 0.05).map(f);
  }

  /* Find the map centre and zoom that show a whole route without any line crossing the map's edge. */
  function fitRoute(steps, places, k0) {
    const lines = [], pts = [];
    steps.forEach((s) => {
      (s.legs || []).forEach((l) => { const c = samples(places, l); lines.push(c); pts.push(...c); });
      if (s.at) pts.push([places[s.at].lon, places[s.at].lat]);
    });
    const p = d3.geoNaturalEarth1().scale(k0).translate([0, 0]);
    let best = null;
    for (let lam = -180; lam < 180; lam += 5) {
      const crosses = lines.some((c) => c.some((q, i) => i && Math.abs(wrap(q[0] - lam) - wrap(c[i - 1][0] - lam)) > 180));
      if (crosses) continue;
      p.rotate([-lam, 0]);
      const xy = pts.map((q) => p(q));
      const [x0, x1] = d3.extent(xy, (q) => q[0]), [y0, y1] = d3.extent(xy, (q) => q[1]);
      const need = Math.max((x1 - x0) / (W - 300), (y1 - y0) / (H - 240));
      if (!best || need < best.need) best = { lam, need, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
    }
    if (!best) return null;
    const k = k0 * Math.max(1, Math.min(3.2, 1 / best.need));
    const z = k / k0;
    return { lam: best.lam, k, tx: W / 2 - best.cx * z, ty: H / 2 - 30 - best.cy * z };
  }

  PT.initMap = async function (el, side, d) {
    if (typeof d3 === "undefined" || typeof topojson === "undefined") {
      el.innerHTML = `<p class="graph-fallback">The map couldn't load. The case cards below have the same information.</p>`;
      return;
    }
    let world;
    try { world = await (await fetch("data/world-110m.json")).json(); } catch (e) { el.innerHTML = `<p class="graph-fallback">The map data couldn't load.</p>`; return; }
    const { places, flows, routes } = d.curated.map;
    const screening = d.curated.screening;
    const countries = topojson.feature(world, world.objects.countries);
    countries.features = countries.features.filter((f) => f.id !== "010"); // drop Antarctica
    const involved = new Set(["156", "360", "504", "512", "410", "458", "840", "508", "348", "450", "392"]); // CHN IDN MAR OMN KOR MYS USA MOZ HUN MDG JPN

    const k0 = d3.geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: "Sphere" }).scale() * 1.14;
    const IDLE = { lam: 128, k: k0, tx: W / 2, ty: H / 2 + 44 }; // Pacific-centred, nudged north where most plants are
    let cam = { ...IDLE };
    const proj = d3.geoNaturalEarth1();
    const path = d3.geoPath(proj);
    const setCam = (c) => proj.rotate([-c.lam, 0]).scale(c.k).translate([c.tx, c.ty]);
    const line = (leg) => ({ type: "LineString", coordinates: [[places[leg.from].lon, places[leg.from].lat], [places[leg.to].lon, places[leg.to].lat]] });

    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("class", "map-svg");
    svg.append("rect").attr("width", W).attr("height", H).attr("class", "map-sea");
    const defs = svg.append("defs");
    Object.entries(COL).forEach(([k, c]) => defs.append("marker").attr("id", `ma-${k}`).attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5)
      .attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto-start-reverse").append("path").attr("d", "M0,0 L10,5 L0,10 z").attr("fill", c));

    const sphere = svg.append("path").attr("class", "map-sphere");
    const grat = svg.append("path").attr("class", "map-grat");
    const land = svg.append("g").selectAll("path").data(countries.features).join("path")
      .attr("class", (f) => "map-country" + (involved.has(String(f.id)) ? " involved" : ""));
    const flowSel = svg.append("g").selectAll("path").data(flows).join("path")
      .attr("class", (f) => `map-flow t-${f.type}`)
      .attr("stroke", (f) => COL[f.type]).attr("marker-end", (f) => `url(#ma-${f.type})`);
    flowSel.append("title").text((f) => f.label);
    const gRoute = svg.append("g");

    const caseIndex = new Map(d.cases.items.map((c, i) => [c.id, i + 1]));
    const pts = Object.entries(places).map(([k, p]) => ({ key: k, ...p }));
    const node = svg.append("g").selectAll("g").data(pts).join("g")
      .attr("class", (p) => `map-pt k-${p.kind}` + (p.case && (d.caseById.get(p.case) || {}).plant_status !== "operating" ? " planned" : ""))
      .attr("tabindex", (p) => (p.kind === "plant" ? 0 : null))
      .attr("role", (p) => (p.kind === "plant" ? "button" : null))
      .attr("aria-label", (p) => (p.kind === "plant" ? `Case ${caseIndex.get(p.case)}: play the route for ${p.name}` : null))
      .attr("aria-hidden", (p) => (p.kind === "plant" ? null : "true"));
    node.append("circle").attr("class", "pulse").attr("r", 12);
    node.append("circle").attr("class", "dot").attr("r", (p) => (p.kind === "plant" ? 12 : p.kind === "buyers" ? 10 : 5.5));
    node.filter((p) => p.kind === "plant").append("text").attr("class", "map-num").attr("dy", "0.35em").text((p) => caseIndex.get(p.case));
    const labels = node.append("text").attr("class", "map-label").text((p) => p.name.split(/,| & /)[0]);

    function draw() {
      setCam(cam);
      sphere.attr("d", path({ type: "Sphere" }));
      grat.attr("d", path(d3.geoGraticule10()));
      land.attr("d", path);
      flowSel.attr("d", (f) => path(line(f)));
      node.attr("transform", (p) => { const q = proj([p.lon, p.lat]); return `translate(${q[0]},${q[1]})`; });
      labels.each(function (p) {
        const right = proj([p.lon, p.lat])[0] > W - 170;
        if (p.kind === "buyers") d3.select(this).attr("text-anchor", "middle").attr("y", -18); // sits above, clear of nearby plants
        else d3.select(this).attr("text-anchor", right ? "end" : "start").attr("x", right ? -18 : 18).attr("dy", "0.35em");
      });
    }
    draw();

    const tip = document.createElement("div");
    tip.className = "graph-tip"; tip.hidden = true; el.appendChild(tip);
    const cap = document.createElement("div");
    cap.className = "map-cap"; cap.hidden = true; cap.setAttribute("aria-live", "polite");
    el.appendChild(cap);

    /* Expanded view: the map takes the whole window, because its width is what limits its size.
       The case list stays one click away as a panel over the map. */
    const wrapEl = el.parentElement;
    const tools = document.createElement("div");
    tools.className = "map-tools";
    tools.innerHTML = `<button type="button" data-list hidden aria-expanded="false">Show case list</button>
      <button type="button" data-expand><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1 4.5V1h3.5M7.5 1H11v3.5M11 7.5V11H7.5M4.5 11H1V7.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span>Expand map</span></button>`;
    el.appendChild(tools);
    const expandBtn = tools.querySelector("[data-expand]"), listBtn = tools.querySelector("[data-list]");
    let inerted = [];
    function setList(on) {
      wrapEl.classList.toggle("list-open", on);
      listBtn.textContent = on ? "Hide case list" : "Show case list";
      listBtn.setAttribute("aria-expanded", String(on));
      if (on && openCase) listEl.scrollTop = itemOf(openCase).offsetTop - listEl.offsetTop;
    }
    function setExpanded(on) {
      wrapEl.classList.toggle("expanded", on);
      document.documentElement.classList.toggle("map-open", on);
      expandBtn.querySelector("span").textContent = on ? "Close" : "Expand map";
      listBtn.hidden = !on;
      setList(false);
      inerted.forEach((n) => { n.inert = false; });
      inerted = [];
      if (on) { // keep keyboard focus inside the expanded map
        for (let n = wrapEl; n !== document.body; n = n.parentElement) {
          [...n.parentElement.children].forEach((x) => { if (x !== n && !x.inert && x.tagName !== "SCRIPT") { x.inert = true; inerted.push(x); } });
        }
      }
    }
    expandBtn.addEventListener("click", () => setExpanded(!wrapEl.classList.contains("expanded")));
    listBtn.addEventListener("click", () => setList(!wrapEl.classList.contains("list-open")));
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && wrapEl.classList.contains("expanded")) { setExpanded(false); expandBtn.focus(); } });

    /* Side list: one row per case, opening to its route steps and a drop-down with more about the case. */
    const STAGE = (s) => `<span class="ms-stage s-${PT.esc(s.toLowerCase())}">${PT.esc(s)}</span>`;
    const stepConf = (s) => (s.legs || [s]).map((x) => x.confidence).filter(Boolean)[0];
    const stepDates = (s) => {
      const ls = s.legs || [s];
      const a = ls.map((x) => x.first_seen).filter(Boolean).sort()[0], b = ls.map((x) => x.last_seen).filter(Boolean).sort().pop();
      return fmtRange(a, b);
    };
    function stepsHTML(cid) {
      return `<ol class="ms-steps">${routes[cid].map((s, i) => {
        const conf = stepConf(s), dates = stepDates(s);
        return `<li><button type="button" class="ms-step" data-step="${i}">
          <span class="ms-top">${STAGE(s.stage)}<strong>${PT.esc(s.title)}</strong></span>
          <span class="ms-text">${PT.esc(s.text)}</span>
          ${s.gap ? `<span class="ms-gap">${PT.esc(s.gap)}</span>` : ""}
          ${conf || dates ? `<span class="ms-meta">${conf ? `<span class="ms-conf c-${PT.esc(conf)}">${PT.esc(PT.CONF[conf].label)}</span>` : ""}${dates ? `<span>${PT.esc(dates)}</span>` : ""}</span>` : ""}
        </button></li>`;
      }).join("")}</ol>`;
    }
    function moreHTML(c) {
      const s = screening[c.id] || {};
      return `<details class="ms-more"><summary>See more about this case</summary><div class="ms-more-body">
        <p class="ms-q"><span class="qa-label">The question</span>${PT.esc(c.question)}</p>
        <p><span class="qa-label">What we found</span>${PT.pill(c.answer_label)} ${PT.esc(c.answer)}</p>
        <p><span class="qa-label">Why it matters</span>${PT.esc(c.why_it_matters)}</p>
        <dl class="mc-facts">
          <dt>Status</dt><dd>${PT.esc(s.status || c.plant_status || "")}</dd>
          <dt>Ultimate owner</dt><dd>${PT.esc(s.owner_top || "")}</dd>
          <dt>Chinese-owned?</dt><dd><strong>${PT.esc(s.chinese_owned || "–")}</strong> ${s.confidence ? PT.confBadge(s.confidence) : ""}</dd>
        </dl>
        <p class="mc-links"><a href="cases.html#${c.id}">Read the case →</a> <a href="explore.html?case=${c.id}">See the network →</a></p>
      </div></details>`;
    }
    side.innerHTML = `<div class="ms-head"><strong>${d.cases.items.length} traced supply chains</strong><span class="muted">Choose one to watch its route</span></div>
      <ol class="ms-list">${d.cases.items.map((c, i) => `<li class="ms-item" data-case="${c.id}">
        <button type="button" class="ms-row" aria-expanded="false"><span class="ms-n">${i + 1}</span><span class="ms-t">${PT.esc(c.title)}</span><span class="ms-chev" aria-hidden="true"></span></button>
        <div class="ms-body" hidden></div></li>`).join("")}</ol>`;
    const listEl = side.querySelector(".ms-list");
    const itemOf = (cid) => side.querySelector(`.ms-item[data-case="${cid}"]`);

    /* Route playback. Every new play or jump bumps `run`, which stops the one before it. */
    let run = 0, openCase = null;
    const placesOf = (steps) => new Set(steps.flatMap((s) => (s.legs || []).flatMap((l) => [l.from, l.to]).concat(s.at ? [s.at] : [])));

    function clearRoute() { gRoute.selectAll("*").remove(); node.classed("pulsing", false).classed("on-route", false); }
    function addLeg(leg) {
      return gRoute.append("path").attr("class", `route-leg t-${leg.type}`).attr("stroke", COL[leg.type]);
    }
    function finishLeg(sel, leg) { sel.attr("d", path(line(leg))).attr("marker-end", `url(#ma-${leg.type})`); }
    function drawLeg(leg, dur, id) {
      const sel = addLeg(leg);
      const ghost = document.createElementNS("http://www.w3.org/2000/svg", "path");
      ghost.setAttribute("d", path(line(leg)));
      const len = ghost.getTotalLength();
      const pts2 = d3.range(0, 1.0001, 1 / 90).map((t) => ghost.getPointAtLength(t * len));
      const head = gRoute.append("circle").attr("class", "route-head").attr("r", 7).attr("fill", COL[leg.type]);
      return new Promise((res) => {
        const t0 = performance.now();
        const tick = (now) => {
          if (id !== run) { head.remove(); res(false); return; }
          const p = d3.easeCubicInOut(Math.min(1, (now - t0) / dur));
          const n = Math.max(1, Math.round(p * (pts2.length - 1)));
          sel.attr("d", "M" + pts2.slice(0, n + 1).map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join("L"));
          head.attr("cx", pts2[n].x).attr("cy", pts2[n].y);
          if (p < 1) requestAnimationFrame(tick);
          else { head.remove(); finishLeg(sel, leg); res(true); }
        };
        requestAnimationFrame(tick);
      });
    }
    function setStep(cid, i) {
      const steps = routes[cid], s = steps[i], item = itemOf(cid);
      item.querySelectorAll(".ms-step").forEach((b, n) => { b.classList.toggle("now", n === i); b.classList.toggle("done", n < i); });
      const dest = new Set((s.legs || []).map((l) => l.to).concat(s.at ? [s.at] : []));
      node.classed("pulsing", (p) => dest.has(p.key));
      const c = d.caseById.get(cid);
      cap.innerHTML = `<div class="mc-text"><span class="mc-case">Case ${caseIndex.get(cid)} · ${PT.esc(c.title)}</span>
          <span class="mc-line">${STAGE(s.stage)}<strong>${PT.esc(s.title)}</strong></span>
          <span class="mc-prog">Step ${i + 1} of ${steps.length}</span></div>
        <div class="mc-btns"><button type="button" data-replay>↻ Replay</button><button type="button" data-all>All plants</button></div>`;
    }
    function camTo(target, id) {
      if (reduced()) { cam = target; draw(); return Promise.resolve(); }
      const to = { ...target, lam: cam.lam + wrap(target.lam - cam.lam) };
      const i = d3.interpolate(cam, to);
      return new Promise((res) => {
        const t0 = performance.now();
        const tick = (now) => {
          if (id !== run) { res(); return; }
          const p = Math.min(1, (now - t0) / 900);
          cam = i(d3.easeCubicInOut(p)); draw();
          if (p < 1) requestAnimationFrame(tick); else { cam = target; res(); }
        };
        requestAnimationFrame(tick);
      });
    }
    function showTo(cid, i) { // draw steps 0..i at once
      clearRoute();
      const steps = routes[cid];
      cam = fitRoute(steps, places, k0) || IDLE; draw(); // finish any camera move still under way
      const on = placesOf(steps);
      node.classed("on-route", (p) => on.has(p.key));
      steps.slice(0, i + 1).forEach((s) => (s.legs || []).forEach((l) => finishLeg(addLeg(l), l)));
      setStep(cid, i);
    }
    async function play(cid) {
      const id = ++run, steps = routes[cid];
      clearRoute();
      const on = placesOf(steps);
      node.classed("off", (p) => !on.has(p.key)).classed("on-route", (p) => on.has(p.key));
      flowSel.classed("off", true);
      cap.hidden = false;
      setStep(cid, 0);
      node.classed("pulsing", false);
      await camTo(fitRoute(steps, places, k0) || IDLE, id);
      if (id !== run) return;
      if (reduced()) { showTo(cid, steps.length - 1); return; }
      for (let i = 0; i < steps.length; i++) {
        setStep(cid, i);
        const legs = steps[i].legs || [];
        if (legs.length) await Promise.all(legs.map((l, n) => wait(n * 180).then(() => (id === run ? drawLeg(l, 1500, id) : false))));
        await wait(legs.length ? 750 : 1500);
        if (id !== run) return;
      }
      node.classed("pulsing", false);
      itemOf(cid).querySelectorAll(".ms-step").forEach((b) => { b.classList.remove("now"); b.classList.add("done"); });
    }
    function closeRow() {
      if (!openCase) return;
      const item = itemOf(openCase);
      item.classList.remove("open");
      item.querySelector(".ms-row").setAttribute("aria-expanded", "false");
      const body = item.querySelector(".ms-body"); body.hidden = true; body.innerHTML = "";
      openCase = null;
    }
    function open(cid) {
      closeRow();
      openCase = cid;
      const item = itemOf(cid), c = d.caseById.get(cid);
      item.classList.add("open");
      item.querySelector(".ms-row").setAttribute("aria-expanded", "true");
      const body = item.querySelector(".ms-body");
      body.innerHTML = stepsHTML(cid) + moreHTML(c); body.hidden = false;
      listEl.scrollTop = item.offsetTop - listEl.offsetTop;
      if (window.matchMedia("(max-width: 979px)").matches) el.scrollIntoView({ block: "start", behavior: reduced() ? "auto" : "smooth" });
      node.classed("active", (q) => q.case === cid);
      play(cid);
    }
    async function idle() {
      const id = ++run;
      closeRow();
      clearRoute();
      cap.hidden = true;
      node.classed("active", false).classed("off", false);
      flowSel.classed("off", false);
      await camTo(IDLE, id);
    }

    node.on("click", (ev, p) => { if (p.kind === "plant") { if (openCase === p.case) play(p.case); else open(p.case); } })
      .on("keydown", (ev, p) => { if (p.kind === "plant" && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); open(p.case); } })
      .on("mouseenter", (ev, p) => {
        tip.innerHTML = `<strong>${PT.esc(p.name)}</strong>${p.note ? `<br>${PT.esc(p.note)}` : ""}${p.kind === "plant" ? `<br><span class="muted">Click to play the route</span>` : ""}`;
        tip.hidden = false;
      })
      .on("mousemove", (ev) => { const r = el.getBoundingClientRect(); tip.style.left = Math.min(ev.clientX - r.left + 14, r.width - 270) + "px"; tip.style.top = (ev.clientY - r.top + 14) + "px"; })
      .on("mouseleave", () => { tip.hidden = true; });
    side.addEventListener("click", (ev) => {
      const row = ev.target.closest(".ms-row");
      if (row) { const cid = row.closest(".ms-item").dataset.case; if (openCase === cid) idle(); else open(cid); return; }
      const st = ev.target.closest(".ms-step");
      if (st) { run++; showTo(openCase, +st.dataset.step); }
    });
    cap.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-replay]") && openCase) play(openCase);
      if (ev.target.closest("[data-all]")) idle();
    });
  };
})(window.PT);
