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
    <nav className="fixed bottom-4 left-4 right-4 z-40">
      <div className="max-w-xl mx-auto bg-white rounded-full shadow-lg shadow-[#2B2A1F1A] flex justify-around py-2 px-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-2xl text-[10px] transition-colors ${
                isActive ? "bg-[#EEF3EA] text-[#527A57]" : "text-[#B5AF95]"
              }`
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
