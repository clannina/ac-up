import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Plus,
  ArrowRight,
  Flag,
  Flame,
  Droplet,
  Scale,
  ShoppingCart,
  Coffee,
  Apple,
  UtensilsCrossed,
  Cookie,
  Moon,
} from "lucide-react";

/** Token ufficiali da docs/03_DESIGN_TOKENS.md — non valori Tailwind generici. */
const T = {
  sage: "#5E8C61",
  forest: "#45684A",
  paper: "#F7F8F4",
  ink: "#1E2B22",
  stone: "#6B746D",
  mist: "#E4E7E4",
  protein: "#5B8DEF",
  carbs: "#F2994A",
  fat: "#62C370",
};

const GLASS =
  "bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_30px_rgba(30,43,34,0.06)]";

/** Icona flat in chip colorata morbida — Lucide (libreria ufficiale del
 * progetto), niente asset esterni da cui dipendere. */
function IconChip({ icon: Icon, tint, size = 38 }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: `${tint}22` }}
    >
      <Icon size={Math.round(size * 0.5)} style={{ color: tint }} strokeWidth={2} />
    </div>
  );
}

const initialMeals = [
  { id: 1, name: "Colazione", time: "07:30", recipe: "Yogurt greco con frutti di bosco", kcal: 320, protein: 22, carbs: 30, fat: 10, completed: true, icon: Coffee, tint: T.carbs },
  { id: 2, name: "Spuntino", time: "10:30", recipe: "Mela e mandorle", kcal: 180, protein: 15, carbs: 18, fat: 5, completed: true, icon: Apple, tint: T.fat },
  { id: 3, name: "Pranzo", time: "13:00", recipe: "Insalata di pollo e avocado", kcal: 640, protein: 42, carbs: 65, fat: 18, completed: true, icon: UtensilsCrossed, tint: T.sage },
  { id: 4, name: "Merenda", time: "17:00", recipe: "Ricotta e frutta secca", kcal: 170, protein: 10, carbs: 20, fat: 6, completed: false, icon: Cookie, tint: "#B08968" },
  { id: 5, name: "Cena", time: "20:00", recipe: "Seppie con verdure grigliate", kcal: 560, protein: 38, carbs: 40, fat: 20, completed: false, icon: Moon, tint: T.protein },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

function todayLabel() {
  const d = new Date();
  const s = d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Ring({ value, max, size = 108, stroke = 9, color, label, sub, icon: Icon }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(228,231,228,0.5) 0deg)`,
        }}
      >
        <div
          className="rounded-full bg-white/70 backdrop-blur-md flex flex-col items-center justify-center"
          style={{ width: size - stroke * 2, height: size - stroke * 2 }}
        >
          <Icon size={18} style={{ color }} strokeWidth={2} />
          <span className="font-mono-num text-lg font-semibold mt-0.5" style={{ color: T.ink }}>
            {value}
          </span>
          <span className="text-[10px]" style={{ color: T.stone }}>
            {sub}
          </span>
        </div>
      </div>
      <span className="mt-3 text-sm font-medium" style={{ color: T.stone }}>
        {label}
      </span>
    </div>
  );
}

function MealRow({ meal, onToggle }) {
  return (
    <div className={`${GLASS} rounded-2xl p-5 flex flex-col gap-3 transition`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(meal.id)}
            aria-label={meal.completed ? "Segna come da fare" : "Segna come fatto"}
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition"
            style={{
              border: `1.5px solid ${meal.completed ? T.sage : "rgba(30,43,34,0.2)"}`,
              background: meal.completed ? T.sage : "transparent",
            }}
          >
            {meal.completed && <Check size={13} className="text-white" strokeWidth={3} />}
          </button>
          <div>
            <h3 className="text-base font-semibold leading-tight" style={{ color: T.ink }}>
              {meal.name}
            </h3>
            <span className="font-mono-num text-xs" style={{ color: T.stone }}>
              {meal.time}
            </span>
          </div>
        </div>
        <IconChip icon={meal.icon} tint={meal.tint} />
      </div>

      <p className="text-sm" style={{ color: T.ink }}>
        {meal.recipe}
      </p>

      <div className="flex items-center gap-4 pt-3" style={{ borderTop: "1px solid rgba(30,43,34,0.08)" }}>
        <span className="font-mono-num text-sm font-semibold" style={{ color: T.ink }}>
          {meal.kcal} <span className="text-[11px] font-normal" style={{ color: T.stone }}>kcal</span>
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.protein }} />
          <span className="font-mono-num" style={{ color: T.stone }}>{meal.protein}g</span>
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.carbs }} />
          <span className="font-mono-num" style={{ color: T.stone }}>{meal.carbs}g</span>
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.fat }} />
          <span className="font-mono-num" style={{ color: T.stone }}>{meal.fat}g</span>
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [meals, setMeals] = useState(initialMeals);
  const [water, setWater] = useState(6);

  const toggleMeal = (id) =>
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));

  const waterTarget = 8;
  const weight = 98;
  const weightTarget = 75;
  const weightDelta = -0.8;
  const calories = 1450;
  const calorieTarget = 1900;

  const doneMeals = meals.filter((m) => m.completed).length;

  const span = 30;
  const distance = weight - weightTarget;
  const trackPct = Math.max(4, Math.min(96, 100 - (distance / span) * 100));

  const groceryLeft = 4;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: T.paper }}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: T.sage }} />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30" style={{ background: "#5B8DEF" }} />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25" style={{ background: T.carbs }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="font-mono-num text-xs uppercase tracking-wider mb-1" style={{ color: T.stone }}>
              {todayLabel()}
            </p>
            <h1 className="text-3xl font-bold" style={{ color: T.ink }}>
              {greeting()}
            </h1>
          </div>
          <Link
            to="/profilo"
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ background: T.sage }}
          >
            A
          </Link>
        </div>

        {/* Obiettivo */}
        <div className={`${GLASS} rounded-2xl p-7 mb-10`}>
          <div className="flex items-center gap-2 mb-6">
            <Flag size={15} style={{ color: T.sage }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.stone }}>
              Obiettivo
            </span>
          </div>

          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-mono-num text-4xl font-bold" style={{ color: T.ink }}>
                {weight}
              </span>
              <span className="text-sm ml-1" style={{ color: T.stone }}>kg oggi</span>
            </div>
            <div
              className="text-xs font-semibold px-2.5 py-1 rounded-full font-mono-num backdrop-blur-sm"
              style={{ background: "rgba(94,140,97,0.15)", color: T.forest }}
            >
              {weightDelta} kg questa settimana
            </div>
          </div>

          <div className="relative h-1 rounded-full mb-2" style={{ background: "rgba(30,43,34,0.1)" }}>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ left: `${trackPct}%`, background: T.sage, transform: "translate(-50%, -50%)" }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono-num" style={{ color: T.stone }}>
            <span>oggi</span>
            <span>{weightTarget} kg obiettivo</span>
          </div>

          <p className="text-sm mt-5" style={{ color: T.stone }}>
            Continua così, sei sulla strada giusta.
          </p>
        </div>

        {/* Pasti di oggi */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: T.ink }}>
              Pasti di oggi
            </h2>
            <Link to="/menu" className="text-sm font-medium flex items-center gap-1" style={{ color: T.sage }}>
              Piano completo <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {meals.map((meal, i) => (
              <div key={meal.id} className={i === meals.length - 1 && meals.length % 2 === 1 ? "md:col-span-2" : ""}>
                <MealRow meal={meal} onToggle={toggleMeal} />
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 font-mono-num" style={{ color: T.stone }}>
            {doneMeals} di {meals.length} completati
          </p>
        </div>

        {/* Calorie / Acqua / Peso */}
        <div className={`${GLASS} rounded-2xl p-7 mb-10`}>
          <div className="grid grid-cols-3 gap-4">
            <Ring value={calories} max={calorieTarget} color={T.carbs} label="Calorie" sub={`/ ${calorieTarget}`} icon={Flame} />
            <Ring value={water} max={waterTarget} color="#5B8DEF" label="Acqua" sub={`/ ${waterTarget} bicchieri`} icon={Droplet} />
            <Ring value={weight} max={weight + 5} color={T.sage} label="Peso" sub="kg" icon={Scale} />
          </div>
          <button
            onClick={() => setWater((w) => Math.min(w + 1, waterTarget))}
            className="w-full mt-6 pt-5 flex items-center justify-center gap-1.5 text-sm font-medium"
            style={{ borderTop: "1px solid rgba(30,43,34,0.08)", color: T.stone }}
          >
            <Plus size={14} /> Aggiungi un bicchiere d'acqua
          </button>
        </div>

        {/* Lista della spesa */}
        <Link to="/spesa" className={`${GLASS} flex items-center justify-between rounded-2xl p-6 transition hover:bg-white/75`}>
          <div className="flex items-center gap-4">
            <IconChip icon={ShoppingCart} tint="#D4A24E" />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: T.ink }}>
                Lista della spesa
              </h3>
              <p className="text-xs mt-0.5" style={{ color: T.stone }}>
                <span className="font-mono-num">{groceryLeft}</span> articoli ancora da comprare
              </p>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: T.stone }} />
        </Link>
      </div>
    </div>
  );
}
