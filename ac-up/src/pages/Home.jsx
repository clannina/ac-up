import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Flag,
  TrendingDown,
  TrendingUp,
  Coffee,
  Apple,
  UtensilsCrossed,
  Cookie,
  Moon,
  Check,
  Flame,
  Droplet,
  Scale,
  ShoppingCart,
  Plus,
  ChevronRight,
} from "lucide-react";

const initialMeals = [
  { id: 1, name: "Colazione", time: "07:30", recipe: "Overnight oats ai frutti di bosco", calories: 320, protein: 22, carbs: 30, fat: 10, completed: true, icon: Coffee },
  { id: 2, name: "Spuntino", time: "10:30", recipe: "Yogurt greco e frutta secca", calories: 180, protein: 15, carbs: 18, fat: 5, completed: true, icon: Apple },
  { id: 3, name: "Pranzo", time: "13:00", recipe: "Insalata di pollo e quinoa", calories: 640, protein: 42, carbs: 65, fat: 18, completed: true, icon: UtensilsCrossed },
  { id: 4, name: "Merenda", time: "17:00", recipe: "Frutta fresca e mandorle", calories: 170, protein: 10, carbs: 20, fat: 6, completed: false, icon: Cookie },
  { id: 5, name: "Cena", time: "20:00", recipe: "Salmone al forno con verdure", calories: 560, protein: 38, carbs: 40, fat: 20, completed: false, icon: Moon },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

function SectionHeader({ title, actionLabel, actionTo }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {actionTo && (
        <Link
          to={actionTo}
          className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          {actionLabel} <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

function MealItem({ meal, onToggle }) {
  const Icon = meal.icon;
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight">{meal.name}</h3>
            <p className="text-sm text-gray-500">{meal.time}</p>
          </div>
        </div>
        <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-semibold whitespace-nowrap">
          {meal.calories} kcal
        </span>
      </div>

      <p className="text-gray-600 mt-4 text-sm">{meal.recipe}</p>

      <div className="flex justify-between text-xs text-gray-500 mt-4">
        <span>🥩 {meal.protein}g</span>
        <span>🌾 {meal.carbs}g</span>
        <span>🥑 {meal.fat}g</span>
      </div>

      <button
        onClick={() => onToggle(meal.id)}
        className={`w-full mt-5 rounded-xl py-2.5 flex items-center justify-center gap-2 font-semibold transition ${
          meal.completed
            ? "bg-green-50 text-green-700 hover:bg-green-100"
            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Check size={16} />
        {meal.completed ? "Completato" : "Segna come fatto"}
      </button>
    </div>
  );
}

function MetricCard({ icon: Icon, iconBg, iconColor, title, value, unit, pct, footer }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <p className="text-gray-500 font-medium">{title}</p>
      </div>

      <h3 className="text-3xl font-bold">
        {value}
        <span className="text-base font-medium text-gray-400 ml-1">{unit}</span>
      </h3>

      {pct !== undefined && (
        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}

      {footer && <div className="mt-3 text-sm">{footer}</div>}
    </div>
  );
}

export default function Home() {
  const [meals, setMeals] = useState(initialMeals);

  const toggleMeal = (id) =>
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));

  const [water, setWater] = useState(6);
  const waterTarget = 8;

  const weight = 98;
  const weightTarget = 75;
  const weightDelta = -0.8;

  const calories = 1450;
  const calorieTarget = 1900;

  const doneMeals = meals.filter((m) => m.completed).length;
  const dailyPct = Math.round((doneMeals / meals.length) * 100);

  const groceryTotal = 6;
  const groceryLeft = 4;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{greeting()} 👋</h1>
          <p className="text-gray-500 mt-2">
            Hai completato {doneMeals} pasti su {meals.length} oggi.
          </p>
        </div>
        <Link
          to="/profilo"
          className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shrink-0"
        >
          A
        </Link>
      </div>

      {/* Daily progress */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mt-6">
        <div
          className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${dailyPct}%` }}
        />
      </div>

      {/* Obiettivo */}
      <div className="mt-10 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-sm">
        <div className="flex items-center gap-2 text-green-100 mb-4">
          <Flag size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">Obiettivo</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-green-100 text-sm mb-1">Peso attuale</p>
            <p className="text-5xl font-bold">
              {weight}
              <span className="text-xl font-medium ml-1">kg</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-green-100 text-sm mb-1">Obiettivo</p>
            <p className="text-2xl font-semibold">{weightTarget} kg</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 bg-white/15 rounded-full w-fit px-4 py-2">
          <TrendingDown size={16} />
          <span className="text-sm font-semibold">{weightDelta} kg questa settimana</span>
        </div>

        <p className="text-green-100 text-sm mt-4">Continua così, sei sulla strada giusta.</p>
      </div>

      {/* Pasti di oggi */}
      <div className="mt-10">
        <SectionHeader title="Pasti di oggi" actionLabel="Piano completo" actionTo="/menu" />
        <div className="grid md:grid-cols-2 gap-6">
          {meals.map((meal, i) => (
            <div key={meal.id} className={i === meals.length - 1 && meals.length % 2 === 1 ? "md:col-span-2" : ""}>
              <MealItem meal={meal} onToggle={toggleMeal} />
            </div>
          ))}
        </div>
      </div>

      {/* Metriche */}
      <div className="mt-10">
        <SectionHeader title="Le tue metriche" actionLabel="Vedi salute" actionTo="/salute" />
        <div className="grid md:grid-cols-3 gap-6">
          <MetricCard
            icon={Flame}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            title="Calorie"
            value={calories}
            unit={`/ ${calorieTarget} kcal`}
            pct={(calories / calorieTarget) * 100}
            footer={<span className="text-gray-500">{calorieTarget - calories} kcal rimanenti</span>}
          />

          <MetricCard
            icon={Droplet}
            iconBg="bg-sky-100"
            iconColor="text-sky-600"
            title="Acqua"
            value={water}
            unit={`/ ${waterTarget} bicchieri`}
            pct={(water / waterTarget) * 100}
            footer={
              <button
                onClick={() => setWater((w) => Math.min(w + 1, waterTarget))}
                className="flex items-center gap-1 text-sky-600 font-semibold hover:text-sky-700"
              >
                <Plus size={14} /> Aggiungi bicchiere
              </button>
            }
          />

          <MetricCard
            icon={Scale}
            iconBg="bg-green-100"
            iconColor="text-green-700"
            title="Peso"
            value={weight}
            unit="kg"
            footer={
              <span className="flex items-center gap-1 text-green-700 font-semibold">
                <TrendingDown size={14} /> {weightDelta} kg questa settimana
              </span>
            }
          />
        </div>
      </div>

      {/* Lista della spesa */}
      <div className="mt-10">
        <SectionHeader title="Lista della spesa" />
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="font-bold">{groceryLeft} articoli da comprare</p>
              <p className="text-sm text-gray-500">Generata dalle ricette di questa settimana</p>
            </div>
          </div>

          <Link
            to="/spesa"
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-semibold transition"
          >
            Vai alla lista
          </Link>
        </div>
      </div>
    </div>
  );
}
