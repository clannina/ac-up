import { useState } from "react";
import { Scale, Droplet, Flame, Activity } from "lucide-react";
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

  return (
    <Page>
      <SectionTitle className="text-3xl">Salute</SectionTitle>
      <p className="mt-2" style={{ color: T.stone }}>Monitora i tuoi progressi.</p>

      {/* Anelli — peso/acqua/calorie, come previsto dal Design System */}
      <div className={`${GLASS} rounded-2xl p-7 mt-8`}>
        <div className="grid grid-cols-3 gap-4">
          <Ring value={stats.weight} max={stats.weight + 5} color={T.sage} label="Peso" sub="kg" icon={Scale} />
          <Ring value={stats.water} max={stats.waterTarget} color={T.protein} label="Acqua" sub={`/ ${stats.waterTarget} bicchieri`} icon={Droplet} />
          <Ring value={stats.calories} max={stats.calorieTarget} color={T.carbs} label="Calorie" sub={`/ ${stats.calorieTarget} kcal`} icon={Flame} />
        </div>
      </div>

      {/* BMI */}
      <div className={`${GLASS} rounded-2xl p-6 mt-6 flex items-center gap-4`}>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${T.protein}22` }}>
          <Activity size={20} style={{ color: T.protein }} />
        </div>
        <div>
          <p className="text-sm" style={{ color: T.stone }}>BMI</p>
          <p className="font-mono-num text-2xl font-bold" style={{ color: T.ink }}>{stats.bmi}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className={`${GLASS} rounded-2xl p-6`}>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ color: T.coral }}>Obiettivi</h2>

          <p className="mb-2 text-sm" style={{ color: T.stone }}>Peso</p>
          <div className="w-full rounded-full h-2 mb-6" style={{ background: T.mist }}>
            <div className="h-2 rounded-full" style={{ width: `${Math.round((stats.target / stats.weight) * 100)}%`, background: T.sage }} />
          </div>

          <p className="mb-2 text-sm" style={{ color: T.stone }}>Acqua</p>
          <div className="w-full rounded-full h-2 mb-6" style={{ background: T.mist }}>
            <div className="h-2 rounded-full" style={{ width: `${Math.round((stats.water / stats.waterTarget) * 100)}%`, background: T.protein }} />
          </div>

          <p className="mb-2 text-sm" style={{ color: T.stone }}>Calorie</p>
          <div className="w-full rounded-full h-2" style={{ background: T.mist }}>
            <div className="h-2 rounded-full" style={{ width: `${Math.round((stats.calories / stats.calorieTarget) * 100)}%`, background: T.carbs }} />
          </div>
        </div>

        <div className={`${GLASS} rounded-2xl p-6`}>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ color: T.coral }}>Misure corporee</h2>

          <div className="space-y-4">
            <div className="flex justify-between" style={{ color: T.ink }}>
              <span>Vita</span><strong className="font-mono-num">{stats.waist} cm</strong>
            </div>
            <div className="flex justify-between" style={{ color: T.ink }}>
              <span>Torace</span><strong className="font-mono-num">{stats.chest} cm</strong>
            </div>
            <div className="flex justify-between" style={{ color: T.ink }}>
              <span>Fianchi</span><strong className="font-mono-num">{stats.hips} cm</strong>
            </div>
          </div>

          <PrimaryButton className="mt-8 w-full">Aggiorna misure</PrimaryButton>
        </div>
      </div>
    </Page>
  );
}
