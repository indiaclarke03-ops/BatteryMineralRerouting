/* Paper Trail | Minerals: Case Files page (all cases). */
(function (PT) {
  const LABEL = { detected: "Detected", suggested: "Suggested", not_visible: "Not visible", absent: "Checked: absent" };

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

  function fileHTML(c, d) {
    const nEdges = d.edges.items.filter((e) => e.case_ids.includes(c.id)).length;
    const nCalls = d.call_log.items.filter((x) => x.case_id === c.id).length;
    return `
      <div class="cf-meta">
        <span class="pattern ${PT.esc(c.pattern)}">${PT.esc(PT.PATTERN[c.pattern] || c.pattern)}</span>
        <span>Overall confidence ${PT.confBadge(c.overall_confidence)}</span>
        <span class="muted">${nEdges} links · ${nCalls} logged calls · plant ${PT.esc(c.plant_status || "")}</span>
        ${PT.checkedHTML(c)}
        <a href="explore.html?case=${PT.esc(c.id)}" class="btn cf-open">See the network →</a>
      </div>
      ${PT.qaHTML(c)}
      <p class="cf-plain">${PT.esc(c.summary_for_non_experts || "")}</p>
      <div class="keynums">${(c.key_numbers || []).map((k) => `<div class="keynum"><strong>${PT.esc(k.value)}</strong><span>${PT.esc(k.label)}</span> ${PT.receipts(k.call_ids)}</div>`).join("")}</div>

      <h3 class="cf-h">The trace, step by step</h3>
      <ol class="steps-list">${c.steps.map((s) => stepHTML(s, d)).join("")}</ol>

      <h3 class="cf-h">Verdict</h3>
      ${verdictList(c.verdict)}

      <details class="cf-more"><summary>Red flags</summary>
        <div class="table-scroll"><table>
          <thead><tr><th>Flag</th><th>Type</th><th>Result</th><th>Note</th></tr></thead>
          <tbody>${c.red_flags.map((f) => `<tr><td>${PT.esc(f.flag)}</td><td>${PT.etypeTag(f.signal)}</td><td class="result-${f.result}">${LABEL[f.result] || f.result}</td><td class="muted">${PT.esc(f.note || "")}</td></tr>`).join("")}</tbody>
        </table></div>
      </details>
      <details class="cf-more"><summary>Caveats</summary>
        <ul>${c.caveats.map((x) => `<li>${PT.esc(x)}</li>`).join("")}</ul>
      </details>`;
  }

  function rowHTML(c, i) {
    return `<article class="cf-item" id="${PT.esc(c.id)}">
      <h2 class="cf-head"><button type="button" class="cf-row" aria-expanded="false" aria-controls="file-${PT.esc(c.id)}">
        <span class="cf-n">${String(i + 1).padStart(2, "0")}</span>
        <span class="cf-main">
          <span class="cf-title">${PT.esc(c.title)}</span>
          <span class="cf-sub">${PT.esc(c.answer_short || c.answer)}</span>
        </span>
        <span class="cf-side"><span class="cf-place">${PT.esc(PT.country(c.country))}</span>${PT.pill(c.answer_label)}</span>
        <span class="cf-chev" aria-hidden="true"></span>
      </button></h2>
      <div class="cf-body" id="file-${PT.esc(c.id)}" hidden></div>
    </article>`;
  }

  async function init() {
    const out = document.getElementById("case-list");
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(out, e); return; }
    const cases = d.cases.items;
    out.innerHTML = cases.map(rowHTML).join("");

    function toggle(id, open) {
      const item = document.getElementById(id); if (!item) return;
      const btn = item.querySelector(".cf-row"), body = item.querySelector(".cf-body");
      if (open && !body.dataset.done) { body.innerHTML = fileHTML(d.caseById.get(id), d); body.dataset.done = "1"; }
      btn.setAttribute("aria-expanded", String(open));
      body.hidden = !open;
      item.classList.toggle("open", open);
    }
    function closeOthers(id) {
      out.querySelectorAll(".cf-item.open").forEach((x) => { if (x.id !== id) toggle(x.id, false); });
    }
    out.addEventListener("click", (e) => {
      const btn = e.target.closest(".cf-row"); if (!btn) return;
      const item = btn.closest(".cf-item"), open = !item.classList.contains("open");
      closeOthers(item.id);
      toggle(item.id, open);
      history.replaceState(null, "", open ? `#${item.id}` : location.pathname);
      if (open) item.scrollIntoView({ block: "start" });
    });
    const fromHash = () => {
      const id = location.hash.slice(1);
      if (!d.caseById.has(id)) return;
      closeOthers(id); toggle(id, true);
      document.getElementById(id).scrollIntoView({ block: "start" });
    };
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
