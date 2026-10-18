/* Paper Trail: home page (key numbers, case cards, findings, policy timeline). */
(function (PT) {
  const KEY_DATES = new Set(["2025-07-04", "2026-02-12", "2026-03-12"]);

  function timelineHTML(items) {
    const rows = items.filter((t) => t.verified);
    return `<ol class="timeline" style="--n:${rows.length}">${rows.map((t) => `
      <li class="${KEY_DATES.has(t.date) ? "key" : ""}">
        <time datetime="${t.date}">${PT.fmtDate(t.date)}</time>
        <strong>${PT.esc(t.measure.replace(/\s*\(.*?\)\s*/g, " ").trim())}</strong>
        <p>${PT.esc(t.relevance)}</p>
        <a href="${PT.esc(t.source_url)}" rel="noopener">Source</a>
      </li>`).join("")}</ol>`;
  }

  function factsHTML(facts) {
    return facts.map((f) => `<div class="fact"><span class="v">${PT.esc(f.value)}</span><span class="l">${PT.esc(f.label)}</span>
      <span class="s">Source: <a href="${PT.esc(f.url)}" rel="noopener">${PT.esc(f.source)}</a></span></div>`).join("");
  }

  function caseCardsHTML(cases) {
    return cases.map((c, i) => `
      <a class="case-card simple p-${PT.esc(c.pattern)}" href="cases.html#${PT.esc(c.id)}">
        <div class="cc-top"><span>Case ${i + 1}</span><span>${PT.esc(PT.country(c.country))}</span></div>
        <h3>${PT.esc(c.title)}</h3>
        <div>${PT.pill(c.answer_label)}</div>
        <p>${PT.esc(c.answer_short || c.answer)}</p>
        <span class="cc-go">Read the case →</span>
      </a>`).join("");
  }

  PT.initHome = async function () {
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(document.getElementById("case-cards"), e); return; }
    const cases = d.cases.items;
    const sy = d.call_log.items.filter((x) => x.server === "sayari");
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("n-cases", words[cases.length] || cases.length);
    set("call-count", `${sy.length} Sayari queries · ${d.call_log.items.length - sy.length} source checks · all published`);
    set("tk-calls", sy.length);
    ["worked", "partial", "failed"].forEach((k) => set("tk-" + k, sy.filter((x) => x.scorecard === k).length));
    document.getElementById("facts").innerHTML = factsHTML(d.overview.facts);
    document.getElementById("case-cards").innerHTML = caseCardsHTML(cases);
    document.getElementById("timeline").innerHTML = timelineHTML(d.policy_timeline.items);
    if (PT.initMap) PT.initMap(document.getElementById("map"), document.getElementById("map-card"), d);
  };
})(window.PT);
