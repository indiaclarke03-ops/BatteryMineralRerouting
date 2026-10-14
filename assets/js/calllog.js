/* Paper Trail: Method page (replay, scorecard, rubric, searchable call log). */
(function (PT) {
  const STEP_LABEL = {
    method: "Set-up: tradecraft and flag definitions",
    plant: "Entity resolution: is it one plant?",
    owner: "Ownership: who owns the plant?",
    in: "Upstream: what goes into the plant?",
    out: "Downstream: what leaves for the US?",
    gap: "Screening and gaps",
    corridor: "Corridor context",
    policy: "Policy verification",
    context: "Company context",
  };
  const STEP_ORDER = ["method", "plant", "owner", "in", "out", "gap", "corridor"];

  function paramsText(p) {
    return Object.entries(p).map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`).join("\n");
  }

  function replayCard(c, d) {
    const names = (c.entity_ids || []).map((id) => d.entityById.get(id)).filter(Boolean);
    return `<li id="${c.id}">
      <div class="rp-head">
        <span class="rp-id">${c.id}</span>
        <code>${PT.esc(c.tool)}</code>
        ${PT.scoreBadge(c.scorecard)}
        <span class="muted" style="font-size:var(--fs-0);margin-left:auto">${PT.esc(c.purpose)}</span>
      </div>
      <p class="rp-q">${PT.esc(c.question)}</p>
      <div class="rp-grid">
        <div><span class="rp-label">Tool + parameters</span><pre>${PT.esc(paramsText(c.params))}</pre></div>
        <div><span class="rp-label">What came back</span>${PT.esc(c.result_summary)}</div>
        <div><span class="rp-label">What it means</span>${PT.esc(c.interpretation)}
          ${names.length ? `<div style="margin-top:var(--s-2)"><span class="rp-label">Entities</span>${names.map((e) => `<a href="explore.html#${encodeURIComponent(e.id)}">${PT.esc(e.name)}</a>`).join(" · ")}</div>` : ""}
        </div>
      </div>
    </li>`;
  }

  function scorecardHTML(calls) {
    const sy = calls.filter((c) => c.server === "sayari");
    const n = (s, arr = sy) => arr.filter((c) => c.scorecard === s).length;
    const bar = (arr) => {
      const t = arr.length || 1;
      return `<div class="scorebar" role="img" aria-label="${n("worked", arr)} worked, ${n("partial", arr)} partial, ${n("failed", arr)} failed">
        <span class="w" style="width:${(n("worked", arr) / t) * 100}%"></span><span class="p" style="width:${(n("partial", arr) / t) * 100}%"></span><span class="f" style="width:${(n("failed", arr) / t) * 100}%"></span></div>`;
    };
    const rows = STEP_ORDER.map((st) => {
      const arr = sy.filter((c) => c.step === st);
      if (!arr.length) return "";
      return `<tr><th scope="row" style="text-transform:none;letter-spacing:0;font-size:var(--fs-1);color:var(--ink)">${PT.esc(STEP_LABEL[st])}</th>
        <td style="min-width:9rem">${bar(arr)}</td>
        <td>${arr.map((c) => `<a href="#${c.id}" class="badge sc-${c.scorecard}" title="${PT.esc(c.tool)}: ${c.scorecard}">${c.id}</a>`).join(" ")}</td></tr>`;
    }).join("");
    return `
      <div class="score-counts">
        <span>${PT.scoreBadge("worked")} ${n("worked")} calls</span>
        <span>${PT.scoreBadge("partial")} ${n("partial")} calls</span>
        <span>${PT.scoreBadge("failed")} ${n("failed")} calls</span>
        <span class="muted">of ${sy.length} Sayari calls</span>
      </div>
      ${bar(sy)}
      <div class="table-scroll"><table><thead><tr><th>Investigative step</th><th>Score</th><th>Calls</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function rubricHTML(flags) {
    const label = { detected: "Detected", suggested: "Suggested", not_visible: "Not visible" };
    return `<div class="table-scroll"><table>
      <thead><tr><th>Red flag</th><th>Signal</th><th>Severity</th><th>Case 1 result</th><th>Note</th></tr></thead>
      <tbody>${flags.map((f) => `<tr>
        <td>${PT.esc(f.flag)}</td>
        <td>${PT.etypeTag(f.signal)}</td>
        <td>${PT.esc(f.severity)}</td>
        <td class="result-${f.result}">${label[f.result]}</td>
        <td class="muted">${PT.esc(f.note)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function logRows(calls) {
    return calls.map((c) => `<tr id="${c.server === "sayari" ? "log-" + c.id : c.id}">
      <td class="mono"><a href="${c.server === "sayari" ? "#" + c.id : "#" + c.id}">${c.id}</a></td>
      <td><span class="badge server">${PT.esc(c.server)}</span></td>
      <td><code>${PT.esc(c.tool)}</code></td>
      <td>${PT.esc(c.question)}<div class="muted" style="font-size:var(--fs-0)">${PT.esc(c.result_summary)}</div></td>
      <td>${PT.scoreBadge(c.scorecard)}</td>
      <td class="mono" style="font-size:var(--fs-0)">${PT.esc(c.timestamp.slice(11, 16))} UTC</td>
    </tr>`).join("");
  }

  async function init() {
    const out = document.getElementById("replay");
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(out, e); return; }
    const calls = d.call_log.items;
    const sy = calls.filter((c) => c.server === "sayari");

    out.innerHTML = STEP_ORDER.map((st) => {
      const arr = sy.filter((c) => c.step === st);
      if (!arr.length) return "";
      return `<h3 style="margin-top:var(--s-6)">${PT.esc(STEP_LABEL[st])}</h3><ol class="replay">${arr.map((c) => replayCard(c, d)).join("")}</ol>`;
    }).join("");

    document.getElementById("scorecard").innerHTML = scorecardHTML(calls);
    document.getElementById("rubric").innerHTML = rubricHTML(d.cases.items[0].red_flags);

    const tbody = document.getElementById("log-body");
    const count = document.getElementById("log-count");
    const render = (arr) => { tbody.innerHTML = logRows(arr); count.textContent = `${arr.length} of ${calls.length} calls`; };
    render(calls);

    const names = (c) => (c.entity_ids || []).map((id) => (d.entityById.get(id) || {}).name || "").join(" ");
    const docs = calls.map((c) => ({ ...c, entity_names: names(c), params_text: JSON.stringify(c.params) }));
    const fuse = typeof Fuse !== "undefined" ? new Fuse(docs, {
      keys: ["id", "tool", "server", "question", "purpose", "result_summary", "interpretation", "entity_names", "params_text"],
      threshold: 0.35, ignoreLocation: true,
    }) : null;
    document.getElementById("log-search").addEventListener("input", (e) => {
      const q = e.target.value.trim();
      if (!q) return render(calls);
      if (fuse) return render(fuse.search(q).map((r) => r.item));
      const ql = q.toLowerCase();
      render(docs.filter((c) => JSON.stringify(c).toLowerCase().includes(ql)));
    });

    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
