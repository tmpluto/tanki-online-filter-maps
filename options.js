const STORAGE_KEY = "hiddenMaps"; // array of English map names

const listEl = document.getElementById("list");
const searchEl = document.getElementById("search");
const clearBtn = document.getElementById("clearSearch");
const statusEl = document.getElementById("status");
const emptyEl = document.getElementById("empty");

let selected = new Set();
const rows = []; // { map, label, checkbox }

function render() {
  maps.forEach((map) => {
    const label = document.createElement("label");
    label.className = "map";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selected.has(map.en);
    checkbox.addEventListener("change", () => {
      checkbox.checked ? selected.add(map.en) : selected.delete(map.en);
      label.classList.toggle("on", checkbox.checked);
      save();
    });

    const names = document.createElement("span");
    names.className = "names";
    const en = document.createElement("span");
    en.textContent = map.en;
    const ru = document.createElement("span");
    ru.className = "ru";
    ru.textContent = map.ru;
    names.append(en, ru);

    label.classList.toggle("on", checkbox.checked);
    label.append(checkbox, names);
    listEl.appendChild(label);
    rows.push({ map, label, checkbox });
  });
  updateStatus();
}

function updateStatus(saved = false) {
  const n = selected.size;
  const en = `${saved ? "Saved. " : ""}${n} of ${maps.length} maps hidden`;
  const ru = `${saved ? "Сохранено. " : ""}Скрыто карт: ${n} из ${maps.length}`;

  const enEl = document.createElement("span");
  enEl.textContent = en;
  const ruEl = document.createElement("span");
  ruEl.className = "tr";
  ruEl.textContent = ru;
  statusEl.replaceChildren(enEl, ruEl);
}

let saveTimer;
function save() {
  chrome.storage.sync.set({ [STORAGE_KEY]: [...selected] }, () => {
    updateStatus(true);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => updateStatus(), 2000);
  });
}

function visibleRows() {
  return rows.filter((r) => !r.label.hidden);
}

searchEl.addEventListener("input", () => {
  clearBtn.hidden = searchEl.value === "";
  const q = searchEl.value.trim().toLowerCase();
  rows.forEach((r) => {
    r.label.hidden = q && !(r.map.en.toLowerCase().includes(q) || r.map.ru.toLowerCase().includes(q));
  });
  emptyEl.hidden = visibleRows().length > 0;
});

clearBtn.addEventListener("click", () => {
  searchEl.value = "";
  searchEl.dispatchEvent(new Event("input")); // re-run the filter
  searchEl.focus();
});

chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (res) => {
  selected = new Set(res[STORAGE_KEY]);
  render();
});