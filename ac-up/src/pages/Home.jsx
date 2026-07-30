import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Plus,
  ArrowRight,
  Flag,
  Flame,
  Droplet,
  ShoppingCart,
  Coffee,
  Apple,
  UtensilsCrossed,
  Cookie,
  Moon,
} from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, IconChip, Ring } from "../components/ui";

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
              background: meal.completed ? "rgba(255,255,255,0.95)" : "transparent",
            }}
          >
            {meal.completed && <Check size={13} style={{ color: T.forest }} strokeWidth={3} />}
          </button>
          <div>
            <h3 className="text-base font-semibold leading-tight text-white">{meal.name}</h3>
            <span className="font-mono-num text-xs text-white/70">{meal.time}</span>
          </div>
        </div>
        <IconChip icon={meal.icon} />
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
    <Page>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono-num text-xs uppercase tracking-wider mb-1 text-white/70">{todayLabel()}</p>
          <h1 className="text-4xl font-bold text-white">{greeting()}</h1>
          <p className="text-sm text-white/70 mt-1">Un piano semplice, un giorno alla volta.</p>
        </div>
        <Link to="/profilo" className={`${GLASS} w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0`}>
          A
        </Link>
      </div>

      {/* Obiettivo */}
      <div className={`${GLASS} rounded-[28px] p-7 mb-10`}>
        <div className="flex items-center gap-2 mb-6">
          <Flag size={15} className="text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Obiettivo</span>
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="font-mono-num text-5xl font-bold text-white">{weight}</span>
            <span className="text-sm ml-1 text-white/70">kg oggi</span>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-full font-mono-num bg-white" style={{ color: T.forest }}>
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

      {/* Pasti di oggi — prima dei tre cerchi */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Pasti di oggi</SectionTitle>
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

      {/* Calorie / Acqua — il Peso è ora nel Profilo */}
      <div className={`${GLASS} rounded-[28px] p-7 mb-10`}>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <Ring value={calories} max={calorieTarget} icon={Flame} label="Calorie" />
          <Ring value={water} max={waterTarget} icon={Droplet} label="Acqua" />
        </div>
        <button
          onClick={() => setWater((w) => Math.min(w + 1, waterTarget))}
          className="w-full mt-6 pt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-white"
          style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
        >
          <Plus size={14} /> Aggiungi un bicchiere d'acqua
        </button>
      </div>

      {/* Lista della spesa */}
      <Link to="/spesa" className={`${GLASS} flex items-center justify-between rounded-[28px] p-6 transition hover:bg-white/20`}>
        <div className="flex items-center gap-4">
          <IconChip icon={ShoppingCart} />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: T.cream }}>Lista della spesa</h3>
            <p className="text-xs mt-0.5 text-white/70">
              <span className="font-mono-num">{groceryLeft}</span> articoli ancora da comprare
            </p>
          </div>
        </div>
        <ArrowRight size={18} className="text-white" />
      </Link>
    </Page>
  );
}
