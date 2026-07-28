/**
 * Ricette di partenza, 5 per categoria (25 totali) per avere subito un'app
 * funzionante. Il ricettario completo (130 ricette: 30 carne, 30 pesce,
 * 30 legumi, 20 uova/latticini, 20 colazioni) va costruito nei prossimi
 * incrementi e caricato nella tabella `recipes` di Supabase.
 */
export const SEED_RECIPES = [
  // --- CARNE ---
  { nome: "Pollo al limone con verdure", categoria: "carne", tempo_min: 25, difficolta: "facile", schiscetta: true, congelabile: true, stagione: "tutto l'anno" },
  { nome: "Straccetti di manzo e rucola", categoria: "carne", tempo_min: 15, difficolta: "facile", schiscetta: false, congelabile: false, stagione: "tutto l'anno" },
  { nome: "Tacchino in padella con peperoni", categoria: "carne", tempo_min: 20, difficolta: "facile", schiscetta: true, congelabile: true, stagione: "estate" },
  { nome: "Polpette di manzo al forno", categoria: "carne", tempo_min: 35, difficolta: "media", schiscetta: true, congelabile: true, stagione: "tutto l'anno" },
  { nome: "Pollo e curry di verdure", categoria: "carne", tempo_min: 30, difficolta: "media", schiscetta: true, congelabile: true, stagione: "tutto l'anno" },

  // --- PESCE ---
  { nome: "Gamberi saltati con zucchine", categoria: "pesce", tempo_min: 15, difficolta: "facile", schiscetta: false, congelabile: false, stagione: "estate" },
  { nome: "Seppie in umido con piselli", categoria: "pesce", tempo_min: 30, difficolta: "media", schiscetta: true, congelabile: true, stagione: "primavera" },
  { nome: "Insalata di tonno, fagioli e pomodorini", categoria: "pesce", tempo_min: 10, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "estate" },
  { nome: "Polpo con patate al forno", categoria: "pesce", tempo_min: 40, difficolta: "media", schiscetta: true, congelabile: true, stagione: "tutto l'anno" },
  { nome: "Cozze e vongole in bianco con crostini", categoria: "pesce", tempo_min: 20, difficolta: "facile", schiscetta: false, congelabile: false, stagione: "tutto l'anno" },

  // --- LEGUMI ---
  { nome: "Zuppa di lenticchie e carote", categoria: "legumi", tempo_min: 30, difficolta: "facile", schiscetta: true, congelabile: true, stagione: "autunno" },
  { nome: "Hummus di ceci con verdure crude", categoria: "legumi", tempo_min: 10, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "tutto l'anno" },
  { nome: "Pasta e fagioli", categoria: "legumi", tempo_min: 25, difficolta: "facile", schiscetta: true, congelabile: true, stagione: "inverno" },
  { nome: "Farro con cannellini e pomodorini", categoria: "legumi", tempo_min: 20, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "estate" },
  { nome: "Polpette di ceci al forno", categoria: "legumi", tempo_min: 35, difficolta: "media", schiscetta: true, congelabile: true, stagione: "tutto l'anno" },

  // --- UOVA & LATTICINI ---
  { nome: "Frittata di zucchine", categoria: "uova_latticini", tempo_min: 15, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "estate" },
  { nome: "Uova strapazzate con avocado", categoria: "uova_latticini", tempo_min: 10, difficolta: "facile", schiscetta: false, congelabile: false, stagione: "tutto l'anno" },
  { nome: "Ricotta, pere e miele", categoria: "uova_latticini", tempo_min: 5, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "autunno" },
  { nome: "Mozzarella caprese", categoria: "uova_latticini", tempo_min: 10, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "estate" },
  { nome: "Uova in camicia con spinaci saltati", categoria: "uova_latticini", tempo_min: 15, difficolta: "media", schiscetta: false, congelabile: false, stagione: "tutto l'anno" },

  // --- COLAZIONI ---
  { nome: "Yogurt greco, avena e frutti di bosco", categoria: "colazioni", tempo_min: 5, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "tutto l'anno" },
  { nome: "Pane integrale, ricotta e miele", categoria: "colazioni", tempo_min: 5, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "tutto l'anno" },
  { nome: "Porridge di avena con mela e cannella", categoria: "colazioni", tempo_min: 10, difficolta: "facile", schiscetta: false, congelabile: false, stagione: "autunno" },
  { nome: "Toast integrale con avocado e uovo", categoria: "colazioni", tempo_min: 10, difficolta: "facile", schiscetta: false, congelabile: false, stagione: "tutto l'anno" },
  { nome: "Skyr con banana e frutta secca", categoria: "colazioni", tempo_min: 5, difficolta: "facile", schiscetta: true, congelabile: false, stagione: "tutto l'anno" },
];
