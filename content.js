console.log("JD Copier loaded");

const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
const ICON_TITLE = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M12 4v16M8 20h8"/></svg>`;
const ICON_DESCRIPTION = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 12h8M8 16h8"/></svg>`;
const ICON_ARROW = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const ICON_ERROR = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>`;
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
  .action-btn {
    display: flex; align-items: center; justify-content: flex-start; gap: 10px;
    width: 100%; height: 40px; padding: 0 12px;
    border: 1px solid #dce1e6; border-radius: 4px;
    background: #fff; color: #374151;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px; font-weight: 500;
    cursor: pointer;
    transition: background 160ms, border-color 160ms, color 160ms;
  }
  .action-btn:hover { background: #f6f8fa; border-color: #9ca3af; }
  .action-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
  .action-btn span { font-family: inherit; }
  .action-btn:disabled { cursor: wait; }
  .action-btn[data-feedback="success"] { background: #f0fdf4; border-color: #86b99a; color: #166534; }
  .action-btn[data-feedback="error"] { background: #fff5f5; border-color: #e0a0a0; color: #b42318; }
  .action-btn[data-feedback] svg { animation: feedback-in 180ms ease-out; }
  @keyframes feedback-in {
    from { opacity: 0; transform: scale(.65); }
    to { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .action-btn { transition: none; }
    .action-btn[data-feedback] svg { animation: none; }
  }
  .action-btn:focus-visible, .time-input:focus-visible {
    outline: 2px solid #64748b; outline-offset: 2px;
  }
  .time-filter { display: flex; flex-direction: column; gap: 8px; margin: 0; }
  .time-filter[hidden] { display: none; }
  .time-label {
    color: #6b7280;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px; font-weight: 500;
  }
  .time-row { display: flex; gap: 6px; }
  .time-input {
    flex: 1; min-width: 0; height: 40px; padding: 0 12px;
    border: 1px solid #dce1e6; border-radius: 4px;
    background: #fff; color: #374151;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px; font-weight: 500;
  }
  .time-input::placeholder { color: #9ca3af; opacity: 1; }
  .go-btn { width: 40px; padding: 0; justify-content: center; flex-shrink: 0; }
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
    <button class="action-btn copy-title-btn" aria-live="polite">${ICON_TITLE}<span>Copy title</span></button>
    <button class="action-btn copy-btn" aria-live="polite">${ICON_DESCRIPTION}<span>Copy job description</span></button>
    <form class="time-filter" hidden>
      <label class="time-label" for="time-frame">Change time frame</label>
      <div class="time-row">
        <input id="time-frame" class="time-input" type="text" placeholder="e.g. 25 hours or 2 days" required autocomplete="off">
        <button class="action-btn go-btn" type="submit" aria-label="Apply time filter" title="Apply time filter">${ICON_ARROW}</button>
      </div>
    </form>
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
const timeForm = root.querySelector(".time-filter");
const timeInput = root.querySelector(".time-input");

// 2. Read page data
function getDescriptionBox() {
  // Search results contain other expandable blocks (profile matches, etc.).
  const heading = [...document.querySelectorAll("h2")]
    .find(el => el.textContent.trim().toLowerCase() === "about the job");
  if (heading) {
    for (let section = heading.parentElement; section; section = section.parentElement) {
      const box = section.querySelector('[data-testid="expandable-text-box"]');
      if (box) return box;
    }
  }
  // Preserve the standalone job layout's existing lookup.
  return isSearchView() ? null : document.querySelector('[data-testid="expandable-text-box"]');
}

function getDescription() {
  const box = getDescriptionBox();
  if (!box) return null;
  return box.innerText.replace(/…\s*more\s*$/, "").trim();
}

function getJobInfo() {
  if (isSearchView()) {
    const jobId = new URL(location.href).searchParams.get("currentJobId");
    if (!jobId || !/^\d+$/.test(jobId)) return { title: "No job selected", company: "" };
    const selector = `a[href*="/jobs/view/${jobId}/"], a[href$="/jobs/view/${jobId}"]`;
    // Start at the description and walk up to the selected job's panel so a
    // result card elsewhere on the page cannot supply another job's title.
    const box = getDescriptionBox();
    for (let scope = box?.parentElement || document; scope; scope = scope.parentElement) {
      const link = [...scope.querySelectorAll(selector)]
        .find(el => el.innerText.trim());
      if (!link) continue;
      let company = "";
      for (let header = link.parentElement; header; header = header.parentElement) {
        const companyLink = [...header.querySelectorAll('a[href*="/company/"]')]
          .find(el => el.innerText.trim());
        if (companyLink) { company = companyLink.innerText.trim(); break; }
        if (header === scope) break;
      }
      return { title: link.innerText.trim(), company };
    }
    return { title: "No job selected", company: "" };
  }
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
const feedbackTimers = new WeakMap();

function flash(btn, label, icon, error = "") {
  clearTimeout(feedbackTimers.get(btn));
  btn.dataset.feedback = error ? "error" : "success";
  btn.innerHTML = `${error ? ICON_ERROR : ICON_CHECK}<span>${error || "Copied!"}</span>`;
  feedbackTimers.set(btn, setTimeout(() => {
    delete btn.dataset.feedback;
    btn.innerHTML = `${icon}<span>${label}</span>`;
    feedbackTimers.delete(btn);
  }, 1800));
}

copyBtn.addEventListener("click", async () => {
  copyBtn.disabled = true;
  try {
    const box = getDescriptionBox();
    box?.querySelector('[data-testid="expandable-text-button"]')?.click();
    await new Promise(r => setTimeout(r, 300));

    const text = getDescription();
    if (!text) return flash(copyBtn, "Copy job description", ICON_DESCRIPTION, "Description not found");
    await navigator.clipboard.writeText(text);
    flash(copyBtn, "Copy job description", ICON_DESCRIPTION);
  } catch {
    flash(copyBtn, "Copy job description", ICON_DESCRIPTION, "Copy failed");
  } finally {
    copyBtn.disabled = false;
  }
});

copyTitleBtn.addEventListener("click", async () => {
  copyTitleBtn.disabled = true;
  try {
    const { title } = getJobInfo();
    if (!title.trim() || title === "No job selected") {
      return flash(copyTitleBtn, "Copy title", ICON_TITLE, "Title not found");
    }
    await navigator.clipboard.writeText(title);
    flash(copyTitleBtn, "Copy title", ICON_TITLE);
  } catch {
    flash(copyTitleBtn, "Copy title", ICON_TITLE, "Copy failed");
  } finally {
    copyTitleBtn.disabled = false;
  }
});

// Apply LinkedIn's posted-within filter, regardless of its position in the URL.
function isSearchView() {
  return /^\/jobs\/(?:search|search-results)\/?$/.test(location.pathname);
}

function parseTimeSeconds(value) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|d|day|days)$/i);
  if (!match) return null;
  const seconds = Number(match[1]) * (/^h/i.test(match[2]) ? 3600 : 86400);
  const rounded = Math.round(seconds);
  return Number.isSafeInteger(rounded) && rounded > 0 ? rounded : null;
}

timeInput.addEventListener("input", () => timeInput.setCustomValidity(""));
timeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isSearchView()) return;
  const seconds = parseTimeSeconds(timeInput.value);
  if (seconds === null) {
    timeInput.setCustomValidity("Enter a positive duration, such as 25 hours or 2 days.");
    timeInput.reportValidity();
    return;
  }
  const url = new URL(location.href);
  url.searchParams.set("f_TPR", `r${seconds}`);
  location.assign(url.href);
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
  timeForm.hidden = !isSearchView();
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
