function clock() {
  try {
    const now = new Date();
    const t = now.toLocaleTimeString("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" });
    const el = document.getElementById("clock");
    if (el) el.textContent = t;
  } catch {}
}
clock();
setInterval(clock, 20000);

try {
  const y = new Date().getFullYear();
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = y;
} catch {}

const themeBtn = document.getElementById("themeBtn");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    try { localStorage.setItem("mg-theme", document.body.classList.contains("dark") ? "dark" : "light"); } catch {}
  });
}
try {
  if (localStorage.getItem("mg-theme") === "dark") document.body.classList.add("dark");
} catch {}

const filterBtns = document.querySelectorAll("menu.filters button");
const cases = document.querySelectorAll("ol.cases .case");
filterBtns.forEach((b) => {
  b.addEventListener("click", () => {
    filterBtns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    const f = b.dataset.filter;
    cases.forEach((c) => {
      c.style.display = f === "all" || c.dataset.tag === f ? "" : "none";
    });
  });
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

const prog = document.getElementById("progress");
addEventListener("scroll", () => {
  if (!prog) return;
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
}, { passive: true });

(async () => {
  const list = document.getElementById("repos");
  const note = document.getElementById("repo-note");
  if (!list) return;
  try {
    const r = await fetch("https://api.github.com/users/MaxG3rlach/repos?sort=pushed&per_page=100");
    if (!r.ok) throw new Error("gh " + r.status);
    const repos = (await r.json())
      .filter((x) => !x.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 6);
    if (!repos.length) throw new Error("empty");
    if (note) note.remove();
    const esc = (s) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    list.innerHTML = repos.map((x) => {
      const d = new Date(x.pushed_at).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
      const desc = x.description ? esc(x.description) : "no description yet — work in progress.";
      const lang = x.language ? " · " + esc(x.language) : "";
      const stars = x.stargazers_count ? " · ★" + x.stargazers_count : "";
      return "<li><a href='" + x.html_url + "' target='_blank' rel='noopener'><h3>" + esc(x.name) + "</h3><p>" + desc + "</p><small>updated " + d + lang + stars + " ↗</small></a></li>";
    }).join("");
  } catch (e) {
    if (note) note.textContent = "repositories live at github.com/MaxG3rlach.";
  }
})();
