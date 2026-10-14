/* Paper Trail: Home page (policy strip, 5-step trace, verdict). */
(function (PT) {
  const KEY_DATES = new Set(["2025-07-04", "2026-02-12", "2026-03-12"]);

  function timelineHTML(items) {
    const rows = items.filter((t) => t.verified);
    return `<ol class="timeline" style="--n:${rows.length}">${rows.map((t) => `
      <li class="${KEY_DATES.has(t.date) ? "key" : ""}">
        <time datetime="${t.date}">${PT.fmtDate(t.date)}</time>
        <strong>${PT.esc(t.measure.replace(/\s*\(.*?\)\s*/g, " ").trim())}</strong>
        <p>${PT.esc(t.relevance)}</p>
        <a href="${PT.esc(t.source_url)}" rel="noopener">Source</a> ${PT.receipts(t.source_call_ids)}
      </li>`).join("")}</ol>`;
  }

  function verdictHTML(v) {
    const col = (cls, title, icon, items) => `
      <div class="col ${cls}">
        <h3><span aria-hidden="true">${icon}</span>${title}</h3>
        <ul>${items.map((i) => `<li>${PT.esc(i.text)}<div>${PT.receipts(i.call_ids)}</div></li>`).join("")}</ul>
      </div>`;
    return col("detected", "Sayari detected", "■", v.detected) +
      col("suggested", "Sayari suggested", "◆", v.suggested) +
      col("not-visible", "Sayari couldn't see", "○", v.not_visible);
  }

  PT.initHome = async function () {
    const status = document.getElementById("home-status");
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(status, e); return; }
    const c = d.cases.items[0];
    const sayariN = d.call_log.items.filter((x) => x.server === "sayari").length;
    const tavilyN = d.call_log.items.length - sayariN;

    document.getElementById("call-count").textContent = `${sayariN} Sayari calls · ${tavilyN} Tavily calls`;
    document.getElementById("headline").textContent = c.headline;
    document.getElementById("timeline").innerHTML = timelineHTML(d.policy_timeline.items);
    document.getElementById("verdict").innerHTML = verdictHTML(c.verdict);

    // Stepper
    const steps = c.steps;
    const graph = PT.Graph(document.getElementById("trace-graph"), d, { locked: false });
    const body = document.getElementById("step-body");
    const dots = document.getElementById("step-dots");
    const prev = document.getElementById("step-prev");
    const next = document.getElementById("step-next");
    const all = document.getElementById("step-all");
    dots.innerHTML = steps.map((s, i) => `<li><button type="button" data-i="${i}" aria-label="Step ${i + 1}: ${PT.esc(s.title)}">${i + 1}</button></li>`).join("");
    let cur = -1;

    function show(i) {
      cur = Math.max(0, Math.min(steps.length - 1, i));
      const s = steps[cur];
      body.innerHTML = `
        <span class="kicker">${PT.esc(s.kicker)}</span>
        <h3>${PT.esc(s.title)}</h3>
        <p>${PT.esc(s.text)}</p>
        <div class="step-receipts">How we know: ${PT.receipts(s.call_ids)}</div>`;
      dots.querySelectorAll("button").forEach((b, j) => { if (j === cur) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
      prev.disabled = cur === 0;
      next.disabled = cur === steps.length - 1;
      if (graph) graph.highlight(s.edge_ids, s.node_ids);
    }
    function showAll() {
      cur = -1;
      body.innerHTML = `<span class="kicker">Full network</span><h3>Everything we traced</h3>
        <p>All entities and links for Case 1. Use the arrow buttons or the <span class="kbd">←</span> <span class="kbd">→</span> keys to walk through it in five steps.</p>`;
      dots.querySelectorAll("button").forEach((b) => b.removeAttribute("aria-current"));
      prev.disabled = true; next.disabled = false;
      if (graph) graph.reset();
    }
    prev.addEventListener("click", () => show(cur - 1));
    next.addEventListener("click", () => show(cur + 1));
    all.addEventListener("click", showAll);
    dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); if (cur <= 0) showAll(); else show(cur - 1); }
    });
    showAll();

    // List view for phones / screen readers
    document.getElementById("trace-list").innerHTML = PT.edgeListHTML(d, d.edges.items);
  };
})(window.PT);
