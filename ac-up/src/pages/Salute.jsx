import { useState } from "react";
import { Scale, Droplet, Flame, Activity, Flag } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, Ring, PrimaryButton } from "../components/ui";

export default function Salute() {
  const [stats] = useState({
    weight: 98,
    target: 75,
    bmi: 35.1,
    water: 6,
    waterTarget: 8,
    calories: 1450,
    calorieTarget: 1900,
    waist: 108,
    chest: 116,
    hips: 122,
  });

  const weightDelta = -0.8;
  const span = 30;
  const distance = stats.weight - stats.target;
  const trackPct = Math.max(4, Math.min(96, 100 - (distance / span) * 100));

  return (
    <Page>
      <SectionTitle className="text-3xl">Salute</SectionTitle>
      <p className="mt-2 text-white/70">Monitora i tuoi progressi.</p>

      {/* Obiettivo — spostata qui da Home */}
      <div className={`${GLASS} rounded-[28px] p-7 mt-8`}>
        <div className="flex items-center gap-2 mb-6">
          <Flag size={15} className="text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Obiettivo</span>
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="font-mono-num text-5xl font-bold text-white">{stats.weight}</span>
            <span className="text-sm ml-1 text-white/70">kg oggi</span>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-full font-mono-num bg-white" style={{ color: T.forest }}>
            {weightDelta} kg
          </div>
        </div>

        <div className="relative h-1.5 rounded-full mb-2 bg-white/20">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white"
            style={{ left: `${trackPct}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono-num text-white/70">
          <span>oggi</span>
          <span>{stats.target} kg obiettivo</span>
        </div>
      </div>

      <div className={`${GLASS} rounded-[28px] p-7 mt-6`}>
        <div className="grid grid-cols-3 gap-4">
          <Ring value={stats.weight} max={stats.weight + 5} icon={Scale} label="Peso" sub="kg" />
          <Ring value={stats.water} max={stats.waterTarget} icon={Droplet} label="Acqua" sub={`/ ${stats.waterTarget}`} />
          <Ring value={stats.calories} max={stats.calorieTarget} icon={Flame} label="Calorie" sub={`/ ${stats.calorieTarget}`} />
        </div>
      </div>

      <div className={`${GLASS} rounded-[28px] p-6 mt-6 flex items-center gap-4`}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-white/20 border border-white/25">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-white/70">BMI</p>
          <p className="font-mono-num text-2xl font-bold text-white">{stats.bmi}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className={`${GLASS} rounded-[28px] p-6`}>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ color: T.cream }}>Obiettivi</h2>

          <p className="mb-2 text-sm text-white/70">Peso</p>
          <div className="w-full rounded-full h-2 mb-6 bg-white/20">
            <div className="h-2 rounded-full bg-white" style={{ width: `${Math.round((stats.target / stats.weight) * 100)}%` }} />
          </div>

          <p className="mb-2 text-sm text-white/70">Acqua</p>
          <div className="w-full rounded-full h-2 mb-6 bg-white/20">
            <div className="h-2 rounded-full bg-white" style={{ width: `${Math.round((stats.water / stats.waterTarget) * 100)}%` }} />
          </div>

          <p className="mb-2 text-sm text-white/70">Calorie</p>
          <div className="w-full rounded-full h-2 bg-white/20">
            <div className="h-2 rounded-full bg-white" style={{ width: `${Math.round((stats.calories / stats.calorieTarget) * 100)}%` }} />
          </div>
        </div>

        <div className={`${GLASS} rounded-[28px] p-6`}>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ color: T.cream }}>Misure corporee</h2>

          <div className="space-y-4 text-white">
            <div className="flex justify-between"><span>Vita</span><strong className="font-mono-num">{stats.waist} cm</strong></div>
            <div className="flex justify-between"><span>Torace</span><strong className="font-mono-num">{stats.chest} cm</strong></div>
            <div className="flex justify-between"><span>Fianchi</span><strong className="font-mono-num">{stats.hips} cm</strong></div>
          </div>

          <PrimaryButton className="mt-8 w-full">Aggiorna misure</PrimaryButton>
        </div>
      </div>
    </Page>
  );
}
