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

  function caseScoreHTML(d) {
    const rows = d.cases.items.map((k, i) => {
      const arr = d.call_log.items.filter((c) => c.server === "sayari" && c.case_id === k.id);
      const n = (x) => arr.filter((c) => c.scorecard === x).length;
      return `<tr><th scope="row" style="text-transform:none;letter-spacing:0;font-size:var(--fs-1);color:var(--ink)"><a href="#replay-${k.id}">${i + 1}. ${PT.esc(k.title)}</a></th>
        <td>${arr.length}</td><td>${n("worked")}</td><td>${n("partial")}</td><td>${n("failed")}</td></tr>`;
    }).join("");
    return `<h3 style="margin-top:var(--s-5)">By case</h3><div class="table-scroll"><table><thead><tr><th>Case</th><th>Sayari calls</th><th>Worked</th><th>Partial</th><th>Failed</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function rubricHTML(flags) {
    const label = { detected: "Detected", suggested: "Suggested", not_visible: "Not visible", absent: "Checked: absent" };
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
    // Calls with a replay card own the bare id; the others are anchored on their log row.
    const inReplay = (c) => c.server === "sayari" && String(c.case_id).startsWith("case-");
    return calls.map((c) => `<tr id="${inReplay(c) ? "log-" + c.id : c.id}">
      <td class="mono">${inReplay(c) ? `<a href="#${c.id}">${c.id}</a>` : c.id}</td>
      <td><span class="badge server">${PT.esc(c.server)}</span><div class="muted" style="font-size:var(--fs-0)">${PT.esc(c.case_id === "general" ? (c.step === "verify" ? "re-check" : "overview") : c.case_id)}</div></td>
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

    const cases = d.cases.items;
    document.getElementById("replay-nav").innerHTML = cases.map((k, i) => `<a href="#replay-${k.id}">${i + 1}. ${PT.esc(k.title)}</a>`).join("");
    out.innerHTML = cases.map((k, i) => {
      const inCase = sy.filter((c) => c.case_id === k.id);
      const order = STEP_ORDER.concat([...new Set(inCase.map((c) => c.step))].filter((x) => !STEP_ORDER.includes(x)));
      return `<h2 id="replay-${k.id}" style="margin-top:var(--s-7);scroll-margin-top:80px">Case ${i + 1}: ${PT.esc(k.title)} <span class="muted" style="font-size:var(--fs-1);font-family:var(--sans);font-weight:400">${inCase.length} Sayari calls</span></h2>` +
        order.map((st) => {
          const arr = inCase.filter((c) => c.step === st);
          if (!arr.length) return "";
          return `<h3 style="margin-top:var(--s-5)">${PT.esc(STEP_LABEL[st] || st)}</h3><ol class="replay">${arr.map((c) => replayCard(c, d)).join("")}</ol>`;
        }).join("");
    }).join("");

    document.getElementById("scorecard").innerHTML = scorecardHTML(calls) + caseScoreHTML(d);
    document.getElementById("rubric").innerHTML = rubricHTML(d.cases.items[0].red_flags) + `<p class="muted" style="margin-top:var(--s-3)">Shown for Case 1. Each case file scores the same seven flags: <a href="cases.html">see all cases</a>.</p>`;

    const tbody = document.getElementById("log-body");
    const count = document.getElementById("log-count");
    const render = (arr) => { tbody.innerHTML = logRows(arr); count.textContent = `${arr.length} of ${calls.length} calls`; };
    render(calls);

    const names = (c) => ((d.caseById.get(c.case_id) || {}).title || "") + " " + (c.entity_ids || []).map((id) => (d.entityById.get(id) || {}).name || "").join(" ");
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
