import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wind, Pill, CalendarClock, HeartPulse } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext.jsx";
import AcPepeHeader from "../../components/AcPepeHeader.jsx";
import { getUltimoRespiro, statoRespiro, getTerapie, getSomministrazioniData, getScadenze } from "../../lib/acPepe";
import { getSpese } from "../../lib/acHome";

const BACKGROUND = "linear-gradient(180deg, #EE6C04 0%, #AB003E 100%)";

function oggiISO() {
  return new Date().toISOString().slice(0, 10);
}

const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();

function giorniMancanti(dataScadenza) {
  const oggiZero = new Date();
  oggiZero.setHours(0, 0, 0, 0);
  const d = new Date(dataScadenza);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - oggiZero) / (1000 * 60 * 60 * 24));
}

// Stessa logica di saluto/data usata in AC UP e AC Home, per coerenza tra le tre app.
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

function todayLabel() {
  const d = new Date();
  const s = d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AcPepeDashboard() {
  const { session, profile } = useAuth();
  const [ultimoRespiro, setUltimoRespiro] = useState(null);
  const [terapie, setTerapie] = useState([]);
  const [fatte, setFatte] = useState({});
  const [scadenze, setScadenze] = useState([]);
  const [speseMediche, setSpeseMediche] = useState(0);
  const [caricato, setCaricato] = useState(false);

  const displayName = profile?.display_name || session?.user?.email?.split("@")[0] || "";

  useEffect(() => {
    caricaTutto();
  }, []);

  async function caricaTutto() {
    const [respiro, listaTerapie, somministrazioni, listaScadenze, speseMedicheMese] = await Promise.all([
      getUltimoRespiro(),
      getTerapie(),
      getSomministrazioniData(oggiISO()),
      getScadenze(),
      getSpese({ mese: MESE_CORRENTE, anno: ANNO_CORRENTE, gruppo: "mediche" }),
    ]);
    setUltimoRespiro(respiro);
    setTerapie(listaTerapie);
    const mappa = {};
    somministrazioni.forEach((s) => { mappa[`${s.terapia_id}__${s.orario}`] = s.fatto; });
    setFatte(mappa);
    const future = listaScadenze
      .filter((s) => giorniMancanti(s.data_scadenza) >= 0)
      .sort((a, b) => new Date(a.data_scadenza) - new Date(b.data_scadenza))
      .slice(0, 3);
    setScadenze(future);
    setSpeseMediche(speseMedicheMese.reduce((tot, s) => tot + Number(s.importo), 0));
    setCaricato(true);
  }

  const stato = ultimoRespiro ? statoRespiro(ultimoRespiro.bpm) : null;
  // Ogni terapia può avere più orari al giorno: contiamo le singole somministrazioni, non le terapie.
  // Le terapie "a intervalli" (es. ogni 72 ore) contano solo se oggi è davvero il loro giorno.
  const terapieDovuteOggi = terapie.filter((t) => t.frequenza !== "intervallo" || !t.prossima_dose || t.prossima_dose <= oggiISO());
  const occorrenzeOggi = terapieDovuteOggi.flatMap((t) => (t.orari && t.orari.length > 0 ? t.orari : [""]).map((orario) => ({ terapiaId: t.id, orario })));
  const occorrenzeDaFare = occorrenzeOggi.filter((o) => !fatte[`${o.terapiaId}__${o.orario}`]).length;

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcPepeHeader />

      {/* Data + saluto, stesso pattern di AC UP e AC Home */}
      <div className="mb-6">
        <p className="font-mono-num text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          {todayLabel()}
        </p>
        <h1 className="text-4xl font-bold" style={{ color: "#fff" }}>
          {greeting()}{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>Come sta Pepe oggi?</p>
      </div>

      {/* Ultimo respiro */}
      <Link to="/ac-pepe/respiri" className={`${GLASS} block rounded-3xl p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-1">
          <Wind size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Ultima misurazione respiri</p>
        </div>
        {ultimoRespiro ? (
          <div className="flex items-end justify-between">
            <p className="font-mono-num text-3xl" style={{ color: "#fff" }}>
              {ultimoRespiro.bpm} <span className="text-sm font-sans">resp/min</span>
            </p>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: stato.colore, color: "#1a1a1a" }}>
              {stato.label}
            </span>
          </div>
        ) : (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>Nessuna misurazione ancora. Tocca per registrarne una.</p>
        )}
      </Link>

      {/* Terapie di oggi */}
      <Link to="/ac-pepe/terapie" className={`${GLASS} block rounded-3xl p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-2">
          <Pill size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Terapie di oggi</p>
        </div>
        {terapie.length === 0 ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>Nessuna terapia impostata.</p>
        ) : occorrenzeDaFare === 0 ? (
          <p className="text-sm" style={{ color: "#fff" }}>✓ Tutte le terapie di oggi sono state fatte</p>
        ) : (
          <p className="text-sm" style={{ color: "#fff" }}>
            <span className="font-mono-num font-semibold">{occorrenzeDaFare}</span> di <span className="font-mono-num">{occorrenzeOggi.length}</span> ancora da fare
          </p>
        )}
      </Link>

      {/* Spese mediche (dati condivisi con AC Home) */}
      <Link to="/ac-home/spese?gruppo=mediche" className={`${GLASS} block rounded-3xl p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-1">
          <HeartPulse size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Spese mediche questo mese</p>
        </div>
        <p className="font-mono-num text-3xl" style={{ color: "#fff" }}>€ {speseMediche.toFixed(2)}</p>
      </Link>

      {/* Prossime scadenze */}
      <Link to="/ac-pepe/scadenze" className={`${GLASS} block rounded-3xl p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-2">
          <CalendarClock size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Prossime scadenze</p>
        </div>
        {scadenze.length === 0 ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>Nessuna scadenza in arrivo.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {scadenze.map((s) => {
              const giorni = giorniMancanti(s.data_scadenza);
              return (
                <div key={s.id} className="flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
                  <span>{s.titolo}</span>
                  <span className="font-mono-num">{giorni === 0 ? "oggi" : `tra ${giorni}g`}</span>
                </div>
              );
            })}
          </div>
        )}
      </Link>
    </div>
  );
}
