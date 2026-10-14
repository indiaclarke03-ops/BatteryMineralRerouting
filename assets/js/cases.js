/* Paper Trail: Case Files page. */
(function (PT) {
  function passportHTML(rows) {
    return `<div class="passport" role="table" aria-label="Passport versus Paper Trail">
      <div class="passport-head"><strong>Passport vs. Paper Trail</strong><span>EU Battery Regulation passport fields · illustrative</span></div>
      ${rows.map((r) => `
        <div class="passport-row${r.gap ? " gap" : ""}" role="row">
          <div class="pf" role="rowheader">${PT.esc(r.field)}<small>Passport field no. ${PT.esc(r.guidance_no)}</small></div>
          <div class="declared" role="cell"><span class="label">What the passport declares</span>${PT.esc(r.declared)}</div>
          <div class="observed" role="cell"><span class="label">What the paper trail shows</span>${PT.esc(r.paper_trail)}
            <div>${r.gap ? `<span class="gap-tag">GAP</span>` : `<span class="ok-tag">CONSISTENT</span>`} <span class="muted" style="font-size:var(--fs-0)">${PT.esc(r.note)}</span></div>
          </div>
        </div>`).join("")}
    </div>`;
  }

  function stepHTML(s, d) {
    const edges = s.edge_ids.map((id) => d.edgeById.get(id));
    return `<li>
      <h3 style="font-size:1.15rem;margin-bottom:4px">${PT.esc(s.title)} <span class="muted" style="font-family:var(--mono);font-size:var(--fs-0);font-weight:400">${PT.esc(s.kicker)}</span></h3>
      <p>${PT.esc(s.text)}</p>
      <p class="step-receipts">How we know: ${PT.receipts(s.call_ids)}</p>
      ${edges.length ? `<details><summary>${edges.length} link${edges.length > 1 ? "s" : ""} in this step</summary><div style="margin-top:var(--s-2)">${PT.edgeListHTML(d, edges)}</div></details>` : ""}
    </li>`;
  }

  async function init() {
    const out = document.getElementById("case-1");
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(out, e); return; }
    const c = d.cases.items[0];
    const label = { detected: "Detected", suggested: "Suggested", not_visible: "Not visible" };

    out.innerHTML = `
      <span class="card-tab">Case file 01</span>
      <div class="card">
        <span class="eyebrow">${PT.esc(c.subtitle)}</span>
        <h2>${PT.esc(c.title)}</h2>
        <div class="case-meta">Overall confidence: ${PT.confBadge(c.overall_confidence)}
          <a href="index.html" class="btn" style="margin-left:auto">Walk through it on the graph →</a></div>
        <p><strong>Question.</strong> ${PT.esc(c.question)}</p>
        <p class="headline">${PT.esc(c.headline)}</p>

        <h3 style="margin-top:var(--s-6)">The trace in five steps</h3>
        <ol class="steps-list">${c.steps.map((s) => stepHTML(s, d)).join("")}</ol>

        <h3 style="margin-top:var(--s-6)">Declared vs. observed</h3>
        <p class="muted">A battery passport is a self-declaration; trade data is an independent check. The rows marked GAP are where due diligence should look. Field names are from the EU Battery Regulation passport, as used in <a href="https://indiaclarke03-ops.github.io/EthicalBatterySourcing/">Battery Passport Audit</a>. "Declared" values are typical, not taken from a real passport.</p>
        ${passportHTML(c.passport)}

        <h3 style="margin-top:var(--s-6)">Red flags</h3>
        <div class="table-scroll"><table>
          <thead><tr><th>Flag</th><th>Type</th><th>Result</th><th>Note</th></tr></thead>
          <tbody>${c.red_flags.map((f) => `<tr><td>${PT.esc(f.flag)}</td><td>${PT.etypeTag(f.signal)}</td><td class="result-${f.result}">${label[f.result]}</td><td class="muted">${PT.esc(f.note)}</td></tr>`).join("")}</tbody>
        </table></div>

        <h3 style="margin-top:var(--s-6)">Caveats</h3>
        <ul>${c.caveats.map((x) => `<li>${PT.esc(x)}</li>`).join("")}</ul>
      </div>`;

    const lead = d.cases.leads[0];
    document.getElementById("case-2").innerHTML = `
      <span class="card-tab">Case file 02 · lead</span>
      <div class="card">
        <span class="eyebrow">${PT.esc(lead.subtitle)}</span>
        <h2>${PT.esc(lead.title)}</h2>
        <div class="case-meta">${PT.confBadge("lead")}</div>
        <p>${PT.esc(lead.question)}</p>
        <p class="step-receipts">How we know: ${PT.receipts(lead.call_ids)}</p>
      </div>`;
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
