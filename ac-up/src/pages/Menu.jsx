import { useState } from "react";
import { Sparkles } from "lucide-react";
import { generateWeeklyMenu, GIORNI } from "../lib/menuGenerator.js";
import { REGOLE_GENERATORE } from "../lib/foodData.js";

export default function Menu() {
  const [week, setWeek] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Menu settimanale</h1>
        <button
          onClick={() => setWeek(generateWeeklyMenu())}
          className="flex items-center gap-1.5 bg-ink text-cream text-sm rounded-full px-4 py-2"
        >
          <Sparkles size={15} /> Genera
        </button>
      </div>

      {!week && (
        <p className="text-sm text-[#9A9578] italic mt-6">
          Tocca "Genera" per creare la settimana: rotazione delle proteine, pizza libera, pranzi da schiscetta e cene veloci, come da regole.
        </p>
      )}

      {week && (
        <div className="mt-5 space-y-3">
          {GIORNI.map((giorno) => (
            <div key={giorno} className="rounded-lg border border-[#E4DFCF] bg-white/60 px-4 py-3">
              <p className="font-display text-lg">{giorno}</p>
              <div className="grid grid-cols-5 gap-2 mt-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase text-sage">Colazione</p>
                  <p>{week[giorno].colazione?.nome}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-sage">Spuntino</p>
                  <p>{week[giorno].spuntino?.nome}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-sage">Pranzo</p>
                  <p>{week[giorno].pranzo?.nome}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-sage">Merenda</p>
                  <p>{week[giorno].merenda?.nome}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-sage">Cena</p>
                  <p>{week[giorno].cena?.nome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <p className="text-xs uppercase tracking-wide text-sage mb-2">Regole del generatore</p>
        <ul className="space-y-1 text-sm text-[#4A4736]">
          {REGOLE_GENERATORE.map((r) => <li key={r}>· {r}</li>)}
        </ul>
      </div>
    </div>
  );
}
