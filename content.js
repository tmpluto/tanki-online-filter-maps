// `maps` comes from data.js (loaded before this file in manifest.json)

const STORAGE_KEY = "hiddenMaps"; // array of English map names

let hiddenMaps = new Set();

// Every known name (en + ru) -> English map name, longest names first so that
// "Madness 2" is matched before "Madness".
const NAME_LOOKUP = maps
  .flatMap((m) => [
    { needle: m.en.toLowerCase(), en: m.en },
    { needle: m.ru.toLowerCase(), en: m.en },
  ])
  .sort((a, b) => b.needle.length - a.needle.length);

function findMapEn(text) {
  const hit = NAME_LOOKUP.find((entry) => text.includes(entry.needle));
  return hit ? hit.en : null;
}

function checkBattles() {
  const table = document.querySelector(
    ".ProBattlesComponentStyle-battlesContainer table.ProBattlesComponentStyle-table"
  );

  if (!table) return;

  injectFilterButton(); // battles table is on screen: make sure our button is there

  table.querySelectorAll("table.ProBattlesComponentStyle-table tbody tr").forEach((tr) => {
    const nameCell = tr.querySelector("td.ProBattlesComponentStyle-cellName");
    if (!nameCell) return;

    const mapEn = findMapEn(nameCell.textContent.toLowerCase());

    if (mapEn !== null && hiddenMaps.has(mapEn)) {
      tr.style.opacity = "0.4";
      tr.style.height = "28px";
      tr.dataset.mapFiltered = "1";
    }
  });
}

// Remove our custom styling from every row we touched
function clearFilterStyles() {
  document.querySelectorAll("tr[data-map-filtered]").forEach((tr) => {
    tr.style.opacity = "";
    tr.style.height = "";
    delete tr.dataset.mapFiltered;
  });
}

// Filter list changed: wipe all styling, then reapply from scratch
function setHidden(list) {
  hiddenMaps = new Set(Array.isArray(list) ? list : []);
  clearFilterStyles();
  checkBattles();
}

chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (res) => setHidden(res[STORAGE_KEY]));

// Apply changes from the options page immediately, no reload needed
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes[STORAGE_KEY]) {
    setHidden(changes[STORAGE_KEY].newValue);
  }
});

// ---------------------------------------------------------------------------
// "Filter Maps" button, injected after the TAB (chat) block in the battles nav
// ---------------------------------------------------------------------------

const NAV_SELECTOR = ".ProBattlesComponentStyle-navigationBlock";
const BUTTON_ID = "tofm-filter-btn";
const STYLE_ID = "tofm-style";

function ensureButtonStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${BUTTON_ID} {
      display: flex;
      align-items: center;
      align-self: center;
      gap: 8px;
      margin-left: 20px;
      padding: 7px 16px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.05em;
      white-space: nowrap;
      color: #6cf23a;
      background: rgba(108, 242, 58, 0.14);
      border: 1px solid rgba(108, 242, 58, 0.7);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(108, 242, 58, 0.25);
      cursor: pointer;
      user-select: none;
      transition: color 0.15s, border-color 0.15s, background 0.15s, box-shadow 0.15s;
    }
    #${BUTTON_ID} svg { width: 14px; height: 14px; flex: none; }
    #${BUTTON_ID}:hover {
      color: #fff;
      border-color: #6cf23a;
      background: rgba(108, 242, 58, 0.3);
      box-shadow: 0 0 12px rgba(108, 242, 58, 0.5);
    }
    #${BUTTON_ID}:active { transform: translateY(1px); }
  `;
  document.head.appendChild(style);
}

function createFilterButton() {
  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.type = "button";
  btn.innerHTML = `
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M1 2h14l-5.4 6.3V14l-3.2-1.8V8.3z"/>
    </svg>
    <span>Filter Maps</span>
  `;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    try {
      chrome.runtime.sendMessage({ type: "open-options" });
    } catch (err) {
      // extension was reloaded/updated: this content script is stale
      console.warn("Filter Maps: reload the page to use the button.", err);
    }
  });

  return btn;
}

// Adds the button unless it's already there (called from checkBattles once the table exists)
function injectFilterButton() {
  const nav = document.querySelector(NAV_SELECTOR);
  if (!nav || nav.querySelector("#" + BUTTON_ID)) return;

  ensureButtonStyles();
  const btn = createFilterButton();
  const first = nav.firstElementChild;
  if (first) first.after(btn); // 2nd child
  else nav.appendChild(btn);
}

setInterval(checkBattles, 1000);