import { T, GLASS, PAGE_GRADIENT, SECTION_TITLE } from "../lib/theme";

/** Macchie di colore sfocate per dare profondità allo sfondo. */
export function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-0">
      <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full blur-3xl opacity-50" style={{ background: "#F2C14E" }} />
      <div className="absolute top-1/2 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: T.protein }} />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: T.carbs }} />
    </div>
  );
}

/** Wrapper di pagina: sfondo a gradiente vivido + macchie sfumate + contenitore centrato. */
export function Page({ children, maxWidth = "max-w-6xl" }) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: PAGE_GRADIENT }}>
      <PageBackground />
      <div className={`${maxWidth} mx-auto px-6 py-10 relative min-w-0`}>{children}</div>
    </div>
  );
}

/** Titolo di sezione coerente: maiuscolo, grassetto, crema (leggibile su sfondo colorato). */
export function SectionTitle({ children, className = "text-lg", ...props }) {
  return (
    <h2 className={`${className} ${SECTION_TITLE}`} style={{ color: T.cream }} {...props}>
      {children}
    </h2>
  );
}

/** Card in vetro riutilizzabile. */
export function GlassCard({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag className={`${GLASS} rounded-[28px] p-6 ${className}`} {...props}>
      {children}
    </Tag>
  );
}

/** Icona in cerchio di vetro — sempre bianca, leggibile su qualsiasi sfondo colorato. */
export function IconChip({ icon: Icon, size = 40 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-md border border-white/25"
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.45)} className="text-white" strokeWidth={2} />
    </div>
  );
}

/** Anello di progresso. Il centro è bianco PIENO (non trasparente) con testo
 * scuro: su un anello bianco-su-vetro il testo bianco perdeva contrasto. */
export function Ring({ value, max, size = 92, stroke = 8, icon: Icon, label, sub }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: size, height: size, background: `conic-gradient(#FFFFFF ${pct * 3.6}deg, rgba(255,255,255,0.22) 0deg)` }}
      >
        <div
          className="rounded-full bg-white flex flex-col items-center justify-center"
          style={{ width: size - stroke * 2, height: size - stroke * 2 }}
        >
          {Icon && <Icon size={15} style={{ color: T.forest }} strokeWidth={2} />}
          <span className="font-mono-num text-sm font-bold mt-0.5" style={{ color: T.ink }}>{value}</span>
          {sub && <span className="text-[9px]" style={{ color: T.stone }}>{sub}</span>}
        </div>
      </div>
      <span className="text-xs font-medium text-white/80">{label}</span>
    </div>
  );
}

/** Pulsante primario: bianco pieno con testo scuro, leggibile su sfondo colorato. */
export function PrimaryButton({ children, className = "", as: Tag = "button", ...props }) {
  return (
    <Tag
      className={`rounded-xl px-6 py-3 font-semibold bg-white transition hover:bg-white/90 ${className}`}
      style={{ color: T.forest }}
      {...props}
    >
      {children}
    </Tag>
  );
}
