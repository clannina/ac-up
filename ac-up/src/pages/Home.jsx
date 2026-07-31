import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Plus,
  ArrowRight,
  Flame,
  Droplet,
  ShoppingCart,
  Coffee,
  Apple,
  UtensilsCrossed,
  Cookie,
  Moon,
  ChevronDown,
  ChevronUp,
  Repeat,
  Lock,
  Unlock,
} from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, IconChip, Ring } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../supabaseClient";
import { loadTodayWater, saveTodayWater } from "../lib/water";

const POSITIVE_MESSAGES = [
  { emoji: "🌱", text: "Un passo alla volta è comunque un passo avanti." },
  { emoji: "💪", text: "Non serve essere perfetti, basta essere costanti." },
  { emoji: "☀️", text: "Oggi è un'altra occasione per prenderti cura di te." },
  { emoji: "🥗", text: "Ogni pasto semplice e sano conta, davvero." },
  { emoji: "✨", text: "Sei sulla strada giusta, continua così." },
];

function positiveMessageOfTheDay() {
  const dayIndex = new Date().getDate() % POSITIVE_MESSAGES.length;
  return POSITIVE_MESSAGES[dayIndex];
}

const initialMeals = [
  { id: 1, name: "Colazione", time: "07:30", recipe: "Yogurt greco con frutti di bosco", kcal: 320, protein: 22, carbs: 30, fat: 10, completed: false, icon: Coffee },
  { id: 2, name: "Spuntino", time: "10:30", recipe: "Mela e mandorle", kcal: 180, protein: 15, carbs: 18, fat: 5, completed: false, icon: Apple },
  { id: 3, name: "Pranzo", time: "13:00", recipe: "Insalata di pollo e avocado", kcal: 640, protein: 42, carbs: 65, fat: 18, completed: false, icon: UtensilsCrossed },
  { id: 4, name: "Merenda", time: "17:00", recipe: "Ricotta e frutta secca", kcal: 170, protein: 10, carbs: 20, fat: 6, completed: false, icon: Cookie },
  { id: 5, name: "Cena", time: "20:00", recipe: "Seppie con verdure grigliate", kcal: 560, protein: 38, carbs: 40, fat: 20, completed: false, icon: Moon },
];

// A quale gruppo alimentare (tra le 150+ ricette) attingere per ciascun pasto.
// "spuntini" e "merende" sono liste precise pensate apposta per gli spuntini:
// la seconda privilegia opzioni senza bisogno del frigo, per l'ufficio.
const MEAL_FOOD_GROUPS = {
  Colazione: ["colazioni"],
  Spuntino: ["spuntini"],
  Pranzo: ["carne", "pesce", "legumi"],
  Merenda: ["merende"],
  Cena: ["carne", "pesce", "legumi"],
};

// Sfizi occasionali (pizza, gelato, dolci...): compaiono solo tra le
// alternative sfogliabili di Pranzo/Cena, mai nel piano automatico.
const TREAT_SLOTS = new Set(["Pranzo", "Cena"]);

// Dentro "uova_latticini" ci sono anche piatti cucinati (frittate, omelette,
// uova strapazzate) che non sono spuntini veloci: per Spuntino/Merenda li
// escludiamo, tenendo solo le combinazioni assemblate al volo.
const COOKED_DISH_PREFIXES = ["Frittata", "Omelette", "Uova strapazzate"];
function isQuickSnack(name) {
  return !COOKED_DISH_PREFIXES.some((p) => name.startsWith(p));
}
const SNACK_SLOTS = new Set(["Spuntino", "Merenda"]);

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

