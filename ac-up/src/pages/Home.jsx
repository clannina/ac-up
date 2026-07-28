import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Plus, Droplet, Flame } from "lucide-react";

const MEALS_OGGI = [
  { id: "colazione", label: "Colazione", emoji: "🍳", desc: "Pane integrale, uova, avocado", kcal: 420, from: "#FFA36B", to: "#FF6B4A" },
  { id: "spuntino", label: "Spuntino", emoji: "🍎", desc: "Un frutto di stagione", kcal: 90, from: "#FFC98B", to: "#FF9F6B" },
  { id: "pranzo", label: "Pranzo", emoji: "🥗", desc: "Pollo, riso integrale, verdure", kcal: 610, from: "#8FB996", to: "#527A57" },
  { id: "merenda", label: "Merenda", emoji: "🍇", desc: "Yogurt greco e frutta", kcal: 180, from: "#D4E157", to: "#AED581" },
  { id: "cena", label: "Cena", emoji: "🐟", desc: "Salmone, patate, insalata", kcal: 520, from: "#6B8F71", to: "#3F5C46" },
];

const MANGIATE = 1210;
const OBIETTIVO = 1850;
const BRUCIATE = 240;
const RESTANO = OBIETTIVO - MANGIATE + BRUCIATE;
const PCT = Math.min(100, Math.round((MANGIATE / OBIETTIVO) * 100));

function oggiFormattato(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const giorni = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  return `${giorni[d.getDay()]} ${d.getDate()} ${mesi[d.getMonth()]}`;
}

export default function Home() {
  const [offset, setOffset] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FBF8F2]">
      {/* cerchi decorativi */}
      <div className="pointer-events-none absolute -top-10 -right-14 w-52 h-52 rounded-full bg-gradient-to-br from-[#FFA36B] to-[#FF6B4A] opacity-20 blur-2xl" />
      <div className="pointer-events-none absolute top-40 -left-16 w-40 h-40 rounded-full bg-gradient-to-br from-[#8FB996] to-[#527A57] opacity-20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-24 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-[#D4E157] to-[#AED581] opacity-25 blur-2xl" />

      <div className="relative max-w-xl mx-auto px-5 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2B2A1F]">AC UP</h1>
          <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1.5 shadow-sm shadow-[#00000010]">
            <button onClick={() => setOffset((o) => o - 1)} className="p-1 text-[#9A9578]"><ChevronLeft size={16} /></button>
            <span className="flex items-center gap-1 text-xs font-medium text-[#2B2A1F] px-1">
              <Calendar size={12} /> {oggiFormattato(offset)}
            </span>
            <button onClick={() => setOffset((o) => o + 1)} className="p-1 text-[#9A9578]"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* riepilogo calorico */}
        <div className="mt-5 bg-white rounded-3xl shadow-lg shadow-[#2B2A1F0D] p-5 flex items-center gap-5">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#EEF3EA] flex items-center justify-center"><Droplet size={13} className="text-[#527A57]" /></span>
              <div>
                <p className="text-[11px] text-[#9A9578]">Mangiate</p>
                <p className="text-sm font-semibold text-[#2B2A1F]">{MANGIATE} kcal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#FFEFE6] flex items-center justify-center"><Flame size={13} className="text-[#FF6B4A]" /></span>
              <div>
                <p className="text-[11px] text-[#9A9578]">Bruciate</p>
                <p className="text-sm font-semibold text-[#2B2A1F]">{BRUCIATE} kcal</p>
              </div>
            </div>
          </div>

          <div className="kcal-ring w-28 h-28 shrink-0" style={{ "--pct": PCT }}>
            <div className="w-[86px] h-[86px] rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-[#2B2A1F]">{RESTANO}</span>
              <span className="text-[10px] text-[#9A9578]">kcal rimaste</span>
            </div>
          </div>
        </div>

        {/* pasti di oggi */}
        <div className="mt-7 flex items-center justify-between">
          <p className="font-semibold text-[#2B2A1F]">Pasti di oggi</p>
          <span className="text-xs text-[#527A57] font-medium">Vedi menu →</span>
        </div>

        <div className="mt-3 flex gap-3.5 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
          {MEALS_OGGI.map((m) => (
            <div
              key={m.id}
              className="relative shrink-0 w-40 rounded-3xl pt-8 pb-4 px-4 text-white shadow-lg"
              style={{ background: `linear-gradient(160deg, ${m.from}, ${m.to})`, boxShadow: `0 12px 20px -8px ${m.to}80` }}
            >
              <span className="absolute -top-4 left-4 w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-xl shadow-md">
                {m.emoji}
              </span>
              <p className="font-semibold mt-3">{m.label}</p>
              <p className="text-[11px] text-white/85 mt-1 leading-snug h-8">{m.desc}</p>
              <div className="flex items-end justify-between mt-3">
                <p className="text-xl font-bold">{m.kcal}<span className="text-[11px] font-normal ml-0.5">kcal</span></p>
                <button className="w-7 h-7 rounded-full bg-white/90 text-[#2B2A1F] flex items-center justify-center">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-center text-[#C2BCA0] mt-8 mb-6">
          I valori sono di esempio — si collegano al Menu generato e al modulo Salute nei prossimi passaggi.
        </p>
      </div>
    </div>
  );
}
