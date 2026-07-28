import { NavLink } from "react-router-dom";
import { Home, CalendarDays, BookOpen, ShoppingCart, HeartPulse, User } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/menu", label: "Menu", icon: CalendarDays },
  { to: "/ricette", label: "Ricette", icon: BookOpen },
  { to: "/spesa", label: "Spesa", icon: ShoppingCart },
  { to: "/salute", label: "Salute", icon: HeartPulse },
  { to: "/profilo", label: "Profilo", icon: User },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#E4DFCF] flex justify-around py-2 z-40">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${isActive ? "text-clay" : "text-[#9A9578]"}`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
