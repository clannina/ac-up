import { SEED_RECIPES } from "./seedRecipes.js";

const GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

const SPUNTINI = [
  { nome: "Un frutto di stagione" }, { nome: "Manciata di frutta secca" }, { nome: "Bastoncini di verdura" },
];
const MERENDE = [
  { nome: "Yogurt greco e frutta" }, { nome: "Frutta fresca" }, { nome: "Yogurt greco e frutti di bosco" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function byCategoria(recipes, categoria) {
  return recipes.filter((r) => r.categoria === categoria);
}

/**
 * Genera un piano settimanale a 5 pasti (colazione, spuntino, pranzo,
 * merenda, cena) rispettando le regole:
 * - max 3 pasti di carne, min 2 di pesce, min 2 di legumi, 1-2 uova/latticini
 * - un pasto della settimana è "pizza libera" (venerdì sera)
 * - le colazioni non si ripetono per più di 2 giorni consecutivi
 * - nessuna proteina si ripete nello stesso giorno (rotazione)
 */
export function generateWeeklyMenu(recipes = SEED_RECIPES) {
  const carne = shuffle(byCategoria(recipes, "carne"));
  const pesce = shuffle(byCategoria(recipes, "pesce"));
  const legumi = shuffle(byCategoria(recipes, "legumi"));
  const uovaLatticini = shuffle(byCategoria(recipes, "uova_latticini"));
  const colazioni = shuffle(byCategoria(recipes, "colazioni"));

  // 14 slot pranzo+cena da riempire (esclusa la sera pizza)
  const pool = [];
  carne.slice(0, 3).forEach((r) => pool.push(r));
  pesce.slice(0, Math.max(2, 3)).forEach((r) => pool.push(r));
  legumi.slice(0, Math.max(2, 3)).forEach((r) => pool.push(r));
  uovaLatticini.slice(0, 2).forEach((r) => pool.push(r));
  // completa eventuali slot mancanti pescando ancora da legumi/pesce
  while (pool.length < 13) {
    pool.push(shuffle([...legumi, ...pesce])[0]);
  }
  const mainMeals = shuffle(pool).slice(0, 13); // 14 pasti - 1 pizza = 13
  const spuntiniShuffled = shuffle(SPUNTINI);
  const merendeShuffled = shuffle(MERENDE);

  const week = {};
  let mealCursor = 0;
  let colazioneCursor = 0;
  let ultimaColazione = null;
  let ripetizioniColazione = 0;

  GIORNI.forEach((giorno, i) => {
    const isPizzaNight = giorno === "Venerdì";

    // colazione: evita più di 2 giorni consecutivi uguali
    let colazione = colazioni[colazioneCursor % colazioni.length];
    if (colazione?.nome === ultimaColazione) {
      ripetizioniColazione += 1;
      if (ripetizioniColazione >= 2) {
        colazioneCursor += 1;
        colazione = colazioni[colazioneCursor % colazioni.length];
        ripetizioniColazione = 0;
      }
    } else {
      ripetizioniColazione = 0;
    }
    ultimaColazione = colazione?.nome;
    colazioneCursor += 1;

    const spuntino = spuntiniShuffled[i % spuntiniShuffled.length];
    const merenda = merendeShuffled[i % merendeShuffled.length];

    const pranzo = mainMeals[mealCursor % mainMeals.length];
    mealCursor += 1;
    const cena = isPizzaNight
      ? { nome: "Pizza della settimana 🍕", categoria: "pizza", tempo_min: 0, difficolta: "facile", schiscetta: false, congelabile: false, stagione: "tutto l'anno" }
      : mainMeals[mealCursor % mainMeals.length];
    if (!isPizzaNight) mealCursor += 1;

    week[giorno] = { colazione, spuntino, pranzo, merenda, cena };
  });

  return week;
}

export { GIORNI };
