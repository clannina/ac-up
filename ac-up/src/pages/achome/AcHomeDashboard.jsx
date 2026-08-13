import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, Car, Bike, HeartPulse, CalendarClock, Wallet } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext.jsx";
import AcHomeHeader from "../../components/AcHomeHeader.jsx";
import {
  getSpese,
  getScadenze,
  getEntrate,
  generaSpeseRicorrentiDelMese,
  generaEntrateRicorrentiDelMese,
} from "../../lib/acHome";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
  { id: "mediche", label: "Spese mediche", icon: HeartPulse },
];

const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();
const BACKGROUND =
  "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";

function giorniMancanti(dataScadenza) {
  const oggiZero = new Date();
  oggiZero.setHours(0, 0, 0, 0);
  const d = new Date(dataScadenza);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - oggiZero) / (1000 * 60 * 60 * 24));
}

// Stessa logica di saluto/data usata in AC UP (Home.jsx), per coerenza tra le due app.
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

export default function AcHomeDashboard() {
  const { session, profile } = useAuth();
  const [totali, setTotali] = useState({ casa: 0, auto: 0, scooter: 0, mediche: 0 });
  const [scadenze, setScadenze] = useState([]);
  const [residuo, setResiduo] = useState(0);

  const displayName = profile?.display_name || session?.user?.email?.split("@")[0] || "";

  useEffect(() => {
    // Genera (se non gia' fatto questo mese) le spese e le entrate ricorrenti, poi carica tutto.
    Promise.all([
      generaSpeseRicorrentiDelMese(MESE_CORRENTE, ANNO_CORRENTE),
      generaEntrateRicorrentiDelMese(MESE_CORRENTE, ANNO_CORRENTE),
    ]).finally(() => {
      caricaTotali();
      caricaScadenze();
      caricaResiduo();
    });
  }, []);

  async function caricaResiduo() {
    const entrate = await getEntrate(MESE_CORRENTE, ANNO_CORRENTE);
    const totaleEntrate = entrate.reduce((tot, e) => tot + Number(e.importo), 0);
    const tutteLeSpese = await Promise.all(GRUPPI.map((g) => getSpese({ mese: MESE_CORRENTE, anno: ANNO_CORRENTE, gruppo: g.id })));
    const totaleSpese = tutteLeSpese.flat().reduce((tot, s) => tot + Number(s.importo), 0);
    setResiduo(totaleEntrate - totaleSpese);
  }

  async function caricaTotali() {
    const risultati = {};
    for (const g of GRUPPI) {
      const lista = await getSpese({ mese: MESE_CORRENTE, anno: ANNO_CORRENTE, gruppo: g.id });
      risultati[g.id] = lista.reduce((tot, s) => tot + Number(s.importo), 0);
    }
    setTotali(risultati);
  }

  async function caricaScadenze() {
    const lista = await getScadenze();
    const future = lista
      .filter((s) => giorniMancanti(s.data_scadenza) >= 0)
      .sort((a, b) => new Date(a.data_scadenza) - new Date(b.data_scadenza))
      .slice(0, 3);
    setScadenze(future);
  }

  return (
    <div
      className="min-h-screen pb-28 px-4 pt-6"
      style={{ background: BACKGROUND }}
    >
      <AcHomeHeader />

      {/* Data + saluto, stesso pattern di AC UP */}
      <div className="mb-6">
        <p className="font-mono-num text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          {todayLabel()}
        </p>
        <h1 className="text-4xl font-bold" style={{ color: "#fff" }}>
          {greeting()}{displayName ? `, ${displayName}` : ""}
        </h1>
      </div>

      {/* Residuo mensile: entrate - spese */}
      <Link to="/ac-home/entrate" className={`${GLASS} block rounded-3xl p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Residuo di questo mese</p>
        </div>
        <p className="font-mono-num text-3xl" style={{ color: residuo >= 0 ? "#fff" : "#ffd0d0" }}>
          € {residuo.toFixed(2)}
        </p>
      </Link>

      {/* Riepilogo prossime scadenze */}
      <Link to="/ac-home/scadenze" className={`${GLASS} block rounded-3xl p-4 mb-5`}>
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

      {/* Card Casa / Auto / Scooter con totale speso del mese */}
      <div className="flex flex-col gap-3">
        {GRUPPI.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.id}
              to={`/ac-home/spese?gruppo=${g.id}`}
              className={`${GLASS} flex items-center justify-between rounded-3xl p-4`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "#fff" }}
                >
                  <Icon size={20} color={T.forest} />
                </div>
                <p className="font-display text-base" style={{ color: "#fff" }}>{g.label}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Speso questo mese
                </p>
                <p className="font-mono-num text-lg" style={{ color: "#fff" }}>
                  € {totali[g.id].toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
