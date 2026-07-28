import { FILOSOFIA } from "../lib/foodData.js";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-5 pt-8">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8368]">Oggi</p>
      <h1 className="font-display text-4xl mt-1">AC UP</h1>

      <div className="mt-5 rounded-lg bg-white/70 border border-[#E4DFCF] p-4">
        <p className="font-display italic text-lg text-[#4A4736]">Nessun senso di colpa.</p>
        <p className="text-sm text-[#6B6650] mt-1">Il menu si adatta a te, non il contrario.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-lg border border-[#E4DFCF] bg-sand px-4 py-3">
          <p className="text-[11px] uppercase text-sage">Acqua</p>
          <p className="font-mono-num text-xl mt-1">0 / 2 L</p>
        </div>
        <div className="rounded-lg border border-[#E4DFCF] bg-sand px-4 py-3">
          <p className="text-[11px] uppercase text-sage">Peso</p>
          <p className="font-mono-num text-xl mt-1">— kg</p>
        </div>
        <div className="rounded-lg border border-[#E4DFCF] bg-sand px-4 py-3">
          <p className="text-[11px] uppercase text-sage">Pressione</p>
          <p className="font-mono-num text-xl mt-1">—/—</p>
        </div>
        <div className="rounded-lg border border-[#E4DFCF] bg-sand px-4 py-3">
          <p className="text-[11px] uppercase text-sage">Lista spesa</p>
          <p className="text-sm mt-1 text-clay">Vai alla lista →</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-sage mb-2">Filosofia</p>
        <ul className="space-y-1.5">
          {FILOSOFIA.map((f) => (
            <li key={f} className="text-sm text-[#4A4736]">· {f}</li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-center text-[#B5AF95] mt-8">
        Nota: acqua, peso e pressione sono ancora segnaposto — li colleghiamo a Supabase nel prossimo passaggio.
      </p>
    </div>
  );
}
