import { Link } from "react-router-dom";
import { GLASS } from "./lib/theme";

// Card di lancio per ogni app dell'hub.
function AppCard({ to, title, subtitle, logo }) {
  return (
    <Link
      to={to}
      className={`${GLASS} group relative flex flex-col justify-between p-4 rounded-3xl transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between">
        <img src={logo} alt={title} className="w-20 h-20" />
        <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-black opacity-80 group-hover:opacity-100 transition-opacity">
          Apri
          <span className="text-lg font-bold">→</span>
        </span>
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold text-black">{title}</h2>
        <p className="text-sm opacity-70 mt-1 text-black">{subtitle}</p>
      </div>
    </Link>
  );
}

export default function Hub() {
  return (
    <div className="bg-gradient-to-b from-[#14b8a6] via-[#f2f2f0] to-[#f2b705] min-h-screen flex flex-col items-center px-5 py-3">
      <header className="text-center mb-2">
        <img
          src="/icons/ac-hub-full-logo-transparent.png"
          alt="AC Hub"
          className="w-20 mx-auto"
        />
      </header>

      <div className="w-full max-w-md flex flex-col gap-4">
        <AppCard
          to="/ac-home"
          title="AC Home"
          subtitle="Spese casa, auto e scooter"
          logo="/icons/ac-home-logo-transparent.png"
        />
        <AppCard
          to="/ac-pepe"
          title="AcPepe"
          subtitle="Salute e terapie di Pepe"
          logo="/icons/ac-pepe-logo-transparent.png"
        />
        <AppCard
          to="/ac-up"
          title="AC UP"
          subtitle="Nutrizione e piano pasti"
          logo="/icons/ac-up-logo-transparent.png"
        />
      </div>
    </div>
  );
}
