/* Paper Trail: shared header, footer and legend. */
(function (PT) {
  const PAGES = [
    ["index.html", "The Trace"],
    ["explore.html", "Explore"],
    ["buyers.html", "Check a Buyer"],
    ["cases.html", "Case Files"],
    ["diligence.html", "Due Diligence"],
    ["method.html", "Method"],
    ["about.html", "About this tool"],
  ];
  const REPO = "https://github.com/indiaclarke03-ops/BatteryMineralRerouting";

  function current() {
    const p = location.pathname.split("/").pop() || "index.html";
    return p === "" ? "index.html" : p;
  }

  PT.renderChrome = function () {
    const here = current();
    const header = document.getElementById("site-header");
    if (header) {
      header.className = "site-header";
      header.innerHTML = `
        <div class="wrap">
          <a class="brand" href="index.html"><span class="brand-mark">PT</span>Paper Trail</a>
          <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
          <nav class="nav" id="site-nav" aria-label="Main">
            ${PAGES.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
        </div>`;
      const btn = header.querySelector(".nav-toggle");
      const nav = header.querySelector(".nav");
      btn.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    }
    const footer = document.getElementById("site-footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = `
        <div class="wrap">
          <div><strong>Paper Trail</strong>: tracing battery-mineral rerouting with Sayari MCP. Data as of 14 Oct 2026, re-checked 18 Oct 2026.</div>
          <div>Not an accusation tool: patterns here warrant due diligence, not conclusions. See <a href="about.html#limits">limitations</a>.</div>
          <div>GLOB1-GC 2620, NYU Center for Global Affairs · <a href="${REPO}">Source on GitHub</a> · MIT licence · Companion to <a href="https://indiaclarke03-ops.github.io/EthicalBatterySourcing/">Battery Passport Audit</a></div>
        </div>`;
    }
  };

  PT.legendHTML = function (compact) {
    const et = Object.entries(PT.ETYPE).map(([, m]) =>
      `<li><span class="etype ${m.cls}"><span class="line" aria-hidden="true"></span>${m.label}</span><span>${m.help}</span></li>`).join("");
    const cf = Object.entries(PT.CONF).map(([k, m]) =>
      `<li>${PT.confBadge(k)}<span>${m.help}</span></li>`).join("");
    return `<div class="legend${compact ? " compact" : ""}">
      <div><p class="legend-h">Edge type (colour + line style)</p><ul>${et}</ul></div>
      <div><p class="legend-h">Confidence</p><ul>${cf}</ul></div>
    </div>`;
  };

  PT.renderLegends = function () {
    document.querySelectorAll("[data-legend]").forEach((el) => {
      el.innerHTML = PT.legendHTML(el.dataset.legend === "compact");
    });
  };

  PT.fail = function (el, err) {
    if (el) el.innerHTML = `<p class="callout">Couldn't load the data (${PT.esc(err.message)}). If you opened the file directly, run a local server: <code>python3 -m http.server</code>.</p>`;
    console.error(err);
  };

  document.addEventListener("DOMContentLoaded", () => {
    PT.renderChrome();
    PT.renderLegends();
  });
})(window.PT);
