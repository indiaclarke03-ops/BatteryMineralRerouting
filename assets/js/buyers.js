/* Paper Trail: Check a Buyer. For a US buyer, list every supplier in our data, who owns it, and what it ships. */
(function (PT) {
  const CAT = {
    battery: "Battery and car makers",
    products: "Battery-powered products and storage",
    chinese_owned_us: "Chinese-owned US companies",
    industrial: "Industrial graphite users (not battery grade)",
  };
  const QUICK = ["gm", "tesla", "sk", "ultium", "milwaukee", "briggs"];

  function supplierInfo(d, e) {
    // Which case treats this supplier as "the plant"? Use that case's screening card for ownership.
    const src = d.entityById.get(e.source);
    const caseId = e.case_ids[0];
    const roles = src.case_roles || {};
    const plantCase = Object.keys(roles).find((cid) => roles[cid] === "transit_plant");
    const card = plantCase ? d.curated.screening[plantCase] : null;
    let owner, chinese, conf, note;
    if (card) {
      owner = card.owner_top; chinese = card.chinese_owned; conf = card.confidence; note = card.inputs;
    } else if (src.country === "CHN") {
      owner = "Company based in China"; chinese = "Yes (China-based)"; conf = "documented"; note = "Ships directly from China.";
    } else {
      owner = "Not traced"; chinese = "Unknown"; conf = "lead"; note = "";
    }
    return { src, caseId: plantCase || caseId, owner, chinese, conf, note, plantName: card ? card.plant : null };
  }

  function groupSuppliers(d, edges) {
    // Merge rows from duplicate records of the same supplier (same plant case or same entity).
    const m = new Map();
    edges.forEach((e) => {
      const info = supplierInfo(d, e);
      const key = info.caseId + "|" + (info.owner === "Company based in China" || info.owner === "Not traced" ? info.src.id : info.owner);
      if (!m.has(key)) m.set(key, { ...info, names: new Set(), edges: [], rows: 0, hs: new Set(), first: null, last: null, confs: [] });
      const g = m.get(key);
      g.names.add(info.src.name.replace(/\s*\((record \d+|trade record[^)]*|[^)]*record)\)\s*$/i, ""));
      g.edges.push(e); g.rows += e.shipment_count || 0; (e.hs_codes || []).forEach((h) => g.hs.add(h));
      if (e.first_seen && (!g.first || e.first_seen < g.first)) g.first = e.first_seen;
      if (e.last_seen && (!g.last || e.last_seen > g.last)) g.last = e.last_seen;
      g.confs.push(e.confidence);
    });
    const rank = { Yes: 0, "Yes (China-based)": 0, Unknown: 1, No: 2 };
    return [...m.values()].sort((a, b) => (rank[a.chinese] ?? 1) - (rank[b.chinese] ?? 1) || b.rows - a.rows);
  }

  function supplierCard(d, g) {
    const c = d.caseById.get(g.caseId);
    const idx = d.cases.items.indexOf(c) + 1;
    const best = ["documented", "corroborated", "inferred", "lead"].find((k) => g.confs.includes(k));
    const dates = g.first ? `${PT.fmtDate(g.first)}${g.last && g.last !== g.first ? " – " + PT.fmtDate(g.last) : ""}` : "Dates not pulled";
    const cls = g.chinese.startsWith("Yes") ? "risk" : g.chinese === "No" ? "clear" : "unknown";
    const ids = g.edges.flatMap((e) => e.source_call_ids);
    return `<article class="sup-card ${cls}">
      <div class="sup-head">
        <div>
          <h3>${PT.esc(g.plantName || [...g.names][0])}</h3>
          <span class="muted" style="font-size:var(--fs-1)">${PT.esc(PT.country(g.src.country))}${g.names.size > 1 ? ` · ${g.names.size} records` : ""}</span>
        </div>
        <div class="sup-flag"><span class="label">Chinese-owned?</span><strong>${PT.esc(g.chinese)}</strong> ${PT.confBadge(g.conf)}</div>
      </div>
      <dl class="sup-facts">
        <dt>Ultimate owner</dt><dd>${PT.esc(g.owner)}</dd>
        <dt>What it shipped</dt><dd>${g.hs.size ? [...g.hs].map((h) => `<span class="hs">HS ${PT.esc(h)}</span>`).join(" ") : "<span class='muted'>Link only</span>"} ${g.rows ? `<strong>${g.rows}</strong> shipment row${g.rows > 1 ? "s" : ""}` : ""} · ${dates} ${PT.confBadge(best)}</dd>
        ${g.note ? `<dt>Its own inputs</dt><dd>${PT.esc(g.note)}</dd>` : ""}
      </dl>
      <p class="sup-links"><a href="cases.html#${c.id}">Case ${idx}: ${PT.esc(c.title)} →</a> <a href="explore.html?case=${c.id}#${encodeURIComponent(g.src.id)}">See it in the network →</a> <span class="sup-receipts">Sources ${PT.receipts([...new Set(ids)].slice(0, 6))}</span></p>
    </article>`;
  }

  function render(d, key) {
    const out = document.getElementById("buyer-result");
    const grp = d.curated.buyer_groups.find((g) => g.key === key);
    document.querySelectorAll("#buyer-quick button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.key === key)));
    if (!grp) { out.innerHTML = ""; return; }
    const ids = new Set(grp.ids);
    const edges = d.edges.items.filter((e) => ids.has(e.target) && e.relation === "ships_to");
    const sups = groupSuppliers(d, edges);
    const nCn = sups.filter((s) => s.chinese.startsWith("Yes")).length;
    const rows = edges.reduce((a, e) => a + (e.shipment_count || 0), 0);
    const cases = [...new Set(sups.map((s) => s.caseId))];
    out.innerHTML = `
      <div class="buyer-summary">
        <div><span class="eyebrow">${PT.esc(CAT[grp.category] || "Buyer")}</span><h2>${PT.esc(grp.name)}</h2>
          <p class="muted">${grp.ids.length > 1 ? `${grp.ids.length} records in Sayari, merged here. ` : ""}Appears in ${cases.length} case${cases.length > 1 ? "s" : ""}.</p></div>
        <div class="bs-stats">
          <div><strong>${sups.length}</strong><span>supplier${sups.length !== 1 ? "s" : ""} in our data</span></div>
          <div class="${nCn ? "warn" : ""}"><strong>${nCn}</strong><span>Chinese-owned or China-based</span></div>
          <div><strong>${rows || "–"}</strong><span>shipment rows</span></div>
        </div>
      </div>
      ${nCn ? `<p class="callout">${nCn} of this buyer's suppliers in our data ${nCn === 1 ? "is" : "are"} Chinese-owned or based in China. That isn't a finding of non-compliance: US tax-credit rules turn on cost shares and legal tests we don't assess. It shows where a buyer's due diligence should start. <a href="diligence.html">Due-diligence questions →</a></p>` : ""}
      <div class="sup-list">${sups.map((g) => supplierCard(d, g)).join("")}</div>`;
    history.replaceState(null, "", `?buyer=${key}`);
  }

  async function init() {
    let d;
    try { d = await PT.load(); } catch (e) { PT.fail(document.getElementById("buyer-result"), e); return; }
    const groups = d.curated.buyer_groups.filter((g) => g.category !== "forwarder");
    const sel = document.getElementById("buyer-select");
    sel.innerHTML = `<option value="">Choose a US buyer…</option>` + Object.entries(CAT).map(([cat, label]) =>
      `<optgroup label="${PT.esc(label)}">${groups.filter((g) => g.category === cat).sort((a, b) => a.name.localeCompare(b.name))
        .map((g) => `<option value="${g.key}">${PT.esc(g.name)}</option>`).join("")}</optgroup>`).join("");
    document.getElementById("buyer-quick").innerHTML = QUICK.map((k) => { const g = groups.find((x) => x.key === k); return g ? `<button type="button" data-key="${k}" aria-pressed="false">${PT.esc(g.name.replace(/ \(.*\)$/, ""))}</button>` : ""; }).join("");
    document.getElementById("buyer-quick").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { sel.value = b.dataset.key; render(d, b.dataset.key); } });
    sel.addEventListener("change", () => render(d, sel.value));
    const fw = d.curated.buyer_groups.find((g) => g.category === "forwarder");
    if (fw) document.getElementById("fw-note").textContent = `We also found ${fw.ids.length} freight forwarders named as consignees. They're excluded because they aren't the real buyer.`;
    const want = new URLSearchParams(location.search).get("buyer");
    const start = groups.some((g) => g.key === want) ? want : "gm";
    sel.value = start; render(d, start);
  }
  document.addEventListener("DOMContentLoaded", init);
})(window.PT);
