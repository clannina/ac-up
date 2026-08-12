import { NavLink } from "react-router-dom";
import { Receipt, PiggyBank, Repeat, CalendarClock, Wallet } from "lucide-react";
import { T } from "../lib/theme";

// Home e Profilo sono ora nell'header in alto (AcHomeHeader.jsx),
// qui restano solo le sezioni operative: più spazio per ognuna.
const LINKS = [
  { to: "/ac-home/entrate", label: "Entrate", icon: Wallet },
  { to: "/ac-home/spese", label: "Spese", icon: Receipt },
  { to: "/ac-home/budget", label: "Budget", icon: PiggyBank },
  { to: "/ac-home/ricorrenti", label: "Ricorr.", icon: Repeat },
  { to: "/ac-home/scadenze", label: "Scad.", icon: CalendarClock },
];

export default function AcHomeNavBar() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40">
      <div
        className="max-w-xl mx-auto rounded-full flex justify-around py-2.5 px-1 backdrop-blur-2xl"
        style={{
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.28)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl text-[10px] leading-tight transition-colors"
            style={({ isActive }) =>
              isActive
                ? { background: "rgba(255,255,255,0.95)", color: T.forest }
                : { color: "rgba(255,255,255,0.85)" }
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
