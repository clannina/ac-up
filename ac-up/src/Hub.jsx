import { Link } from "react-router-dom";
import { T } from "./lib/theme";

function AppCard({ to, title, subtitle, emoji, accent }) {
  return (
    <Link
      to={to}
      className="flex flex-col justify-between p-6 rounded-3xl transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98] shadow-sm"
      style={{ background: T.paper, color: T.stone, border: `1px solid ${T.stone}22` }}
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl">{emoji}</span>
        <span className="text-xs font-mono uppercase tracking-wider opacity-60" style={{ color: accent }}>
          Apri →
        </span>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold" style={{ color: accent }}>{title}</h2>
        <p className="text-sm opacity-70 mt-1">{subtitle}</p>
      </div>
    </Link>
  );
}

export default function Hub() {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-12" style={{ background: T.paper, color: T.stone }}>
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">AC Hub</h1>
        <p className="text-sm opacity-60 mt-1">Le tue app, in un unico posto</p>
      </header>

      <div className="w-full max-w-md flex flex-col gap-5">
        <AppCard
          to="/ac-up"
          title="AC UP"
          subtitle="Nutrizione e piano pasti"
          emoji="🥗"
          accent="#e07a5f" // corallo, coerente con AC UP
        />
        <AppCard
          to="/ac-home"
          title="AC Home"
          subtitle="Spese casa, auto e scooter"
          emoji="🏠"
          accent="#4a90d9" // azzurro, distintivo per AC Home
        />
      </div>
    </div>
  );
}
