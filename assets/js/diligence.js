/* Paper Trail | Minerals: Due Diligence page (ownership screening, watch list). */
(function (PT) {
  const RES = { detected: "Detected", suggested: "Suggested", not_visible: "Not visible", absent: "Checked: absent" };

  function matrixHTML(d) {
    const sc = d.curated.screening;
    return `<div class="table-scroll card" style="padding:0"><table class="screen-table">
      <thead><tr><th>Case</th><th>Plant</th><th>Ultimate owner</th><th>Chinese-owned?</th><th>Owner in Sayari's registry data?</th><th>Plant ships to US buyers?</th><th>Confidence</th></tr></thead>
      <tbody>${d.cases.items.map((c, i) => {
        const s = sc[c.id];
        if (!s) return "";
        const isPlant = (id) => { const en = d.entityById.get(id) || {}; return (en.case_roles || {})[c.id] === "transit_plant"; };
        const usEdges = d.edges.items.filter((e) => e.case_ids.includes(c.id) && e.relation === "ships_to" && e.edge_type === "transactional"
          && isPlant(e.source) && !isPlant(e.target) && (d.entityById.get(e.target) || {}).country === "USA");
        const plantInUS = c.country === "USA";
        const fw = new Set((d.curated.buyer_groups.find((g) => g.category === "forwarder") || { ids: [] }).ids);
        const usEdgesNet = usEdges.filter((e) => !fw.has(e.target) && !/scan global|fns|freight|logistics/i.test((d.entityById.get(e.target) || {}).name || ""));
        const reg = s.registry;
        return `<tr>
          <td class="mono">${i + 1}</td>
          <td><a href="#screen-${c.id}">${PT.esc(s.plant)}</a><div class="muted" style="font-size:var(--fs-0)">${PT.esc(s.location)}</div></td>
          <td>${PT.esc(s.owner_top)}</td>
          <td><span class="yn ${s.chinese_owned === "Yes" ? "yes" : "no"}">${PT.esc(s.chinese_owned)}</span></td>
          <td>${reg}</td>
          <td>${plantInUS ? `<span class="muted">Plant is in the US</span>` : usEdgesNet.length ? `Yes <span class="muted">(${usEdgesNet.reduce((a, e) => a + (e.shipment_count || 0), 0) || usEdgesNet.length} rows)</span>` : `<span class="muted">${c.plant_status === "operating" ? "Not in our data" : "Not yet"}</span>`}</td>
          <td>${PT.confBadge(s.confidence)}</td></tr>`;
      }).join("")}</tbody></table></div>`;
  }

  function chainHTML(chain) {
    return `<ol class="chain">${chain.map((step, i) => `
      <li><div class="chain-box"><strong>${PT.esc(step.name)}</strong><span>${PT.esc(PT.country(step.country))} · ${PT.esc(step.basis)}</span></div>
      ${i < chain.length - 1 ? `<div class="chain-link">${step.stake ? PT.esc(step.stake) : "owns"} ↓</div>` : ""}</li>`).join("")}</ol>`;
  }

  function cardsHTML(d) {
    return d.cases.items.map((c, i) => {
      const s = d.curated.screening[c.id];
      if (!s) return "";
      return `<article class="screen-card" id="screen-${c.id}">
        <div class="sc-head">
          <div><span class="eyebrow">Case ${i + 1} · ${PT.esc(s.status)}</span><h3>${PT.esc(s.plant)}</h3><span class="muted" style="font-size:var(--fs-1)">${PT.esc(s.location)}</span> ${PT.checkedHTML(c, { plain: true })}</div>
          <div class="sc-verdict ${s.chinese_owned === "Yes" ? "yes" : "no"}"><span>Chinese-owned?</span><strong>${PT.esc(s.chinese_owned)}</strong>${PT.confBadge(s.confidence)}</div>
        </div>
        <div class="sc-body">
          <div><h4>Ownership chain</h4>${chainHTML(s.chain)}<p class="muted" style="font-size:var(--fs-0)">${PT.esc(s.visibility)}</p></div>
          <div>
            <h4>Its inputs</h4><p>${PT.esc(s.inputs)}</p>
            <h4>US buyers exposed</h4><p>${PT.esc(s.us_exposure)}</p>
            ${(s.open_questions || []).length ? `<h4>Still unknown, and the document that would settle it</h4><ul class="oq">${s.open_questions.map((o) => `<li><strong>${PT.esc(o.q)}</strong><span>Document: ${PT.esc(o.doc)}</span></li>`).join("")}</ul>` : ""}
            <p class="sc-links"><a href="cases.html#${c.id}">Full case →</a> <a href="explore.html?case=${c.id}">Network →</a> <span>Sources ${PT.receipts(s.call_ids.slice(0, 6))}</span></p>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  function watchHTML(d) {
    return d.curated.watch.map((w) => {
      const c = d.caseById.get(w.case); const idx = d.cases.items.indexOf(c) + 1;
      return `<article class="watch-card">
        <div class="wc-head"><h3>${PT.esc(w.plant)}</h3><span class="pattern trail-not-started">${PT.esc(w.status)}</span></div>
        <dl class="wc-dates"><dt>Last checked</dt><dd>${PT.fmtDate(w.last_checked)}</dd><dt>Next check</dt><dd>${PT.fmtDate(w.next_check)}</dd></dl>
        <h4>Watch for</h4><ul>${w.watch_for.map((x) => `<li>${PT.esc(x)}</li>`).join("")}</ul>
        <h4>How to re-check in Sayari</h4><p class="mono" style="font-size:var(--fs-0)">${PT.esc(w.how)}</p>
        <p><a href="cases.html#${c.id}">Case ${idx}: ${PT.esc(c.title)} →</a></p>
      </article>`;
    }).join("");
  }

  async function init() {
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(document.getElementById("matrix"), e); return; }
    document.getElementById("matrix").innerHTML = matrixHTML(d);
    document.getElementById("screen-cards").innerHTML = cardsHTML(d);
    document.getElementById("open-q").innerHTML = `<div class="table-scroll card" style="padding:0"><table class="screen-table"><thead><tr><th>Case</th><th>Still unknown</th><th>Document that would settle it</th></tr></thead><tbody>${
      d.cases.items.flatMap((c, i) => ((d.curated.screening[c.id] || {}).open_questions || []).map((o) => `<tr><td class="mono"><a href="#screen-${c.id}">${i + 1}</a></td><td>${PT.esc(o.q)}</td><td>${PT.esc(o.doc)}</td></tr>`)).join("")}</tbody></table></div>`;
    document.getElementById("watch-list").innerHTML = watchHTML(d);
    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
