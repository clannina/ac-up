import { useState } from "react";

export default function Profilo() {
  const [profile,setProfile]=useState({
    name:"Anna",
    email:"anna@example.com",
    weight:98,
    target:75,
    calories:1900,
    water:8
  });

  const update=(e)=>{
    const {name,value}=e.target;
    setProfile(p=>({...p,[name]:value}));
  };

  const Field=({label,name,type="text"})=>(
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={profile[name]}
        onChange={update}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold">Profilo</h1>
      <p className="text-gray-500 mt-2">Gestisci il tuo account e gli obiettivi.</p>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mt-8 space-y-6">
        <Field label="Nome" name="name" />
        <Field label="Email" name="email" type="email" />

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Peso attuale (kg)" name="weight" type="number" />
          <Field label="Obiettivo (kg)" name="target" type="number" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Calorie giornaliere" name="calories" type="number" />
          <Field label="Obiettivo acqua (bicchieri)" name="water" type="number" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Preferenze alimentari</label>
          <textarea
            rows="5"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Es. niente pesce spada, salmone solo affumicato o in scatola..."
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button className="px-6 py-3 rounded-xl border hover:bg-gray-50">
            Annulla
          </button>
          <button className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700">
            Salva profilo
          </button>
        </div>
      </div>
    </div>
  );
}
