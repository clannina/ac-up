import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

const meals = [
  { id:1,name:"Colazione",calories:320,protein:22,carbs:30,fat:10,time:"06:30"},
  { id:2,name:"Spuntino",calories:180,protein:15,carbs:18,fat:5,time:"10:30"},
  { id:3,name:"Pranzo",calories:640,protein:42,carbs:65,fat:18,time:"13:00"},
  { id:4,name:"Merenda",calories:170,protein:10,carbs:20,fat:6,time:"17:00"},
  { id:5,name:"Cena",calories:560,protein:38,carbs:40,fat:20,time:"20:00"},
];

function Macro({label,value,color}) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-bold text-lg" style={{color}}>{value}g</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function MealCard({meal}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{meal.name}</h2>
          <p className="text-gray-500">{meal.time}</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
          {meal.calories} kcal
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <Macro label="Proteine" value={meal.protein} color="#16a34a"/>
        <Macro label="Carbo" value={meal.carbs} color="#2563eb"/>
        <Macro label="Grassi" value={meal.fat} color="#f97316"/>
      </div>

      <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 transition">
        Modifica pasto
      </button>
    </div>
  );
}

export default function Menu() {
  const [search, setSearch] = useState("");
  const filtered = meals.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
        <div>
          <h1 className="text-4xl font-bold">Piano Alimentare</h1>
          <p className="text-gray-500 mt-2">Gestisci tutti i pasti della giornata.</p>
        </div>

        <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 transition">
          <Plus size={18}/> Nuovo pasto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 p-5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-gray-400" size={18}/>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Cerca un pasto..."
            className="pl-11 pr-4 py-3 rounded-xl border w-full outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button className="border rounded-xl px-5 flex items-center justify-center gap-2 hover:bg-gray-50">
          <Filter size={18}/> Filtri
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {filtered.map(meal => <MealCard key={meal.id} meal={meal} />)}
      </div>
    </div>
  );
}
