/* Paper Trail: Case Files page (all cases). */
(function (PT) {
  const LABEL = { detected: "Detected", suggested: "Suggested", not_visible: "Not visible", absent: "Checked: absent" };

  function passportHTML(rows) {
    return `<div class="passport" role="table" aria-label="Passport versus Paper Trail">
      <div class="passport-head"><strong>Passport vs. Paper Trail</strong><span>EU Battery Regulation passport fields · illustrative</span></div>
      ${rows.map((r) => `
        <div class="passport-row${r.gap ? " gap" : ""}" role="row">
          <div class="pf" role="rowheader">${PT.esc(r.field)}<small>Passport field no. ${PT.esc(r.guidance_no)}</small></div>
          <div class="declared" role="cell"><span class="label">What the passport declares</span>${PT.esc(r.declared)}</div>
          <div class="observed" role="cell"><span class="label">What the paper trail shows</span>${PT.esc(r.paper_trail)}
            <div>${r.gap ? `<span class="gap-tag">GAP</span>` : `<span class="ok-tag">CONSISTENT</span>`} <span class="muted" style="font-size:var(--fs-0)">${PT.esc(r.note || "")}</span></div>
          </div>
        </div>`).join("")}
    </div>`;
  }

  function stepHTML(s, d) {
    const edges = s.edge_ids.map((id) => d.edgeById.get(id)).filter(Boolean);
    return `<li>
      <h4 style="font-size:1.1rem;margin-bottom:4px">${PT.esc(s.title)} <span class="muted" style="font-family:var(--mono);font-size:var(--fs-0);font-weight:400">${PT.esc(s.kicker)}</span></h4>
      <p>${PT.esc(s.text)}</p>
      <p class="step-receipts">How we know: ${PT.receipts(s.call_ids)}</p>
      ${edges.length ? `<details><summary>${edges.length} link${edges.length > 1 ? "s" : ""} in this step</summary><div style="margin-top:var(--s-2)">${PT.edgeListHTML(d, edges)}</div></details>` : ""}
    </li>`;
  }

  function verdictList(v) {
    const col = (cls, title, items) => `<div class="col ${cls}"><h3>${title}</h3><ul>${(items || []).map((i) => `<li>${PT.esc(i.text)}<div>${PT.receipts(i.call_ids)}</div></li>`).join("") || "<li class='muted'>None.</li>"}</ul></div>`;
    return `<div class="verdict">${col("detected", "Detected", v.detected)}${col("suggested", "Suggested", v.suggested)}${col("not-visible", "Couldn't see", v.not_visible)}</div>`;
  }

  function caseHTML(c, i, d) {
    const nEdges = d.edges.items.filter((e) => e.case_ids.includes(c.id)).length;
    const nCalls = d.call_log.items.filter((x) => x.case_id === c.id).length;
    return `
      <span class="card-tab">Case file 0${i + 1}</span>
      <div class="card">
        <span class="eyebrow">${PT.esc(c.subtitle || "")}</span>
        <h2>${PT.esc(c.title)}</h2>
        <div class="case-meta">
          <span class="pattern ${PT.esc(c.pattern)}">${PT.esc(PT.PATTERN[c.pattern] || c.pattern)}</span>
          Overall confidence: ${PT.confBadge(c.overall_confidence)}
          <span class="muted" style="font-size:var(--fs-0)">${nEdges} links · ${nCalls} logged calls · plant ${PT.esc(c.plant_status || "")}</span>
          ${PT.checkedHTML(c)}
          <a href="explore.html?case=${PT.esc(c.id)}" class="btn" style="margin-left:auto">Open in Explore →</a>
        </div>
        ${PT.qaHTML(c)}
        <details style="margin-bottom:var(--s-3)"><summary>The full answer in plain English</summary>
          <p style="max-width:52rem;margin-top:var(--s-2)">${PT.esc(c.summary_for_non_experts || "")}</p>
          <p style="max-width:52rem" class="muted">${PT.esc(c.headline)}</p>
        </details>
        <div class="keynums">${(c.key_numbers || []).map((k) => `<div class="keynum"><strong>${PT.esc(k.value)}</strong><span>${PT.esc(k.label)}</span> ${PT.receipts(k.call_ids)}</div>`).join("")}</div>

        <div class="graph-frame" style="margin:var(--s-4) 0">
          <div class="graph mini-graph" id="g-${PT.esc(c.id)}" role="img" aria-label="Network for ${PT.esc(c.title)}; the same links are listed in each step below."></div>
        </div>

        <h3 style="margin-top:var(--s-5)">The trace, step by step</h3>
        <ol class="steps-list">${c.steps.map((s) => stepHTML(s, d)).join("")}</ol>

        <h3 style="margin-top:var(--s-6)">Verdict</h3>
        ${verdictList(c.verdict)}

        <h3 style="margin-top:var(--s-6)">Declared vs. observed</h3>
        <p class="muted">A battery passport is a self-declaration; trade data is an independent check. Rows marked GAP are where due diligence should look. "Declared" values are typical, not from a real passport.</p>
        ${passportHTML(c.passport)}

        <h3 style="margin-top:var(--s-6)">Red flags</h3>
        <div class="table-scroll"><table>
          <thead><tr><th>Flag</th><th>Type</th><th>Result</th><th>Note</th></tr></thead>
          <tbody>${c.red_flags.map((f) => `<tr><td>${PT.esc(f.flag)}</td><td>${PT.etypeTag(f.signal)}</td><td class="result-${f.result}">${LABEL[f.result] || f.result}</td><td class="muted">${PT.esc(f.note)}</td></tr>`).join("")}</tbody>
        </table></div>

        <h3 style="margin-top:var(--s-6)">Caveats</h3>
        <ul>${c.caveats.map((x) => `<li>${PT.esc(x)}</li>`).join("")}</ul>
      </div>`;
  }

  async function init() {
    const out = document.getElementById("case-list");
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(out, e); return; }
    const cases = d.cases.items;
    document.getElementById("case-nav").innerHTML = cases.map((c, i) => `<a href="#${c.id}">${i + 1}. ${PT.esc(c.title)}</a>`).join("");
    out.innerHTML = cases.map((c, i) => `<article id="${c.id}" aria-label="Case ${i + 1}" style="margin-bottom:var(--s-8);scroll-margin-top:80px">${caseHTML(c, i, d)}</article>`).join("");

    // Mini graphs, built when scrolled into view.
    const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || en.target.dataset.done) return;
        en.target.dataset.done = "1";
        PT.graphChrome(en.target.parentElement, PT.Graph(en.target, d, { caseId: en.target.id.slice(2) }));
      });
    }, { rootMargin: "200px" }) : null;
    document.querySelectorAll(".mini-graph").forEach((el) => { if (io) io.observe(el); else PT.graphChrome(el.parentElement, PT.Graph(el, d, { caseId: el.id.slice(2) })); });

    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
