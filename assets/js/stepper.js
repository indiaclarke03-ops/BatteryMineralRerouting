/* Paper Trail: Home page (facts, case cards, per-case stepper, verdict, timeline). */
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
        <ul>${(items || []).map((i) => `<li>${PT.esc(i.text)}<div>${PT.receipts(i.call_ids)}</div></li>`).join("") || "<li class='muted'>Nothing in this column.</li>"}</ul>
      </div>`;
    return col("detected", "Sayari detected", "■", v.detected) +
      col("suggested", "Sayari suggested", "◆", v.suggested) +
      col("not-visible", "Sayari couldn't see", "○", v.not_visible);
  }

  function factsHTML(facts) {
    return facts.map((f) => `<div class="fact"><span class="v">${PT.esc(f.value)}</span><span class="l">${PT.esc(f.label)}</span>
      <span class="s">Source: <a href="${PT.esc(f.url)}" rel="noopener">${PT.esc(f.source)}</a></span></div>`).join("");
  }

  function short(t) {
    return String(t).split(/(?<=[.!?:])\s+/).slice(0, 2).join(" ");
  }

  function caseCardsHTML(cases) {
    return cases.map((c, i) => {
      const k = (c.key_numbers || [])[0];
      return `<a class="case-card p-${PT.esc(c.pattern)}" href="cases.html#${PT.esc(c.id)}">
        <div class="cc-top"><span>Case ${i + 1} · ${PT.esc(PT.country(c.country))}</span><span>${PT.esc(c.plant_status || "")}</span></div>
        <h3>${PT.esc(c.title)}</h3>
        <p class="cc-q">${PT.esc(c.question)}</p>
        <p>${PT.pill(c.answer_label)} ${PT.esc(short(c.answer || c.headline))}</p>
        <span class="pattern ${PT.esc(c.pattern)}">${PT.esc(PT.PATTERN[c.pattern] || c.pattern)}</span>
        ${k ? `<div class="cc-num"><strong>${PT.esc(k.value)}</strong><span>${PT.esc(k.label)}</span></div>` : ""}
        <span class="cc-go">Open case file →</span>
      </a>`;
    }).join("");
  }

  PT.initHome = async function () {
    const status = document.getElementById("home-status");
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(status, e); return; }
    const cases = d.cases.items;
    const sayariN = d.call_log.items.filter((x) => x.server === "sayari").length;
    const tavilyN = d.call_log.items.length - sayariN;
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven"];
    document.getElementById("n-cases").textContent = words[cases.length] || cases.length;
    document.getElementById("call-count").textContent = `${sayariN} Sayari calls · ${tavilyN} Tavily calls · every one logged`;
    const sy = d.call_log.items.filter((x) => x.server === "sayari");
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("tk-calls", sy.length); ["worked", "partial", "failed"].forEach((k) => set("tk-" + k, sy.filter((x) => x.scorecard === k).length));
    document.getElementById("facts").innerHTML = factsHTML(d.overview.facts);
    document.getElementById("case-cards").innerHTML = caseCardsHTML(cases);
    document.getElementById("timeline").innerHTML = timelineHTML(d.policy_timeline.items);

    // Case tabs + stepper
    const tabs = document.getElementById("case-tabs");
    tabs.innerHTML = cases.map((c, i) => `<button type="button" role="tab" data-case="${c.id}" aria-selected="${i === 0}">${i + 1}. ${PT.esc(c.title)}</button>`).join("");
    const graph = PT.Graph(document.getElementById("trace-graph"), d, { caseId: cases[0].id });
    PT.graphChrome(document.getElementById("trace-graph").parentElement, graph);
    const body = document.getElementById("step-body");
    const dots = document.getElementById("step-dots");
    const prev = document.getElementById("step-prev");
    const next = document.getElementById("step-next");
    let c = cases[0];
    let cur = -1;

    function show(i) {
      const steps = c.steps;
      cur = Math.max(0, Math.min(steps.length - 1, i));
      const s = steps[cur];
      body.innerHTML = `
        <span class="kicker">${PT.esc(s.kicker)}</span>
        <h3>${PT.esc(s.title)}</h3>
        <p>${PT.esc(s.text)}</p>
        <div class="step-receipts">How we know: ${PT.receipts(s.call_ids)}</div>`;
      dots.querySelectorAll("button").forEach((b, j) => { if (j === cur) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
      prev.disabled = false;
      next.disabled = cur === steps.length - 1;
      if (graph) graph.highlight(s.edge_ids, s.node_ids);
    }
    function showAll() {
      cur = -1;
      body.innerHTML = `<span class="kicker">Case overview</span><h3>${PT.esc(c.title)}</h3>
        <p><strong>Question:</strong> ${PT.esc(c.question)}</p>
        <p>${PT.pill(c.answer_label)} ${PT.esc(c.answer || c.headline)}</p>
        <p style="font-size:1rem;color:var(--ink-2)"><strong>Why it matters:</strong> ${PT.esc(c.why_it_matters || "")}</p>
        <p class="muted" style="font-size:var(--fs-1)">${c.steps.length} steps. Press <strong>Next</strong> or <span class="kbd">→</span> to start.</p>`;
      dots.querySelectorAll("button").forEach((b) => b.removeAttribute("aria-current"));
      prev.disabled = true; next.disabled = false;
      if (graph) graph.reset();
    }
    function selectCase(id) {
      c = d.caseById.get(id);
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.case === id)));
      dots.innerHTML = c.steps.map((s, i) => `<li><button type="button" data-i="${i}" aria-label="Step ${i + 1}: ${PT.esc(s.title)}">${i + 1}</button></li>`).join("");
      if (graph) graph.setCase(id);
      document.getElementById("verdict-h").textContent = `Verdict for ${c.title}: what Sayari could and couldn't see`;
      document.getElementById("verdict").innerHTML = verdictHTML(c.verdict);
      document.getElementById("trace-list").innerHTML = PT.edgeListHTML(d, d.edges.items.filter((e) => e.case_ids.includes(id)));
      showAll();
    }
    tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) selectCase(b.dataset.case); });
    prev.addEventListener("click", () => { if (cur <= 0) showAll(); else show(cur - 1); });
    next.addEventListener("click", () => show(cur + 1));
    document.getElementById("step-all").addEventListener("click", showAll);
    dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); if (cur <= 0) showAll(); else show(cur - 1); }
    });
    const want = new URLSearchParams(location.search).get("case");
    selectCase(want && d.caseById.has(want) ? want : cases[0].id);
  };
})(window.PT);
