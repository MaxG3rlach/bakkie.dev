// clock (Europe/Amsterdam) + time-aware status
function clock() {
  try {
    const now = new Date();
    const t = now.toLocaleTimeString("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" });
    const el = document.getElementById("clock");
    if (el) el.textContent = t;
    const hr = parseInt(now.toLocaleTimeString("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", hour12: false }), 10);
    const st = document.getElementById("status");
    if (st) st.textContent =
      hr < 5 ? "up late, shipping anyway" :
      hr < 9 ? "coffee first, commits later" :
      hr < 18 ? "open for small collabs" :
      hr < 23 ? "one more commit (probably)" : "up late, shipping anyway";
  } catch {}
}
clock();
setInterval(clock, 20000);

const y = new Date().getFullYear();
["yr"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = y; });

const btn = document.getElementById("themeBtn");
btn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  try { localStorage.setItem("mg-theme", document.body.classList.contains("dark") ? "dark" : "light"); } catch {}
});
try {
  if (localStorage.getItem("mg-theme") === "dark") document.body.classList.add("dark");
} catch {}

const filterBtns = document.querySelectorAll("menu.filters button");
const rows = document.querySelectorAll(".rows li");
filterBtns.forEach((b) => {
  b.addEventListener("click", () => {
    filterBtns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    const f = b.dataset.filter;
    rows.forEach((r) => {
      r.style.display = f === "all" || r.dataset.tag === f ? "" : "none";
    });
  });
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// scroll progress
const prog = document.getElementById("progress");
addEventListener("scroll", () => {
  if (!prog) return;
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
}, { passive: true });

// live repos, no mockups
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
    list.innerHTML = repos.map((x) => {
      const d = new Date(x.pushed_at).toLocaleDateString("nl-NL", { day: "2-digit", month: "short" });
      const desc = x.description ? x.description : "no description — the code speaks.";
      const lang = x.language ? " · " + x.language : "";
      const stars = x.stargazers_count ? " ★" + x.stargazers_count : "";
      return "<li><a href='" + x.html_url + "' target='_blank' rel='noopener'><h3>" + x.name + "</h3><p>" + desc.replace(/</g, "&lt;") + "</p><small>pushed " + d + lang + stars + " ↗</small></a></li>";
    }).join("");
  } catch (e) {
    if (note) note.textContent = "github is napping (or you're offline) — repos live at github.com/MaxG3rlach.";
  }
})();

// ---- playground ----

let pokes = 0;
try { pokes = parseInt(localStorage.getItem("mg-pokes") || "0", 10) || 0; } catch {}
const pokeEl = document.getElementById("pokes");
const pokeBtn = document.getElementById("pokeBtn");
function renderPokes() { if (pokeEl) pokeEl.textContent = pokes; }
renderPokes();
if (pokeBtn) pokeBtn.addEventListener("click", () => {
  pokes++;
  try { localStorage.setItem("mg-pokes", String(pokes)); } catch {}
  renderPokes();
  if (pokes === 10) excuse("10 pokes. the button is fine. are you?");
  if (pokes === 50) { excuse("50 pokes. touching grass is free, you know."); confetti(120); }
});

const excuses = [
  "it worked on my machine, which is currently on fire.",
  "a player found the bug in 4 minutes. it took me 4 days to write it.",
  "shipped at 2am. the code is scared too.",
  "the filter function survived 5 redesigns. respect it.",
  "Probably Labs QA = me, tired.",
  "my effect hit 80M views and all I got was this bug report.",
  "deleted the template. kept the trauma.",
  "landed the landing. the code didn't.",
  "it compiles. ship it. sleep later."
];
const excuseEl = document.getElementById("excuse");
function excuse(t) { if (excuseEl) excuseEl.textContent = t; }
const excuseBtn = document.getElementById("excuseBtn");
if (excuseBtn) excuseBtn.addEventListener("click", () => {
  excuse(excuses[Math.floor(Math.random() * excuses.length)]);
});

const canvas = document.getElementById("confetti");
const ctx = canvas ? canvas.getContext("2d") : null;
let parts = [];
function sizeCanvas() { if (canvas) { canvas.width = innerWidth; canvas.height = innerHeight; } }
addEventListener("resize", sizeCanvas);
sizeCanvas();
function confetti(n) {
  if (!ctx || !canvas) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  sizeCanvas();
  const colors = ["#FF8A5B", "#FF5DA2", "#60A5FA", "#131311", "#ffffff"];
  for (let i = 0; i < (n || 80); i++) {
    parts.push({
      x: Math.random() * canvas.width, y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
      s: 4 + Math.random() * 6, r: Math.random() * Math.PI,
      c: colors[Math.floor(Math.random() * colors.length)], life: 120 + Math.random() * 60
    });
  }
  if (!confetti.running) { confetti.running = true; requestAnimationFrame(confettiTick); }
}
function confettiTick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  parts = parts.filter((p) => p.life > 0 && p.y < canvas.height + 30);
  parts.forEach((p) => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.r += 0.1; p.life--;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
    ctx.restore();
  });
  if (parts.length) requestAnimationFrame(confettiTick);
  else { confetti.running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

const partyBtn = document.getElementById("partyBtn");
function party() {
  document.body.classList.toggle("party");
  confetti(120);
  excuse(document.body.classList.contains("party") ? "PARTY MODE. the ticker is scared." : "party over. back to shipping.");
}
if (partyBtn) partyBtn.addEventListener("click", party);

const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let pos = 0;
addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") { party(); return; }
  pos = e.key === seq[pos] ? pos + 1 : 0;
  if (pos === seq.length) { pos = 0; party(); excuse("konami accepted. welcome to Probably Labs HQ (my desk)."); }
});

console.log("%cpsst — konami code works here. or press P.", "background:#FF8A5B;color:#000;font-family:monospace;padding:2px 6px;");
