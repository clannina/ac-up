import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const recipes = [
  {id:1,title:"Overnight oats",category:"Colazione",kcal:350,protein:24},
  {id:2,title:"Insalata di pollo",category:"Pranzo",kcal:520,protein:42},
  {id:3,title:"Pasta tonno e zucchine",category:"Pranzo",kcal:610,protein:36},
  {id:4,title:"Yogurt greco e frutta",category:"Spuntino",kcal:220,protein:20},
  {id:5,title:"Hamburger con patate",category:"Cena",kcal:640,protein:40},
  {id:6,title:"Salmone affumicato e avocado",category:"Cena",kcal:480,protein:32},
];

function RecipeCard({recipe}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{recipe.title}</h3>
          <p className="text-sm text-gray-500">{recipe.category}</p>
        </div>
        <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-semibold">
          {recipe.kcal} kcal
        </span>
      </div>

      <div className="mt-6 flex justify-between text-sm">
        <span>🥩 {recipe.protein} g proteine</span>
        <button className="rounded-xl bg-green-600 text-white px-4 py-2 hover:bg-green-700">
          Apri
        </button>
      </div>
    </div>
  );
}

export default function Ricette() {
  const [search,setSearch]=useState("");

  const filtered=useMemo(
    ()=>recipes.filter(r=>r.title.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Ricette</h1>
        <p className="text-gray-500 mt-2">
          Archivio ricette AC UP. Pronto per Supabase.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-3 text-gray-400" size={18}/>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Cerca una ricetta..."
          className="w-full rounded-xl border py-3 pl-11 pr-4 focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(recipe=>(
          <RecipeCard key={recipe.id} recipe={recipe}/>
        ))}
      </div>
    </div>
  );
}
