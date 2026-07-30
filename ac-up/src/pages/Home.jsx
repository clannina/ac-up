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

/** Icona in chip piatta — colore pieno, nessuna trasparenza/sfumatura. */
function FlatIcon({ icon: Icon, bg = T.ink }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: bg }}>
      <Icon size={18} className="text-white" strokeWidth={2} />
    </div>
  );
}

function MealRow({ meal, onToggle }) {
  return (
    <div className="rounded-3xl p-5 bg-white flex flex-col gap-3 transition hover:-translate-y-0.5" style={{ border: `1px solid ${T.mist}` }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(meal.id)}
            aria-label={meal.completed ? "Segna come da fare" : "Segna come fatto"}
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition"
            style={{
              border: `1.5px solid ${meal.completed ? T.ink : T.mist}`,
              background: meal.completed ? T.ink : "transparent",
            }}
          >
            {meal.completed && <Check size={13} className="text-white" strokeWidth={3} />}
          </button>
          <div>
            <h3 className="text-base font-semibold leading-tight" style={{ color: T.ink }}>{meal.name}</h3>
            <span className="font-mono-num text-xs" style={{ color: T.stone }}>{meal.time}</span>
          </div>
        </div>
        <FlatIcon icon={meal.icon} />
      </div>

      <p className="text-sm" style={{ color: T.ink }}>{meal.recipe}</p>

      <div className="flex items-center gap-4 pt-3" style={{ borderTop: `1px solid ${T.mist}` }}>
        <span className="font-mono-num text-sm font-bold" style={{ color: T.ink }}>
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

/** Anello — sfondo card è già a colore pieno, quindi il "buco" resta bianco puro. */
function Ring({ value, max, size = 96, stroke = 8, ringColor, trackColor, icon: Icon }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: `conic-gradient(${ringColor} ${pct * 3.6}deg, ${trackColor} 0deg)` }}
    >
      <div className="rounded-full bg-white flex flex-col items-center justify-center" style={{ width: size - stroke * 2, height: size - stroke * 2 }}>
        <Icon size={16} style={{ color: T.ink }} strokeWidth={2} />
        <span className="font-mono-num text-base font-bold mt-0.5" style={{ color: T.ink }}>{value}</span>
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
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F7F2 55%, #EFF4EC 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono-num text-xs uppercase tracking-wider mb-1" style={{ color: T.stone }}>
              {todayLabel()}
            </p>
            <h1 className="text-3xl font-bold" style={{ color: T.ink }}>{greeting()}</h1>
          </div>
          <Link
            to="/profilo"
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: T.ink }}
          >
            A
          </Link>
        </div>

        {/* Obiettivo — blocco corallo pieno, nessuna sfumatura */}
        <div className="rounded-3xl p-7 mb-6" style={{ background: T.coral }}>
          <div className="flex items-center gap-2 mb-6">
            <Flag size={15} className="text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Obiettivo</span>
          </div>

          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-mono-num text-5xl font-bold text-white">{weight}</span>
              <span className="text-sm ml-1 text-white/80">kg oggi</span>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 rounded-full font-mono-num bg-white" style={{ color: T.coral }}>
              {weightDelta} kg
            </div>
          </div>

          <div className="relative h-1.5 rounded-full mb-2 bg-white/25">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white"
              style={{ left: `${trackPct}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono-num text-white/80">
            <span>oggi</span>
            <span>{weightTarget} kg obiettivo</span>
          </div>
        </div>

        {/* Calorie / Acqua / Peso — blocco verde salvia pieno */}
        <div className="rounded-3xl p-7 mb-10" style={{ background: T.sage }}>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-3">
              <Ring value={calories} max={calorieTarget} ringColor="#FFFFFF" trackColor="rgba(255,255,255,0.3)" icon={Flame} />
              <span className="text-xs font-semibold text-white/90">Calorie</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Ring value={water} max={waterTarget} ringColor="#FFFFFF" trackColor="rgba(255,255,255,0.3)" icon={Droplet} />
              <span className="text-xs font-semibold text-white/90">Acqua</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Ring value={weight} max={weight + 5} ringColor="#FFFFFF" trackColor="rgba(255,255,255,0.3)" icon={Scale} />
              <span className="text-xs font-semibold text-white/90">Peso</span>
            </div>
          </div>
          <button
            onClick={() => setWater((w) => Math.min(w + 1, waterTarget))}
            className="w-full mt-6 pt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-white"
            style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}
          >
            <Plus size={14} /> Aggiungi un bicchiere d'acqua
          </button>
        </div>

        {/* Pasti di oggi — bianco, essenziale */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: T.coral }}>Pasti di oggi</h2>
            <Link to="/menu" className="text-sm font-semibold flex items-center gap-1" style={{ color: T.ink }}>
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

        {/* Lista della spesa */}
        <Link
          to="/spesa"
          className="flex items-center justify-between rounded-3xl p-6 bg-white transition hover:-translate-y-0.5"
          style={{ border: `1px solid ${T.mist}` }}
        >
          <div className="flex items-center gap-4">
            <FlatIcon icon={ShoppingCart} bg={T.carbs} />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: T.coral }}>Lista della spesa</h3>
              <p className="text-xs mt-0.5" style={{ color: T.stone }}>
                <span className="font-mono-num">{groceryLeft}</span> articoli ancora da comprare
              </p>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: T.ink }} />
        </Link>
      </div>
    </div>
  );
}
