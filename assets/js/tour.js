/* Paper Trail: a short guided tour of the site, started from the home page. */
(function () {
  const STEPS = [
    { sel: "#facts", title: "1 · Why it matters", text: "China makes over 90% of the world's battery anode material, and US tax-credit rules now ask who owns each supplier. These four numbers set the scene." },
    { sel: "#map-section", title: "2 · Where the trail runs", text: "Each numbered dot is a plant we traced. Click one to see who owns it and what the records show." },
    { sel: "#cases", title: "3 · One answer per plant", text: "Each case asks one question and gives a Yes / Partly / Not yet answer. Open a case to see every link and its source." },
    { sel: "#take-h", title: "4 · What the cases add up to", text: "Six findings across all the cases. Finding 2 is the key one: shipping records alone can't tell a Chinese-owned supplier from a Korean one." },
    { sel: null, title: "5 · Put it to work", text: "Use these pages for your own checks.", links: [["buyers.html", "Check a Buyer: who supplies GM, Ford, Tesla…"], ["diligence.html", "Due Diligence: ownership screen and supplier questions"], ["explore.html", "Explore: every link, with its evidence"], ["method.html", "Method: every Sayari query we ran"]] },
  ];
  let i = 0, box = null, focused = null;

  function clear() { if (focused) focused.classList.remove("tour-focus"); focused = null; }
  function close() { clear(); if (box) box.remove(); box = null; document.removeEventListener("keydown", onKey); const b = document.getElementById("tour-start"); if (b) b.focus(); }
  function onKey(e) { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }
  function go(n) {
    if (n < 0 || n >= STEPS.length) return;
    i = n; clear();
    const s = STEPS[i];
    const target = s.sel && document.querySelector(s.sel);
    if (target) {
      focused = target.closest("section, aside") || target;
      focused.classList.add("tour-focus");
      focused.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    box.innerHTML = `
      <div class="tour-head"><strong>${s.title}</strong><button type="button" class="tour-x" aria-label="Close tour">×</button></div>
      <p>${s.text}</p>
      ${s.links ? `<ul class="tour-links">${s.links.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>` : ""}
      <div class="tour-nav">
        <button type="button" class="btn" data-go="-1" ${i === 0 ? "disabled" : ""}>← Back</button>
        <span class="muted">${i + 1} / ${STEPS.length}</span>
        ${i < STEPS.length - 1 ? `<button type="button" class="btn primary" data-go="1">Next →</button>` : `<button type="button" class="btn primary" data-close>Done</button>`}
      </div>`;
    box.querySelector(".tour-x").addEventListener("click", close);
    box.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(i + +b.dataset.go)));
    const done = box.querySelector("[data-close]"); if (done) done.addEventListener("click", close);
    (box.querySelector("[data-go='1']") || box.querySelector("[data-close]")).focus();
  }
  function start() {
    if (box) return;
    box = document.createElement("div");
    box.className = "tour"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Guided tour");
    document.body.appendChild(box);
    document.addEventListener("keydown", onKey);
    go(0);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const b = document.getElementById("tour-start");
    if (b) b.addEventListener("click", start);
  });
})();
