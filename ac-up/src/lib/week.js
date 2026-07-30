// La settimana di pianificazione: sempre la prossima settimana completa
// (lun-dom), condivisa tra Menu (dove si genera/salva) e Spesa (dove se
// ne leggono gli ingredienti), così puntano sempre alla stessa settimana.
export function nextWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const offsetToMonday = (1 - today.getDay() + 7) % 7;
  const monday = new Date(today);
  monday.setDate(monday.getDate() + offsetToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export function formatShortDate(d) {
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}
