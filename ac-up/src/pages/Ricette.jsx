import { useEffect, useMemo, useState } from "react";
import { Search, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../supabaseClient";

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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{recipe.name}</h3>
          <p className="text-sm text-gray-500">{recipe.category}</p>
        </div>
        {recipe.kcal != null && (
          <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-semibold whitespace-nowrap">
            {recipe.kcal} kcal
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        {recipe.prep_min != null && (
          <span className="flex items-center gap-1">
            <Clock size={14} /> {recipe.prep_min} min
          </span>
        )}
        {recipe.difficulty && <span>{recipe.difficulty}</span>}
        {recipe.servings && <span>{recipe.servings} porz.</span>}
      </div>

      <div className="mt-6 flex justify-between items-center text-sm">
        <span>🥩 {recipe.protein != null ? `${recipe.protein} g proteine` : "—"}</span>
        <button
          onClick={toggleOpen}
          className="rounded-xl bg-green-600 text-white px-4 py-2 hover:bg-green-700 flex items-center gap-1 transition"
        >
          Apri {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {loadingIng && <p className="text-sm text-gray-400">Carico ingredienti...</p>}
          {!loadingIng && ingredients?.length === 0 && (
            <p className="text-sm text-gray-400">Nessun ingrediente registrato per questa ricetta.</p>
          )}
          {!loadingIng && ingredients?.length > 0 && (
            <ul className="text-sm text-gray-600 space-y-1">
              {ingredients.map((row, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{row.ingredients?.name ?? "Ingrediente"}</span>
                  <span className="text-gray-400">{row.grams} g</span>
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

  const filtered = useMemo(
    () => recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [recipes, search]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Ricette</h1>
        <p className="text-gray-500 mt-2">Archivio ricette AC UP, collegato al database.</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-3 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca una ricetta..."
          className="w-full rounded-xl border py-3 pl-11 pr-4 focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      {loading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 h-40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-5">
          Non riesco a caricare le ricette dal database ({error}). Controlla che l'app sia collegata a Supabase.
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
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
    </div>
  );
}
