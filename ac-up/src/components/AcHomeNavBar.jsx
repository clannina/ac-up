import { NavLink, Link, useLocation } from "react-router-dom";
import { Receipt, PiggyBank, Repeat, CalendarClock, Wallet, HeartHandshake, Scale } from "lucide-react";
import { T } from "../lib/theme";

// Home e Profilo sono ora nell'header in alto (AcHomeHeader.jsx),
// qui restano solo le sezioni operative: più spazio per ognuna.
// "Bilancio" raggruppa Entrate e Budget (come "Monitoraggi" in AcPepe):
// quando sei in una delle due, sopra la barra compare il selettore per passare all'altra.
const BILANCIO = [
  { to: "/ac-home/entrate", label: "Entrate", icon: Wallet },
  { to: "/ac-home/budget", label: "Budget", icon: PiggyBank },
];

const LINKS = [
  { to: "/ac-home/entrate", label: "Bilancio", icon: Scale, gruppo: BILANCIO },
  { to: "/ac-home/spese", label: "Spese", icon: Receipt },
  { to: "/ac-home/ricorrenti", label: "Ricorr.", icon: Repeat },
  { to: "/ac-home/scadenze", label: "Scad.", icon: CalendarClock },
  { to: "/ac-home/coppia", label: "Coppia", icon: HeartHandshake },
];

const STILE_ATTIVO = { background: "rgba(255,255,255,0.95)", color: T.forest };
const STILE_SPENTO = { color: "rgba(255,255,255,0.85)" };
const STILE_VETRO = {
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.28)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};

export default function AcHomeNavBar() {
  const { pathname } = useLocation();
  const inBilancio = BILANCIO.some((b) => pathname.startsWith(b.to));

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40">
      {/* Selettore Entrate | Budget, visibile solo dentro Bilancio */}
      {inBilancio && (
        <div className="flex justify-center mb-2">
          <div className="rounded-full flex gap-1 p-1 backdrop-blur-2xl" style={STILE_VETRO}>
            {BILANCIO.map(({ to, label, icon: Icon }) => {
              const attivo = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  replace
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={attivo ? STILE_ATTIVO : STILE_SPENTO}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto rounded-full flex justify-around py-2.5 px-1 backdrop-blur-2xl" style={STILE_VETRO}>
        {LINKS.map(({ to, label, icon: Icon, gruppo }) => (
          <NavLink
            key={label}
            to={to}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl text-[10px] leading-tight transition-colors"
            style={({ isActive }) => {
              const attivo = gruppo ? gruppo.some((g) => pathname.startsWith(g.to)) : isActive;
              return attivo ? STILE_ATTIVO : STILE_SPENTO;
            }}
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
