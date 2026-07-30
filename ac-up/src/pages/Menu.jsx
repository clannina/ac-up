import { useEffect, useMemo, useState } from "react";
import { Shuffle, ChevronDown, ChevronUp, Loader2, Check, Flame } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../supabaseClient";

const SLOTS = [
  { key: "Colazione", time: "07:30", groups: ["colazioni"] },
  { key: "Spuntino", time: "10:30", groups: ["spuntini"] },
  { key: "Pranzo", time: "13:00", groups: ["carne", "pesce", "legumi"], preferMealPrep: true },
  { key: "Merenda", time: "17:00", groups: ["merende"] },
  { key: "Cena", time: "20:00", groups: ["carne", "pesce", "legumi"] },
];

// Dentro "uova_latticini" ci sono anche piatti cucinati (frittate, omelette,
// uova strapazzate): non sono spuntini veloci, li escludiamo da Spuntino/Merenda.
const COOKED_DISH_PREFIXES = ["Frittata", "Omelette", "Uova strapazzate"];
function isQuickSnack(name) {
  return !COOKED_DISH_PREFIXES.some((p) => name.startsWith(p));
}

const DAY_LABELS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const MAX_CARNE_PER_WEEK = 3; // "ridurre la carne senza eliminarla"

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function formatShortDate(d) {
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

// La settimana successiva (lun-dom): è uno strumento di pianificazione
// in avanti, pensato apposta per prepararlo la domenica.
function nextWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const offsetToMonday = (1 - today.getDay() + 7) % 7;
  const monday = new Date(today);
  monday.setDate(monday.getDate() + offsetToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function pickWeighted(pool, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function pickRecipe(byGroup, groups, used, preferMealPrep, carneCount, snackOnly) {
  let candidateGroups = groups;
  if (groups.includes("carne") && carneCount >= MAX_CARNE_PER_WEEK) {
    candidateGroups = groups.filter((g) => g !== "carne");
  }
  const weights = candidateGroups.map((g) => (g === "carne" ? 1 : 2));
  const group = pickWeighted(candidateGroups, weights);

  let pool = (byGroup[group] || []).filter((r) => !used.has(r.id));
  if (snackOnly) pool = pool.filter((r) => isQuickSnack(r.name));
  if (preferMealPrep) {
    const mealPrepPool = pool.filter((r) => r.meal_prep);
    if (mealPrepPool.length > 0) pool = mealPrepPool;
  }
  if (pool.length === 0) {
    // riusa il gruppo intero se si esaurisce, mantenendo comunque il filtro spuntino
    pool = (byGroup[group] || []).filter((r) => !snackOnly || isQuickSnack(r.name));
  }

  const recipe = pool[Math.floor(Math.random() * pool.length)];
  return { recipe, group };
}

function generateWeek(byGroup, dates) {
  const used = new Set();
  let carneCount = 0;

  return dates.map((date) => {
    const meals = SLOTS.map((slot) => {
      const { recipe, group } = pickRecipe(byGroup, slot.groups, used, slot.preferMealPrep, carneCount, slot.snackOnly);
      if (recipe) {
        used.add(recipe.id);
        if (group === "carne") carneCount++;
      }
      return { slot: slot.key, time: slot.time, recipe };
    });
    return { date, meals };
  });
}

function DayCard({ day, isOpen, onToggle, onShuffle, byGroup, dailyTotalTarget }) {
  const total = day.meals.reduce((sum, m) => sum + (m.recipe?.kcal ?? 0), 0);

  return (
    <div className={`${GLASS} rounded-[28px] overflow-hidden`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
        <div>
          <h3 className="text-base font-bold text-white">{DAY_LABELS[day.dayIndex]}</h3>
          <span className="font-mono-num text-xs text-white/70">{formatShortDate(day.date)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono-num text-sm text-white/80">
            <Flame size={13} /> {total} kcal
          </span>
          {isOpen ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-white" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-2">
          {day.meals.map((m) => (
            <div
              key={m.slot}
              className="flex items-center justify-between rounded-2xl p-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/60">{m.slot} · {m.time}</p>
                <p className="text-sm font-medium text-white">{m.recipe?.name ?? "—"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="font-mono-num text-xs text-white/80">{m.recipe?.kcal ?? "—"} kcal</span>
                <button
                  onClick={() => onShuffle(day.dayIndex, m.slot)}
                  aria-label="Cambia questo pasto"
                  className="w-7 h-7 rounded-full flex items-center justify-center transition hover:bg-white/15"
                >
                  <Shuffle size={13} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Menu() {
  const { session } = useAuth();
  const dates = useMemo(() => nextWeekDates(), []);

  const [byGroup, setByGroup] = useState(null);
  const [week, setWeek] = useState(null); // null = non ancora generato/caricato
  const [openDay, setOpenDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) {
        setError("Configurazione Supabase mancante o non valida.");
        setLoading(false);
        return;
      }

      const { data: recipes, error: recipesError } = await supabase.from("recipes").select("*");
      if (!active) return;
      if (recipesError) {
        setError(recipesError.message);
        setLoading(false);
        return;
      }
      const grouped = {};
      (recipes ?? []).forEach((r) => {
        const g = r.food_group ?? "altro";
        grouped[g] = grouped[g] || [];
        grouped[g].push(r);
      });
      setByGroup(grouped);

      // Carica il piano già salvato per questa settimana, se esiste.
      if (session?.user?.id) {
        const startISO = toISODate(dates[0]);
        const endISO = toISODate(dates[6]);
        const { data: plan } = await supabase
          .from("meal_plan")
          .select("meal_date, meal_type, recipes(*)")
          .eq("profile_id", session.user.id)
          .gte("meal_date", startISO)
          .lte("meal_date", endISO);

        if (plan && plan.length > 0) {
          const byDate = {};
          plan.forEach((row) => {
            byDate[row.meal_date] = byDate[row.meal_date] || {};
            byDate[row.meal_date][row.meal_type] = row.recipes;
          });
          const loadedWeek = dates.map((date, dayIndex) => ({
            dayIndex,
            date,
            meals: SLOTS.map((slot) => ({
              slot: slot.key,
              time: slot.time,
              recipe: byDate[toISODate(date)]?.[slot.key] ?? null,
            })),
          }));
          setWeek(loadedWeek);
        }
      }

      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleGenerate = () => {
    if (!byGroup) return;
    const generated = generateWeek(byGroup, dates).map((d, dayIndex) => ({ ...d, dayIndex }));
    setWeek(generated);
    setSaved(false);
  };

  const handleShuffle = (dayIndex, slotKey) => {
    setWeek((prev) => {
      const slotDef = SLOTS.find((s) => s.key === slotKey);
      const used = new Set(
        prev.flatMap((d) => d.meals.map((m) => m.recipe?.id)).filter(Boolean)
      );
      const { recipe } = pickRecipe(byGroup, slotDef.groups, used, slotDef.preferMealPrep, 0, slotDef.snackOnly);
      return prev.map((d) =>
        d.dayIndex !== dayIndex
          ? d
          : { ...d, meals: d.meals.map((m) => (m.slot === slotKey ? { ...m, recipe } : m)) }
      );
    });
    setSaved(false);
  };

  const saveWeek = async () => {
    if (!supabase || !session?.user?.id || !week) return;
    setSaving(true);

    const rows = week.flatMap((day) =>
      day.meals
        .filter((m) => m.recipe)
        .map((m) => ({
          profile_id: session.user.id,
          meal_date: toISODate(day.date),
          meal_type: m.slot,
          recipe_id: m.recipe.id,
        }))
    );

    const { error } = await supabase
      .from("meal_plan")
      .upsert(rows, { onConflict: "profile_id,meal_date,meal_type" });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const weekTotal = week?.reduce((sum, d) => sum + d.meals.reduce((s, m) => s + (m.recipe?.kcal ?? 0), 0), 0);

  return (
    <Page>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 mb-8">
        <div>
          <SectionTitle className="text-3xl">Menù della settimana</SectionTitle>
          <p className="mt-2 text-white/70">
            {formatShortDate(dates[0])} — {formatShortDate(dates[6])}
          </p>
        </div>
        {week && (
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-white">
                <Check size={16} /> Salvato
              </span>
            )}
            <button
              onClick={handleGenerate}
              className={`${GLASS} px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:bg-white/25`}
            >
              Rigenera
            </button>
            <PrimaryButton onClick={saveWeek} disabled={saving} className="px-5 py-2.5 flex items-center gap-2 text-sm">
              {saving && <Loader2 size={15} className="animate-spin" />}
              Salva settimana
            </PrimaryButton>
          </div>
        )}
      </div>

      {loading && <p className="text-white/70">Preparo il generatore di menù...</p>}

      {!loading && error && (
        <div className="rounded-[28px] p-5 bg-white" style={{ color: T.coral, border: `1px solid ${T.coral}` }}>
          Non riesco a caricare le ricette dal database ({error}).
        </div>
      )}

      {!loading && !error && !week && (
        <div className={`${GLASS} rounded-[28px] p-10 text-center`}>
          <p className="text-white/80 mb-6">
            Non hai ancora un menù per questa settimana. Generane uno partendo dalle tue 150 ricette,
            rispettando le tue preferenze (meno carne, pranzi da ufficio, niente ingredienti che non ti piacciono).
          </p>
          <PrimaryButton onClick={handleGenerate} className="mx-auto">
            Genera il menù della settimana
          </PrimaryButton>
        </div>
      )}

      {!loading && !error && week && (
        <>
          <p className="text-sm text-white/70 mb-4 font-mono-num">
            Media giornaliera: {Math.round(weekTotal / 7)} kcal
          </p>
          <div className="space-y-3">
            {week.map((day) => (
              <DayCard
                key={day.dayIndex}
                day={day}
                isOpen={openDay === day.dayIndex}
                onToggle={() => setOpenDay(openDay === day.dayIndex ? -1 : day.dayIndex)}
                onShuffle={handleShuffle}
                byGroup={byGroup}
              />
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
