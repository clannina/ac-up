import { useEffect, useMemo, useState } from "react";
import { Search, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle } from "../components/ui";

const FOOD_GROUP_LABELS = {
  carne: "Carne",
  pesce: "Pesce",
  legumi: "Legumi",
  uova_latticini: "Uova & Latticini",
  colazioni: "Colazioni",
};

function RecipeCard({ recipe }) {
  const [open, setOpen] = useState(false);
  const [ingredients, setIngredients] = useState(null);
  const [loadingIng, setLoadingIng] = useState(false);

  const toggleOpen = async () => {
    if (!open && ingredients === null) {
      setLoadingIng(true);
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("grams, ingredients(name)")
        .eq("recipe_id", recipe.id);
      setIngredients(error ? [] : data);
      setLoadingIng(false);
    }
    setOpen((o) => !o);
  };

  return (
    <div className={`${GLASS} rounded-[28px] p-5 transition hover:bg-white/20`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white">{recipe.name}</h3>
          <p className="text-sm text-white/70">
            {FOOD_GROUP_LABELS[recipe.food_group] ?? recipe.category ?? ""}
          </p>
        </div>
        {recipe.kcal != null && (
          <span className="rounded-full px-3 py-1 text-sm font-semibold font-mono-num whitespace-nowrap bg-white" style={{ color: T.forest }}>
            {recipe.kcal} kcal
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
        {recipe.prep_min != null && (
          <span className="flex items-center gap-1">
            <Clock size={14} /> <span className="font-mono-num">{recipe.prep_min} min</span>
          </span>
        )}
        {recipe.difficulty && <span>{recipe.difficulty}</span>}
        {recipe.servings && <span className="font-mono-num">{recipe.servings} porz.</span>}
      </div>

      <div className="mt-6 flex justify-between items-center text-sm">
        <span className="flex items-center gap-1.5 text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="font-mono-num">{recipe.protein != null ? `${recipe.protein} g proteine` : "—"}</span>
        </span>
        <button
          onClick={toggleOpen}
          className="rounded-xl px-4 py-2 flex items-center gap-1 transition bg-white font-semibold"
          style={{ color: T.forest }}
        >
          Apri {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          {loadingIng && <p className="text-sm text-white/70">Carico ingredienti...</p>}
          {!loadingIng && ingredients?.length === 0 && (
            <p className="text-sm text-white/70">Nessun ingrediente registrato per questa ricetta.</p>
          )}
          {!loadingIng && ingredients?.length > 0 && (
            <ul className="text-sm space-y-1 text-white/90">
              {ingredients.map((row, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{row.ingredients?.name ?? "Ingrediente"}</span>
                  <span className="font-mono-num text-white/70">{row.grams} g</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function Ricette() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("tutte");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) {
        if (active) {
          setError("Configurazione Supabase mancante o non valida.");
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase.from("recipes").select("*").order("name");
      if (!active) return;
      if (error) setError(error.message);
      else setRecipes(data ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const counts = {};
    recipes.forEach((r) => {
      const key = r.food_group ?? "altro";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    const known = Object.keys(FOOD_GROUP_LABELS).filter((k) => counts[k]);
    const extra = Object.keys(counts).filter((k) => !FOOD_GROUP_LABELS[k]);
    return [
      { key: "tutte", label: "Tutte", count: recipes.length },
      ...known.map((k) => ({ key: k, label: FOOD_GROUP_LABELS[k], count: counts[k] })),
      ...extra.map((k) => ({ key: k, label: k, count: counts[k] })),
    ];
  }, [recipes]);

  const filtered = useMemo(
    () =>
      recipes.filter(
        (r) =>
          (category === "tutte" || r.food_group === category) &&
          r.name.toLowerCase().includes(search.toLowerCase())
      ),
    [recipes, search, category]
  );

  return (
    <Page>
      <div className="mb-8">
        <SectionTitle className="text-3xl">Ricette</SectionTitle>
        <p className="mt-2 text-white/70">Archivio ricette AC UP, collegato al database.</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-3 text-white/70" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca una ricetta..."
          className="w-full rounded-xl py-3 pl-11 pr-4 outline-none bg-white/15 text-white placeholder-white/60"
          style={{ border: "1px solid rgba(255,255,255,0.3)" }}
        />
      </div>

      {!loading && !error && categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition"
              style={
                category === c.key
                  ? { background: "white", color: T.forest }
                  : { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }
              }
            >
              {c.label} <span className="opacity-70 font-mono-num">({c.count})</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${GLASS} rounded-[28px] p-5 h-40 animate-pulse`} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[28px] p-5 bg-white" style={{ color: T.coral, border: `1px solid ${T.coral}` }}>
          Non riesco a caricare le ricette dal database ({error}). Controlla che l'app sia collegata a Supabase.
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={`${GLASS} rounded-[28px] p-10 text-center text-white/70`}>
          Nessuna ricetta trovata.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </Page>
  );
}
