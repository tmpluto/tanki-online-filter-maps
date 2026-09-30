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

setInterval(checkBattles, 1000);