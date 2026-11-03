console.log("JD Copier loaded");

const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const ICON_GRIP = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>`;
const ICON_CHEVRON = `<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 2.8 9.1 7l-4.2 4.2"/></svg>`;

// 1. Shadow DOM host
const host = document.createElement("div");
document.body.appendChild(host);
const root = host.attachShadow({ mode: "open" });

root.innerHTML = `
<style>
  * { box-sizing: border-box; font-family: system-ui, sans-serif; }

  /* ---------- Tab ---------- */
  .tab {
    position: fixed; right: 0; top: 120px;
    z-index: 2147483647;
    display: flex;
    transform: translateX(24px);
    transition: transform 150ms ease;
  }
  .tab:hover, .tab.dragging { transform: translateX(0); }
  .main {
    width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    background: #0a66c2; color: white;
    border: none; border-radius: 8px 0 0 8px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,.25);
  }
  .main svg { width: 26px; height: 26px; }
  .handle {
    width: 24px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    background: #004182; color: #cfe3f7;
    cursor: grab;
  }
  .dragging .handle { cursor: grabbing; }
  .close {
    position: absolute; top: -8px; left: -8px;
    width: 20px; height: 20px; padding: 0;
    border: none; border-radius: 50%;
    background: #004182; color: white; font-size: 11px;
    cursor: pointer;
    opacity: 0; transition: opacity 150ms;
  }
  .tab:hover .close { opacity: 1; }

  /* ---------- Panel ---------- */
  .panel {
    position: fixed; top: 0; right: 0;
    width: 384px; height: 100vh;
    z-index: 2147483647;
    display: none;
    flex-direction: column;
    background: white; color: #263137;
    border-left: 1px solid #eceff5;
    box-shadow: -4px 0 12px rgba(0,0,0,.06);
  }
  .panel.open {
    display: flex;
    animation: slideIn 0.28s ease-out;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  .header {
    display: flex; align-items: center;
    padding: 16px 12px;
    font-size: 16px; font-weight: 600;
  }
  .collapse {
    margin-left: auto;
    display: flex; align-items: center; justify-content: center;
    width: 24px; height: 24px;
    border: none; background: none; color: #6b727f;
    cursor: pointer;
  }
  .collapse:hover { color: #0a66c2; }
  .body {
    display: flex; flex-direction: column; gap: 12px;
    padding: 0 12px;
  }
  .card {
    padding: 12px;
    border: 1px solid #eceff5; border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,.05);
  }
  .job-title { font-size: 16px; font-weight: 600; line-height: 22px; }
  .company { margin-top: 6px; font-size: 12px; color: #8e97a5; }
  .copy-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; height: 52px;
    border: none; border-radius: 10px;
    background: #0a66c2; color: white;
    font-size: 16px; font-weight: 600;
    cursor: pointer;
  }
  .copy-btn:hover { background: #004182; }
  .copy-btn svg { width: 18px; height: 18px; }
  .copy-title-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; height: 40px;
    border: 1.2px solid #0a66c2; border-radius: 10px;
    background: #eef5fc; color: #0a66c2;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
  }
  .copy-title-btn:hover { background: white; }
  .copy-title-btn svg { width: 16px; height: 16px; }
</style>

<div class="tab">
  <button class="main" title="Open JD Copier">${ICON_COPY}</button>
  <div class="handle" title="Drag to move">${ICON_GRIP}</div>
  <button class="close" title="Hide">✕</button>
</div>

<div class="panel">
  <div class="header">
    JD Copier
    <button class="collapse" title="Collapse">${ICON_CHEVRON}</button>
  </div>
  <div class="body">
    <div class="card">
      <div class="job-title"></div>
      <div class="company"></div>
    </div>
    <button class="copy-btn">${ICON_COPY}<span>Copy job description</span></button>
    <button class="copy-title-btn">${ICON_COPY}<span>Copy title</span></button>
  </div>
</div>`;

const tab = root.querySelector(".tab");
const mainBtn = root.querySelector(".main");
const handle = root.querySelector(".handle");
const closeBtn = root.querySelector(".close");
const panel = root.querySelector(".panel");
const collapseBtn = root.querySelector(".collapse");
const copyBtn = root.querySelector(".copy-btn");
const titleEl = root.querySelector(".job-title");
const companyEl = root.querySelector(".company");
const copyTitleBtn = root.querySelector(".copy-title-btn");

// 2. Read page data
function getDescription() {
  const box = document.querySelector('[data-testid="expandable-text-box"]');
  if (!box) return null;
  return box.innerText.replace(/…\s*more\s*$/, "").trim();
}

function getJobInfo() {
  // "(3) Job Title | Company | LinkedIn" -> ["Job Title", "Company", "LinkedIn"]
  const parts = document.title.replace(/^\(\d+\)\s*/, "").split(" | ");
  if (parts.length >= 3) return { title: parts[0], company: parts[1] };
  return { title: "No job selected", company: "" };
}

function refreshCard() {
  const { title, company } = getJobInfo();
  titleEl.textContent = title;     // textContent, not innerHTML, so page text can't inject HTML
  companyEl.textContent = company;
}

// 3. Open / close the panel
let isOpen = false;

function openPanel() {
  isOpen = true;
  refreshCard();
  panel.classList.add("open");
  tab.style.display = "none";
}

function closePanel() {
  isOpen = false;
  panel.classList.remove("open");
  tab.style.display = "";
}

mainBtn.addEventListener("click", openPanel);
collapseBtn.addEventListener("click", closePanel);

// 4. Copy
function flash(btn, label) {
  btn.innerHTML = `${ICON_CHECK}<span>Copied!</span>`;
  setTimeout(() => (btn.innerHTML = `${ICON_COPY}<span>${label}</span>`), 1500);
}

copyBtn.addEventListener("click", async () => {
  const box = document.querySelector('[data-testid="expandable-text-box"]');
  box?.querySelector('[data-testid="expandable-text-button"]')?.click();
  await new Promise(r => setTimeout(r, 300));

  const text = getDescription();
  if (!text) return alert("Description not found");
  await navigator.clipboard.writeText(text);
  flash(copyBtn, "Copy job description");
});

copyTitleBtn.addEventListener("click", async () => {
  const { title } = getJobInfo();
  if (title === "No job selected") return alert("Title not found");
  await navigator.clipboard.writeText(title);
  flash(copyTitleBtn, "Copy title");
});

// 5. Drag the tab up and down
const saved = localStorage.getItem("jdCopierTop");
if (saved) tab.style.top = saved + "px";

handle.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  handle.setPointerCapture(e.pointerId);
  tab.classList.add("dragging");
  const offset = e.clientY - tab.getBoundingClientRect().top;

  const move = (ev) => {
    const max = window.innerHeight - tab.offsetHeight;
    tab.style.top = Math.min(Math.max(0, ev.clientY - offset), max) + "px";
  };
  const up = () => {
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", up);
    tab.classList.remove("dragging");
    localStorage.setItem("jdCopierTop", parseInt(tab.style.top));
  };

  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", up);
});

// 6. Hide the tab until refresh
let closed = false;
closeBtn.addEventListener("click", () => {
  closed = true;
  update();
});

// 7. Show only on /jobs, and keep the card in sync
function update() {
  const onJobs = location.pathname.startsWith("/jobs");
  host.style.display = onJobs && !closed ? "" : "none";
  if (!onJobs && isOpen) closePanel();
}

update();
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    update();
  }
  if (isOpen) refreshCard();   // LinkedIn updates the tab title a bit after the URL changes
}, 500);
