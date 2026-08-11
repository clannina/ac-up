import { Link } from "react-router-dom";
import { PAGE_GRADIENT, GLASS } from "./lib/theme";

// Card di lancio per ogni app dell'hub.
// accent: classe Tailwind per il bordo/testo distintivo dell'app (corallo per AC UP, es. sky per AC Home)
function AppCard({ to, title, subtitle, logo, accent }) {
  return (
    <Link
      to={to}
      className={`${GLASS} group relative flex flex-col justify-between p-6 rounded-3xl transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between">
        <img src={logo} alt={title} className="w-20 h-20" />
        <span
          className={`text-xs font-mono uppercase tracking-wider ${accent} opacity-70 group-hover:opacity-100 transition-opacity`}
        >
          Apri →
        </span>
      </div>
      <div className="mt-8">
        <h2 className={`text-2xl font-semibold ${accent}`}>{title}</h2>
        <p className="text-sm opacity-70 mt-1">{subtitle}</p>
      </div>
    </Link>
  );
}

export default function Hub() {
  return (
    <div className={`${PAGE_GRADIENT} min-h-screen flex flex-col items-center px-5 py-12`}>
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">AC Hub</h1>
        <p className="text-sm opacity-60 mt-1">Le tue app, in un unico posto</p>
      </header>

      <div className="w-full max-w-md flex flex-col gap-5">
        <AppCard
          to="/ac-up"
          title="AC UP"
          subtitle="Nutrizione e piano pasti"
          logo="/icons/ac-up-logo-transparent.png"
          accent="text-orange-400" // corallo, coerente col design esistente
        />
        <AppCard
          to="/ac-home"
          title="AC Home"
          subtitle="Spese casa, auto e scooter"
          logo="/icons/ac-home-logo-transparent.png"
          accent="text-sky-400" // accento distintivo per AC Home
        />
      </div>
    </div>
  );
}
