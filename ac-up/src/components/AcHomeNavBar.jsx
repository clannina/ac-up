import { NavLink } from "react-router-dom";
import { Home, Receipt, PiggyBank, Repeat, CalendarClock, User } from "lucide-react";
import { T } from "../lib/theme";

const LINKS = [
  { to: "/ac-home", label: "Home", icon: Home, end: true },
  { to: "/ac-home/spese", label: "Spese", icon: Receipt },
  { to: "/ac-home/budget", label: "Budget", icon: PiggyBank },
  { to: "/ac-home/ricorrenti", label: "Ricorr.", icon: Repeat },
  { to: "/ac-home/scadenze", label: "Scadenze", icon: CalendarClock },
  { to: "/ac-home/profilo", label: "Profilo", icon: User },
];

export default function AcHomeNavBar() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40">
      <div
        className="max-w-xl mx-auto rounded-full flex justify-around py-2 px-0.5 backdrop-blur-2xl"
        style={{
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.28)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-2xl text-[9px] leading-tight transition-colors"
            style={({ isActive }) =>
              isActive
                ? { background: "rgba(255,255,255,0.95)", color: T.forest }
                : { color: "rgba(255,255,255,0.85)" }
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
