import { T, GLASS, SECTION_TITLE } from "../lib/theme";

/** Sfondo con macchie di colore sfocate: dà profondità dietro ai pannelli
 * di vetro. Da mettere una sola volta per pagina, dietro al contenuto. */
export function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: T.sage }} />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30" style={{ background: T.protein }} />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25" style={{ background: T.carbs }} />
    </div>
  );
}

/** Wrapper di pagina: sfondo chiaro + macchie sfumate + contenitore centrato. */
export function Page({ children, maxWidth = "max-w-6xl" }) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: T.paper }}>
      <PageBackground />
      <div className={`${maxWidth} mx-auto px-6 py-10 relative`}>{children}</div>
    </div>
  );
}

/** Titolo di sezione coerente su tutte le pagine: maiuscolo, grassetto, corallo. */
export function SectionTitle({ children, className = "text-lg", ...props }) {
  return (
    <h2 className={`${className} ${SECTION_TITLE}`} style={{ color: T.coral }} {...props}>
      {children}
    </h2>
  );
}

/** Card in vetro riutilizzabile. */
export function GlassCard({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag className={`${GLASS} rounded-2xl p-6 ${className}`} {...props}>
      {children}
    </Tag>
  );
}

/** Icona in chip colorata morbida (flat, non 3D — vedi conversazione). */
export function IconChip({ icon: Icon, tint, size = 38 }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: `${tint}22` }}
    >
      <Icon size={Math.round(size * 0.5)} style={{ color: tint }} strokeWidth={2} />
    </div>
  );
}

/** Anello di progresso — usato solo per peso/calorie/acqua/macro, come da Design System. */
export function Ring({ value, max, size = 108, stroke = 9, color, label, sub, icon: Icon }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: size, height: size, background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(228,231,228,0.5) 0deg)` }}
      >
        <div
          className="rounded-full bg-white/70 backdrop-blur-md flex flex-col items-center justify-center"
          style={{ width: size - stroke * 2, height: size - stroke * 2 }}
        >
          {Icon && <Icon size={18} style={{ color }} strokeWidth={2} />}
          <span className="font-mono-num text-lg font-semibold mt-0.5" style={{ color: T.ink }}>{value}</span>
          <span className="text-[10px]" style={{ color: T.stone }}>{sub}</span>
        </div>
      </div>
      <span className="mt-3 text-sm font-medium" style={{ color: T.stone }}>{label}</span>
    </div>
  );
}

/** Pulsante primario coerente col design system (sage, non il verde generico Tailwind). */
export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-xl px-6 py-3 font-semibold text-white transition ${className}`}
      style={{ background: T.sage }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.forest)}
      onMouseLeave={(e) => (e.currentTarget.style.background = T.sage)}
      {...props}
    >
      {children}
    </button>
  );
}
