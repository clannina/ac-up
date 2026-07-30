import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Share2, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../supabaseClient";
import { nextWeekDates, toISODate, formatShortDate } from "../lib/week";

const CATEGORY_ORDER = ["Carne", "Pesce", "Ortofrutta", "Latticini", "Uova", "Panetteria", "Dispensa", "Condimenti"];

function formatQty(grams) {
  if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} kg`;
  return `${Math.round(grams)} g`;
}

// Condivide solo i prodotti selezionati (quelli che mancano), non l'intera lista.
function buildShareText(orderedCategories, groupedMissing, dates) {
  const lines = [`🛒 Da comprare (${formatShortDate(dates[0])} – ${formatShortDate(dates[6])})`, ""];
  orderedCategories.forEach((category) => {
    const list = groupedMissing[category];
    if (!list || list.length === 0) return;
    lines.push(category.toUpperCase());
    list.forEach((item) => {
      lines.push(`- ${item.name} (${formatQty(item.grams)})`);
    });
    lines.push("");
  });
  return lines.join("\n").trim();
}

export default function Spesa() {
  const { session } = useAuth();
  const dates = useMemo(() => nextWeekDates(), []);

  const [items, setItems] = useState(null); // null = ancora da caricare
  const [checked, setChecked] = useState({}); // spuntato = manca, va comprato
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareFallback, setShowShareFallback] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase || !session?.user?.id) {
        setLoading(false);
        return;
      }

      const startISO = toISODate(dates[0]);
      const endISO = toISODate(dates[6]);

      const { data: plan, error: planError } = await supabase
        .from("meal_plan")
        .select("recipe_id")
        .eq("profile_id", session.user.id)
        .gte("meal_date", startISO)
        .lte("meal_date", endISO);

      if (!active) return;
      if (planError) {
        setError(planError.message);
        setLoading(false);
        return;
      }

      if (!plan || plan.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Quante volte ricorre ciascuna ricetta nella settimana (per moltiplicare le grammature).
      const recipeCount = {};
      plan.forEach((p) => {
        recipeCount[p.recipe_id] = (recipeCount[p.recipe_id] || 0) + 1;
      });
      const recipeIds = Object.keys(recipeCount).map(Number);

      const { data: links, error: linksError } = await supabase
        .from("recipe_ingredients")
        .select("recipe_id, grams, ingredients(name, supermarket_category)")
        .in("recipe_id", recipeIds);

      if (!active) return;
      if (linksError) {
        setError(linksError.message);
        setLoading(false);
        return;
      }

      // Somma le grammature di ogni ingrediente su tutta la settimana.
      const totals = {};
      (links ?? []).forEach((row) => {
        const name = row.ingredients?.name;
        if (!name) return;
        const category = row.ingredients?.supermarket_category || "Dispensa";
        const multiplier = recipeCount[row.recipe_id] || 1;
        if (!totals[name]) totals[name] = { name, category, grams: 0 };
        totals[name].grams += row.grams * multiplier;
      });

      setItems(Object.values(totals));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const toggle = (name) => setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  const clearSelection = () => setChecked({});

  const grouped = useMemo(() => {
    if (!items) return {};
    const g = {};
    items.forEach((item) => {
      g[item.category] = g[item.category] || [];
      g[item.category].push(item);
    });
    Object.values(g).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return g;
  }, [items]);

  const orderedCategories = useMemo(() => {
    const present = Object.keys(grouped);
    const known = CATEGORY_ORDER.filter((c) => present.includes(c));
    const extra = present.filter((c) => !CATEGORY_ORDER.includes(c));
    return [...known, ...extra];
  }, [grouped]);

  const totalCount = items?.length ?? 0;
  const missingCount = items?.filter((i) => checked[i.name]).length ?? 0;

  const groupedMissing = useMemo(() => {
    const g = {};
    orderedCategories.forEach((category) => {
      const list = (grouped[category] || []).filter((item) => checked[item.name]);
      if (list.length > 0) g[category] = list;
    });
    return g;
  }, [grouped, orderedCategories, checked]);

  const shareText = useMemo(
    () => (missingCount > 0 ? buildShareText(orderedCategories, groupedMissing, dates) : ""),
    [missingCount, orderedCategories, groupedMissing, dates]
  );

  const handleShare = async () => {
    if (missingCount === 0) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Lista della spesa AC UP", text: shareText });
      } catch {
        // l'utente ha annullato la condivisione, nessun errore da mostrare
      }
    } else {
      setShowShareFallback((v) => !v);
    }
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent("Lista della spesa")}&body=${encodeURIComponent(shareText)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <Page maxWidth="max-w-4xl">
      <div className="mb-8">
        <SectionTitle className="text-3xl">Lista della Spesa</SectionTitle>
        <p className="mt-2 text-white/70">
          Dal menù della settimana: {formatShortDate(dates[0])} — {formatShortDate(dates[6])}
        </p>
        {totalCount > 0 && (
          <p className="mt-1 text-sm text-white/60">
            Seleziona ciò che ti manca — solo quello verrà condiviso.
          </p>
        )}
      </div>

      {!loading && !error && totalCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={handleShare}
            disabled={missingCount === 0}
            className={`${GLASS} flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm transition hover:bg-white/25 disabled:opacity-40`}
          >
            <Share2 size={16} /> Condividi selezionati {missingCount > 0 && `(${missingCount})`}
          </button>

          <button
            onClick={clearSelection}
            disabled={missingCount === 0}
            className={`${GLASS} flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm transition hover:bg-white/25 disabled:opacity-40`}
          >
            <RotateCcw size={15} /> Deseleziona tutto
          </button>

          {showShareFallback && (
            <div className="flex gap-3 w-full">
              <a
                href={mailtoHref}
                className={`${GLASS} flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition hover:bg-white/25`}
              >
                <Mail size={15} /> Email
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${GLASS} flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition hover:bg-white/25`}
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {loading && <p className="text-white/70">Preparo la lista dagli ingredienti del menù...</p>}

      {!loading && error && (
        <div className="rounded-[28px] p-5 bg-white" style={{ color: T.coral, border: `1px solid ${T.coral}` }}>
          Non riesco a caricare la lista della spesa ({error}).
        </div>
      )}

      {!loading && !error && items && items.length === 0 && (
        <div className={`${GLASS} rounded-[28px] p-10 text-center`}>
          <p className="text-white/80 mb-6">
            Non hai ancora un menù salvato per questa settimana: la lista della spesa nasce dagli
            ingredienti del menù settimanale, quindi generalo prima da lì.
          </p>
          <PrimaryButton as={Link} to="/menu" className="mx-auto inline-flex items-center gap-2">
            Vai al menù della settimana <ArrowRight size={16} />
          </PrimaryButton>
        </div>
      )}

      {!loading && !error && items && items.length > 0 && (
        <>
          {orderedCategories.map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: T.cream }}>
                {category}
              </h2>

              <div className={`${GLASS} rounded-[28px] divide-y divide-white/15`}>
                {grouped[category].map((item) => (
                  <label
                    key={item.name}
                    className="flex items-center justify-between p-4 cursor-pointer transition hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!checked[item.name]}
                        onChange={() => toggle(item.name)}
                        className="w-5 h-5"
                      />
                      <span className={checked[item.name] ? "text-white font-semibold" : "text-white/50"}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono-num text-sm text-white/70">{formatQty(item.grams)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </Page>
  );
}
