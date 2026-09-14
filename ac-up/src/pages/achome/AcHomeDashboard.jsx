import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, Car, Bike, HeartPulse, CalendarClock, Wallet, Receipt, Users } from "lucide-react";
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
  { id: "mediche", label: "Veterinarie", icon: HeartPulse },
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
  const [totaleEntrate, setTotaleEntrate] = useState(0);
  const [doveVannaAnna, setDoveVannaAnna] = useState(0);
  const [doveAnnaVanna, setDoveAnnaVanna] = useState(0);

  const displayName = profile?.display_name || session?.user?.email?.split("@")[0] || "";
  const totaleSpeseMese = GRUPPI.reduce((tot, g) => tot + (totali[g.id] || 0), 0);

  useEffect(() => {
    // Genera (se non gia' fatto questo mese) le spese e le entrate ricorrenti, poi carica tutto.
    Promise.all([
      generaSpeseRicorrentiDelMese(MESE_CORRENTE, ANNO_CORRENTE),
      generaEntrateRicorrentiDelMese(MESE_CORRENTE, ANNO_CORRENTE),
    ]).finally(() => {
      caricaTotali();
      caricaScadenze();
      caricaEntrate();
      caricaCondivise();
    });
  }, []);

  // Chi deve ancora quanto a chi: guarda TUTTE le spese condivise non ancora saldate,
  // non solo quelle di questo mese (un debito resta finché non viene saldato).
  async function caricaCondivise() {
    const tutte = await getSpese({});
    const rimastoDi = (s) => Math.max(0, Number(s.importo) / 2 - Number(s.importo_rimborsato || 0));
    const nonSaldate = tutte.filter((s) => s.condivisa && rimastoDi(s) > 0);
    setDoveVannaAnna(nonSaldate.filter((s) => s.persona === "Anna").reduce((tot, s) => tot + rimastoDi(s), 0));
    setDoveAnnaVanna(nonSaldate.filter((s) => s.persona === "Vanna").reduce((tot, s) => tot + rimastoDi(s), 0));
  }

  async function caricaEntrate() {
    const entrate = await getEntrate(MESE_CORRENTE, ANNO_CORRENTE);
    setTotaleEntrate(entrate.reduce((tot, e) => tot + Number(e.importo), 0));
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

      {/* Totale spese del mese, con la scomposizione per categoria subito sotto */}
      <div className={`${GLASS} rounded-3xl p-4 mb-3`}>
        <div className="flex items-center gap-2 mb-1">
          <Receipt size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Totale spese di questo mese</p>
        </div>
        <p className="font-mono-num text-3xl" style={{ color: "#fff" }}>€ {totaleSpeseMese.toFixed(2)}</p>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {GRUPPI.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.id}
              to={`/ac-home/spese?gruppo=${g.id}`}
              className={`${GLASS} flex items-center justify-between rounded-2xl px-4 py-3`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "#fff" }}
                >
                  <Icon size={18} color={T.forest} />
                </div>
                <p className="font-display text-sm" style={{ color: "#fff" }}>{g.label}</p>
              </div>
              <p className="font-mono-num text-base" style={{ color: "#fff" }}>
                € {(totali[g.id] || 0).toFixed(2)}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Totale entrate: card a parte, non un saldo netto unico con le spese */}
      <Link to="/ac-home/entrate" className={`${GLASS} block rounded-3xl p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Totale entrate di questo mese</p>
        </div>
        <p className="font-mono-num text-3xl" style={{ color: "#fff" }}>€ {totaleEntrate.toFixed(2)}</p>
      </Link>

      {/* Chi deve ancora quanto a chi, sulle spese condivise non saldate */}
      {(doveVannaAnna > 0 || doveAnnaVanna > 0) && (
        <div className={`${GLASS} rounded-3xl p-4 mb-5`} style={{ borderLeft: "4px solid #ffcf5c" }}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} color="#fff" />
            <p className="font-display text-sm" style={{ color: "#fff" }}>Spese condivise</p>
          </div>
          <div className="flex flex-col gap-1">
            {doveVannaAnna > 0 && (
              <p className="text-sm" style={{ color: "#fff" }}>
                Vanna deve ancora dare ad Anna: <span className="font-mono-num font-semibold">€ {doveVannaAnna.toFixed(2)}</span>
              </p>
            )}
            {doveAnnaVanna > 0 && (
              <p className="text-sm" style={{ color: "#fff" }}>
                Anna deve ancora dare a Vanna: <span className="font-mono-num font-semibold">€ {doveAnnaVanna.toFixed(2)}</span>
              </p>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}
