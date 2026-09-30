const WORDS = [
    "Serpuhov",
    "Серпухов",

    "Polygon",
    "Полигон",

    "Island",
    "Остров",

    "Sandbox",
    "Песочница",

    "Arena",
    "Арена",

    "Courage",
    "Кураж",

    "Wave",
    "Волна",

    "Skyscrapers",
    "Небоскрёбы",

    "Hill",
    "Холм",

    "Aleksandrovsk",
    "Александровск",

];

function checkBattles() {
  const table = document.querySelector(
    ".ProBattlesComponentStyle-battlesContainer table.ProBattlesComponentStyle-table"
  );

  if (!table) return;

  table.querySelectorAll("table.ProBattlesComponentStyle-table tbody tr").forEach((tr) => {
    const nameCell = tr.querySelector(
      "td.ProBattlesComponentStyle-cellName"
    );

    if (!nameCell) return;

    const name = nameCell.textContent.toLowerCase();

    const match = WORDS.some((word) =>
      name.includes(word.toLowerCase())
    );

    // tr.style.opacity = match ? "0.4" : "";
    // tr.style.height = match ? "28px" : "";

    if (match) {
      tr.style.opacity = "0.4";
      tr.style.height = "28px";
    }

  });
}

setInterval(checkBattles, 1000);
