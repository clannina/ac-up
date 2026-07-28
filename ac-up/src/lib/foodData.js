export const FILOSOFIA = [
  "Nessun senso di colpa.",
  "La pizza settimanale è già prevista.",
  "Nessuna punizione dopo un pasto libero.",
  "Il menu si adatta all'utente.",
  "L'utente mantiene sempre il controllo.",
  "Interfaccia semplice e veloce.",
];

export const PREFERENZE = {
  evitare: ["Bietole", "Spinaci cotti", "Cavolfiore cotto", "Merluzzo", "Orata", "Pesce spada", "Sgombro", "Quinoa", "Cibi piccanti"],
  consentiti: [
    "Tonno", "Salmone affumicato", "Salmone in scatola", "Gamberi", "Seppie", "Totani", "Cozze", "Vongole", "Polpo",
    "Pollo", "Tacchino", "Manzo", "Avocado", "Yogurt greco", "Mozzarella", "Ricotta", "Fiocchi di latte",
    "Pane", "Pasta", "Riso", "Cous cous", "Farro", "Orzo",
  ],
};

export const STATI_ALIMENTO = {
  preferito: { emoji: "❤️", label: "Preferito" },
  approvato: { emoji: "✅", label: "Approvato" },
  da_provare: { emoji: "🟡", label: "Da provare" },
  escluso: { emoji: "❌", label: "Escluso" },
};

export const CATEGORIE_RICETTE = {
  carne: { label: "Carne", target: 30, maxSettimana: 3 },
  pesce: { label: "Pesce", target: 30, minSettimana: 2 },
  legumi: { label: "Legumi", target: 30, minSettimana: 2 },
  uova_latticini: { label: "Uova & latticini", target: 20, minSettimana: 1, maxSettimana: 2 },
  colazioni: { label: "Colazioni", target: 20 },
};

export const REGOLE_GENERATORE = [
  "Rotazione automatica delle proteine.",
  "Massimo 3 pasti di carne a settimana.",
  "Almeno 2 pasti di pesce a settimana.",
  "Almeno 2 pasti di legumi a settimana.",
  "1-2 pasti con uova/latticini a settimana.",
  "Pizza settimanale sempre prevista.",
  "Pranzi adatti alla schiscetta (trasportabili, buoni anche freddi).",
  "Cene pronte entro circa 35 minuti.",
  "Colazioni mai ripetute per più di due giorni consecutivi.",
];

function isEscluso(name) {
  return PREFERENZE.evitare.some((e) => name.toLowerCase().includes(e.toLowerCase()));
}

export { isEscluso };
