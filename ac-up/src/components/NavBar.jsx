import { NavLink } from "react-router-dom";
import { Home, CalendarDays, BookOpen, ShoppingCart, HeartPulse, User } from "lucide-react";
import { T } from "../lib/theme";

const LINKS = [
  { to: "/ac-up", label: "Home", icon: Home, end: true },
  { to: "/menu", label: "Menu", icon: CalendarDays },
  { to: "/ricette", label: "Ricette", icon: BookOpen },
  { to: "/spesa", label: "Spesa", icon: ShoppingCart },
  { to: "/salute", label: "Salute", icon: HeartPulse },
  { to: "/profilo", label: "Profilo", icon: User },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40">
      <div
        className="max-w-xl mx-auto rounded-full flex justify-around py-2 px-1 backdrop-blur-2xl"
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
            className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-2xl text-[10px] transition-colors"
            style={({ isActive }) =>
              isActive
                ? { background: "rgba(255,255,255,0.95)", color: T.forest }
                : { color: "rgba(255,255,255,0.85)" }
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
