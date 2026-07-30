/**
 * Design system condiviso da tutte le pagine di AC UP — stile "vetro
 * liquido": sfondo a gradiente vivido con i colori del brand, card di
 * vetro semi-trasparenti sopra, testo bianco. I numeri/icone dentro gli
 * anelli usano un cerchio bianco pieno (non trasparente) con testo scuro,
 * altrimenti bianco su vetro chiaro diventa illeggibile.
 */
export const T = {
  sage: "#5E8C61",
  forest: "#45684A",
  paper: "#F7F8F4",
  ink: "#1E2B22",
  stone: "#6B746D",
  mist: "#E4E7E4",
  protein: "#5B8DEF",
  carbs: "#F2994A",
  fat: "#62C370",
  coral: "#E76F51",
  cream: "#FFE8D6", // per i titoli di sezione sopra sfondo colorato
};

/** Sfondo a gradiente pieno pagina. */
export const PAGE_GRADIENT =
  "linear-gradient(135deg, #2E4A31 0%, #5E8C61 28%, #E76F51 62%, #F2994A 100%)";

/** Pannello di vetro sopra lo sfondo colorato. */
export const GLASS =
  "bg-white/15 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.12)]";

/** Titolo di sezione: maiuscolo, grassetto, color crema (leggibile su sfondo colorato). */
export const SECTION_TITLE = "font-bold uppercase tracking-wider";
