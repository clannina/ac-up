import { useState } from "react";

export default function Salute() {
  const [stats] = useState({
    weight:98,
    target:75,
    bmi:35.1,
    water:6,
    waterTarget:8,
    calories:1450,
    calorieTarget:1900,
    waist:108,
    chest:116,
    hips:122
  });

  const pct=(v,t)=>Math.round((v/t)*100);

  const Card=({title,value,unit,color})=>(
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-4xl font-bold mt-2" style={{color}}>
        {value}<span className="text-xl ml-1">{unit}</span>
      </h2>
    </div>
  );

  return(
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold">Salute</h1>
      <p className="text-gray-500 mt-2">Monitora i tuoi progressi.</p>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        <Card title="Peso" value={stats.weight} unit="kg" color="#16a34a"/>
        <Card title="BMI" value={stats.bmi} unit="" color="#2563eb"/>
        <Card title="Acqua" value={stats.water} unit="bicchieri" color="#0ea5e9"/>
        <Card title="Calorie" value={stats.calories} unit="kcal" color="#ea580c"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white rounded-3xl border p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-6">Obiettivi</h2>

          <p className="mb-2">Peso</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-600 h-3 rounded-full" style={{width:`${pct(stats.target,stats.weight)}%`}}/>
          </div>

          <p className="mt-6 mb-2">Acqua</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-sky-500 h-3 rounded-full" style={{width:`${pct(stats.water,stats.waterTarget)}%`}}/>
          </div>

          <p className="mt-6 mb-2">Calorie</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-orange-500 h-3 rounded-full" style={{width:`${pct(stats.calories,stats.calorieTarget)}%`}}/>
          </div>
        </div>

        <div className="bg-white rounded-3xl border p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-6">Misure corporee</h2>

          <div className="space-y-4">
            <div className="flex justify-between"><span>Vita</span><strong>{stats.waist} cm</strong></div>
            <div className="flex justify-between"><span>Torace</span><strong>{stats.chest} cm</strong></div>
            <div className="flex justify-between"><span>Fianchi</span><strong>{stats.hips} cm</strong></div>
          </div>

          <button className="mt-8 w-full rounded-xl bg-green-600 text-white py-3 hover:bg-green-700">
            Aggiorna misure
          </button>
        </div>
      </div>
    </div>
  );
}
