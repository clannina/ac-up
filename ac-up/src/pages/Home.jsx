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
import { T } from "../lib/theme";

const initialMeals = [
  { id: 1, name: "Colazione", time: "07:30", recipe: "Yogurt greco con frutti di bosco", kcal: 320, protein: 22, carbs: 30, fat: 10, completed: true, icon: Coffee },
  { id: 2, name: "Spuntino", time: "10:30", recipe: "Mela e mandorle", kcal: 180, protein: 15, carbs: 18, fat: 5, completed: true, icon: Apple },
  { id: 3, name: "Pranzo", time: "13:00", recipe: "Insalata di pollo e avocado", kcal: 640, protein: 42, carbs: 65, fat: 18, completed: true, icon: UtensilsCrossed },
  { id: 4, name: "Merenda", time: "17:00", recipe: "Ricotta e frutta secca", kcal: 170, protein: 10, carbs: 20, fat: 6, completed: false, icon: Cookie },
  { id: 5, name: "Cena", time: "20:00", recipe: "Seppie con verdure grigliate", kcal: 560, protein: 38, carbs: 40, fat: 20, completed: false, icon: Moon },
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

// Stile "vetro liquido": bianco molto trasparente + blur forte, bordo
// bianco sottile — pensato per stare SOPRA uno sfondo colorato vivido,
// non sopra il bianco (per questo il testo dentro è sempre chiaro).
const GLASS = "bg-white/15 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.12)]";

function GlassIcon({ icon: Icon, size = 40 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-md border border-white/25"
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.45)} className="text-white" strokeWidth={2} />
    </div>
  );
}

function MealRow({ meal, onToggle }) {
  return (
    <div className={`${GLASS} rounded-[28px] p-5 flex flex-col gap-3 transition`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(meal.id)}
            aria-label={meal.completed ? "Segna come da fare" : "Segna come fatto"}
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition"
            style={{
              border: "1.5px solid rgba(255,255,255,0.6)",
              background: meal.completed ? "rgba(255,255,255,0.9)" : "transparent",
            }}
          >
            {meal.completed && <Check size={13} style={{ color: T.forest }} strokeWidth={3} />}
          </button>
          <div>
            <h3 className="text-base font-semibold leading-tight text-white">{meal.name}</h3>
            <span className="font-mono-num text-xs text-white/70">{meal.time}</span>
          </div>
        </div>
        <GlassIcon icon={meal.icon} />
      </div>

      <p className="text-sm text-white/90">{meal.recipe}</p>

      <div className="flex items-center gap-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        <span className="font-mono-num text-sm font-bold text-white">
          {meal.kcal} <span className="text-[11px] font-normal text-white/70">kcal</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-white" /> <span className="font-mono-num">{meal.protein}g</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-white/60" /> <span className="font-mono-num">{meal.carbs}g</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" /> <span className="font-mono-num">{meal.fat}g</span>
        </span>
      </div>
    </div>
  );
}

function Ring({ value, max, size = 92, stroke = 8, icon: Icon, label }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: size, height: size, background: `conic-gradient(#FFFFFF ${pct * 3.6}deg, rgba(255,255,255,0.22) 0deg)` }}
      >
        <div
          className="rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center"
          style={{ width: size - stroke * 2, height: size - stroke * 2 }}
        >
          <Icon size={15} className="text-white" strokeWidth={2} />
          <span className="font-mono-num text-sm font-bold mt-0.5 text-white">{value}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-white/80">{label}</span>
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
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #2E4A31 0%, #5E8C61 28%, #E76F51 62%, #F2994A 100%)" }}
    >
      {/* Grandi macchie sfocate per dare profondità, come nel riferimento */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full blur-3xl opacity-50" style={{ background: "#F2C14E" }} />
        <div className="absolute top-1/2 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: T.protein }} />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: "#F2994A" }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono-num text-xs uppercase tracking-wider mb-1 text-white/70">{todayLabel()}</p>
            <h1 className="text-4xl font-bold text-white">{greeting()}</h1>
            <p className="text-sm text-white/70 mt-1">Un piano semplice, un giorno alla volta.</p>
          </div>
          <Link
            to="/profilo"
            className={`${GLASS} w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0`}
          >
            A
          </Link>
        </div>

        {/* Obiettivo */}
        <div className={`${GLASS} rounded-[28px] p-7 mb-6`}>
          <div className="flex items-center gap-2 mb-6">
            <Flag size={15} className="text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Obiettivo</span>
          </div>

          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-mono-num text-5xl font-bold text-white">{weight}</span>
              <span className="text-sm ml-1 text-white/70">kg oggi</span>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 rounded-full font-mono-num bg-white/90" style={{ color: T.forest }}>
              {weightDelta} kg
            </div>
          </div>

          <div className="relative h-1.5 rounded-full mb-2 bg-white/20">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white"
              style={{ left: `${trackPct}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono-num text-white/70">
            <span>oggi</span>
            <span>{weightTarget} kg obiettivo</span>
          </div>
        </div>

        {/* Calorie / Acqua / Peso */}
        <div className={`${GLASS} rounded-[28px] p-7 mb-10`}>
          <div className="grid grid-cols-3 gap-4">
            <Ring value={calories} max={calorieTarget} icon={Flame} label="Calorie" />
            <Ring value={water} max={waterTarget} icon={Droplet} label="Acqua" />
            <Ring value={weight} max={weight + 5} icon={Scale} label="Peso" />
          </div>
          <button
            onClick={() => setWater((w) => Math.min(w + 1, waterTarget))}
            className="w-full mt-6 pt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-white"
            style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
          >
            <Plus size={14} /> Aggiungi un bicchiere d'acqua
          </button>
        </div>

        {/* Pasti di oggi */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: "#FFE8D6" }}>Pasti di oggi</h2>
            <Link to="/menu" className="text-sm font-semibold flex items-center gap-1 text-white">
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
          <p className="text-xs mt-3 font-mono-num text-white/70">{doneMeals} di {meals.length} completati</p>
        </div>

        {/* Lista della spesa */}
        <Link to="/spesa" className={`${GLASS} flex items-center justify-between rounded-[28px] p-6 transition hover:bg-white/20`}>
          <div className="flex items-center gap-4">
            <GlassIcon icon={ShoppingCart} />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FFE8D6" }}>Lista della spesa</h3>
              <p className="text-xs mt-0.5 text-white/70">
                <span className="font-mono-num">{groceryLeft}</span> articoli ancora da comprare
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-white" />
        </Link>
      </div>
    </div>
  );
}