function MealRow({ meal, onToggle, onSwap, dailyTotal, calorieTarget, locked }) {
  const [open, setOpen] = useState(false);
  const [alternatives, setAlternatives] = useState(null);
  const [loadingAlts, setLoadingAlts] = useState(false);

  const toggleOpen = async () => {
    if (!open && alternatives === null) {
      setLoadingAlts(true);
      const isTreatSlot = TREAT_SLOTS.has(meal.name);
      const pool = isTreatSlot
        ? [...(MEAL_FOOD_GROUPS[meal.name] ?? []), "extra"]
        : MEAL_FOOD_GROUPS[meal.name] ?? ["carne", "pesce", "legumi"];

      const { data, error } = await supabase
        ? await supabase.from("recipes").select("*").in("food_group", pool)
        : { data: [], error: null };

      const all = error ? [] : (data ?? []).filter((r) => r.name !== meal.recipe && r.kcal != null);
      const normal = all
        .filter((r) => r.food_group !== "extra")
        .filter((r) => !SNACK_SLOTS.has(meal.name) || isQuickSnack(r.name))
        .sort((a, b) => Math.abs(a.kcal - meal.kcal) - Math.abs(b.kcal - meal.kcal))
        .slice(0, 6);
      // Un paio di sfizi sempre visibili, non nascosti dall'ordinamento per calorie.
      const treats = isTreatSlot
        ? all.filter((r) => r.food_group === "extra").sort(() => Math.random() - 0.5).slice(0, 2)
        : [];

      const list = [...normal, ...treats];

      setAlternatives(list);
      setLoadingAlts(false);
    }
    setOpen((o) => !o);
  };

  const chooseAlternative = (recipe) => {
    onSwap(meal.id, recipe);
    setOpen(false);
  };

  return (
    <div className={`${GLASS} rounded-[28px] p-5 flex flex-col gap-3 transition overflow-hidden`}>
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

      {!locked && (
        <button
          onClick={toggleOpen}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-white pt-1"
        >
          <Repeat size={14} /> Scegli alternativa {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      )}

      {!locked && open && (
        <div className="pt-2">
          {loadingAlts && <p className="text-sm text-white/70">Cerco alternative...</p>}
          {!loadingAlts && alternatives?.length === 0 && (
            <p className="text-sm text-white/70">Nessuna alternativa trovata per questo pasto.</p>
          )}
          {!loadingAlts && alternatives?.length > 0 && (
            <div className="space-y-1.5 max-h-72 overflow-y-auto overflow-x-hidden">
              {alternatives.map((alt) => {
                const wouldBeTotal = dailyTotal - meal.kcal + alt.kcal;
                const overBudget = wouldBeTotal > calorieTarget;
                return (
                  <button
                    key={alt.id}
                    onClick={() => chooseAlternative(alt)}
                    className="w-full rounded-2xl p-3 text-left transition hover:bg-white/15 block"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <p className="text-sm font-medium text-white">
                      {alt.food_group === "extra" && "🎉 "}
                      {alt.name}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span
                        className="text-xs"
                        style={{ color: overBudget ? "#FFD7C9" : "rgba(255,255,255,0.7)" }}
                      >
                        {overBudget
                          ? `Sfora il budget di ${wouldBeTotal - calorieTarget} kcal`
                          : "Entro il budget di oggi"}
                      </span>
                      <span className="font-mono-num text-sm font-bold text-white">
                        {alt.kcal} kcal
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { session, profile } = useAuth();
  const [meals, setMeals] = useState(initialMeals);
  const [water, setWater] = useState(0);
  const [planConfirmed, setPlanConfirmed] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadTodayWater(session.user.id).then(setWater);
    }
  }, [session?.user?.id]);

  const displayName =
    profile?.display_name || session?.user?.email?.split("@")[0] || "";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "•";
  const message = positiveMessageOfTheDay();

  const toggleMeal = (id) =>
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));

  // Sostituisce un pasto con una ricetta alternativa scelta dall'utente,
  // mantenendo orario/icona/stato del pasto originale.
  const swapMeal = (id, recipe) =>
    setMeals((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, recipe: recipe.name, kcal: recipe.kcal, protein: recipe.protein, carbs: recipe.carbs, fat: recipe.fat }
          : m
      )
    );

  const waterTarget = 8;
  const calorieTarget = 1900;
  // Le kcal di oggi sono sempre la somma reale dei pasti attuali,
  // non un numero fisso: si aggiornano da sole a ogni sostituzione.
  const calories = meals.reduce((sum, m) => sum + Number(m.kcal || 0), 0);

  const doneMeals = meals.filter((m) => m.completed).length;

  const groceryLeft = 4;

  return (
    <Page>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono-num text-xs uppercase tracking-wider mb-1 text-white/70">{todayLabel()}</p>
          <h1 className="text-4xl font-bold text-white">
            {greeting()}{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="text-sm text-white/70 mt-1">Un piano semplice, un giorno alla volta.</p>
        </div>
        <Link to="/profilo" className={`${GLASS} w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0`}>
          {initial}
        </Link>
      </div>

      {/* Messaggio positivo, al posto della card Obiettivo (spostata in Salute) */}
      <div className={`${GLASS} rounded-[28px] p-7 mb-10`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none">{message.emoji}</span>
          <p className="text-2xl font-semibold text-white leading-snug">{message.text}</p>
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
            <div key={meal.id} className={`min-w-0 ${i === meals.length - 1 && meals.length % 2 === 1 ? "md:col-span-2" : ""}`}>
              <MealRow
                meal={meal}
                onToggle={toggleMeal}
                onSwap={swapMeal}
                dailyTotal={calories}
                calorieTarget={calorieTarget}
                locked={planConfirmed}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs font-mono-num text-white/70">{doneMeals} di {meals.length} completati</p>

          {!planConfirmed ? (
            <button
              onClick={() => setPlanConfirmed(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white"
              style={{ color: T.forest }}
            >
              <Lock size={13} /> Conferma il piano di oggi
            </button>
          ) : (
            <button
              onClick={() => setPlanConfirmed(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white"
            >
              <Unlock size={13} /> Piano confermato · Modifica ancora
            </button>
          )}
        </div>
      </div>

      {/* Calorie / Acqua — il Peso è ora in Salute */}
      <div className={`${GLASS} rounded-[28px] p-7 mb-10`}>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <Ring value={calories} max={calorieTarget} icon={Flame} label="Calorie" />
          <Ring value={water} max={waterTarget} icon={Droplet} label="Acqua" />
        </div>
        <button
          onClick={() => {
            const next = Math.min(water + 1, waterTarget);
            setWater(next);
            if (session?.user?.id) saveTodayWater(session.user.id, next);
          }}
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
