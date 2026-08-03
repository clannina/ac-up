import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, Car, Bike, CalendarClock } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getSpese, getScadenze } from "../../lib/acHome";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
];

const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();
const BACKGROUND =
  "linear-gradient(160deg, #1B4F72 0%, #2E86AB 45%, #5FCFC0 100%)";

function giorniMancanti(dataScadenza) {
  const oggiZero = new Date();
  oggiZero.setHours(0, 0, 0, 0);
  const d = new Date(dataScadenza);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - oggiZero) / (1000 * 60 * 60 * 24));
}

export default function AcHomeDashboard() {
  const [totali, setTotali] = useState({ casa: 0, auto: 0, scooter: 0 });
  const [scadenze, setScadenze] = useState([]);

  useEffect(() => {
    caricaTotali();
    caricaScadenze();
  }, []);

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
      style={{ background: BACKGROUND, backgroundAttachment: "fixed" }}
    >
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>AC Home</h1>

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
