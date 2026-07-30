import { useEffect, useState } from "react";
import { Scale, Droplet, Flame, Activity, Flag, HeartPulse, CalendarHeart, Loader2, Check } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, Ring, PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../supabaseClient";

// Categorie informative (non una diagnosi) basate sui riferimenti clinici comuni.
function pressureCategory(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) return { label: "Normale", color: T.sage };
  if (systolic < 130 && diastolic < 80) return { label: "Elevata", color: T.carbs };
  if (systolic < 140 || diastolic < 90) return { label: "Alta (stadio 1)", color: T.coral };
  return { label: "Alta (stadio 2)", color: T.coral };
}

function cycleInfo(startDateStr, cycleLength) {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today - start) / 86400000);
  const cycleDay = (((daysSinceStart % cycleLength) + cycleLength) % cycleLength) + 1;
  const daysUntilNext = cycleLength - cycleDay + 1;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntilNext);
  const ovulationDay = Math.max(1, cycleLength - 14);
  const inFertileWindow = cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1;
  return { cycleDay, daysUntilNext, nextDate, inFertileWindow };
}

function formatDate(d) {
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
}

export default function Salute() {
  const { session } = useAuth();

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

  // ---------- Pressione arteriosa ----------
  const [latestBP, setLatestBP] = useState(null);
  const [bpForm, setBpForm] = useState({ systolic: "", diastolic: "", pulse: "" });
  const [savingBP, setSavingBP] = useState(false);
  const [bpSaved, setBpSaved] = useState(false);

  // ---------- Ciclo mestruale ----------
  const [latestCycle, setLatestCycle] = useState(null);
  const [cycleForm, setCycleForm] = useState({ start_date: "", cycle_length: 28 });
  const [savingCycle, setSavingCycle] = useState(false);
  const [cycleSaved, setCycleSaved] = useState(false);

  useEffect(() => {
    if (!supabase || !session?.user?.id) return;
    (async () => {
      const { data: bp } = await supabase
        .from("blood_pressure_logs")
        .select("*")
        .eq("profile_id", session.user.id)
        .order("log_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (bp) setLatestBP(bp);

      const { data: cycle } = await supabase
        .from("cycle_logs")
        .select("*")
        .eq("profile_id", session.user.id)
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cycle) setLatestCycle(cycle);
    })();
  }, [session?.user?.id]);

  const saveBP = async () => {
    const systolic = Number(bpForm.systolic);
    const diastolic = Number(bpForm.diastolic);
    if (!systolic || !diastolic || !supabase || !session?.user?.id) return;
    setSavingBP(true);
    const { data, error } = await supabase
      .from("blood_pressure_logs")
      .insert({
        profile_id: session.user.id,
        systolic,
        diastolic,
        pulse: bpForm.pulse ? Number(bpForm.pulse) : null,
      })
      .select()
      .single();
    setSavingBP(false);
    if (!error) {
      setLatestBP(data);
      setBpForm({ systolic: "", diastolic: "", pulse: "" });
      setBpSaved(true);
      setTimeout(() => setBpSaved(false), 2500);
    }
  };

  const saveCycle = async () => {
    if (!cycleForm.start_date || !supabase || !session?.user?.id) return;
    setSavingCycle(true);
    const { data, error } = await supabase
      .from("cycle_logs")
      .insert({
        profile_id: session.user.id,
        start_date: cycleForm.start_date,
        cycle_length: Number(cycleForm.cycle_length) || 28,
      })
      .select()
      .single();
    setSavingCycle(false);
    if (!error) {
      setLatestCycle(data);
      setCycleForm({ start_date: "", cycle_length: 28 });
      setCycleSaved(true);
      setTimeout(() => setCycleSaved(false), 2500);
    }
  };

  const bpCat = latestBP ? pressureCategory(latestBP.systolic, latestBP.diastolic) : null;
  const cInfo = latestCycle ? cycleInfo(latestCycle.start_date, latestCycle.cycle_length || 28) : null;

  const inputStyle = {
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.15)",
    color: "white",
  };

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

      {/* Pressione arteriosa */}
      <div className={`${GLASS} rounded-[28px] p-6 mt-6`}>
        <div className="flex items-center gap-2 mb-6">
          <HeartPulse size={16} className="text-white" />
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: T.cream }}>Pressione arteriosa</h2>
        </div>

        {latestBP && (
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="font-mono-num text-4xl font-bold text-white">
                {latestBP.systolic}/{latestBP.diastolic}
              </span>
              <span className="text-sm ml-1 text-white/70">mmHg</span>
              {latestBP.pulse && <p className="text-sm text-white/60 mt-1 font-mono-num">{latestBP.pulse} bpm</p>}
            </div>
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-white"
              style={{ color: bpCat.color }}
            >
              {bpCat.label}
            </span>
          </div>
        )}
        {!latestBP && <p className="text-white/60 mb-6 text-sm">Nessuna misurazione ancora registrata.</p>}

        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Sistolica"
            value={bpForm.systolic}
            onChange={(e) => setBpForm((f) => ({ ...f, systolic: e.target.value }))}
            className="rounded-xl px-3 py-2.5 outline-none font-mono-num placeholder-white/50 text-sm"
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Diastolica"
            value={bpForm.diastolic}
            onChange={(e) => setBpForm((f) => ({ ...f, diastolic: e.target.value }))}
            className="rounded-xl px-3 py-2.5 outline-none font-mono-num placeholder-white/50 text-sm"
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Battiti"
            value={bpForm.pulse}
            onChange={(e) => setBpForm((f) => ({ ...f, pulse: e.target.value }))}
            className="rounded-xl px-3 py-2.5 outline-none font-mono-num placeholder-white/50 text-sm"
            style={inputStyle}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <PrimaryButton onClick={saveBP} disabled={savingBP} className="flex items-center gap-2 text-sm px-5 py-2.5">
            {savingBP && <Loader2 size={14} className="animate-spin" />} Registra
          </PrimaryButton>
          {bpSaved && (
            <span className="flex items-center gap-1.5 text-sm text-white">
              <Check size={15} /> Salvato
            </span>
          )}
        </div>

        <p className="text-xs text-white/50 mt-4">
          Valori puramente indicativi, non sostituiscono il parere del tuo medico.
        </p>
      </div>

      {/* Ciclo mestruale */}
      <div className={`${GLASS} rounded-[28px] p-6 mt-6`}>
        <div className="flex items-center gap-2 mb-6">
          <CalendarHeart size={16} className="text-white" />
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: T.cream }}>Ciclo mestruale</h2>
        </div>

        {cInfo && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-white/70">Giorno del ciclo</p>
              <p className="font-mono-num text-3xl font-bold text-white">{cInfo.cycleDay}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Prossimo ciclo previsto</p>
              <p className="font-semibold text-white mt-1">
                {formatDate(cInfo.nextDate)} <span className="font-mono-num text-white/70 text-sm">(tra {cInfo.daysUntilNext}g)</span>
              </p>
            </div>
            {cInfo.inFertileWindow && (
              <div className="col-span-2 text-xs font-semibold px-3 py-2 rounded-xl w-fit bg-white" style={{ color: T.coral }}>
                Probabile finestra fertile
              </div>
            )}
          </div>
        )}
        {!cInfo && <p className="text-white/60 mb-6 text-sm">Nessun ciclo ancora registrato.</p>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/60 mb-1.5">Data inizio ultimo ciclo</label>
            <input
              type="date"
              value={cycleForm.start_date}
              onChange={(e) => setCycleForm((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 outline-none font-mono-num text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1.5">Durata media ciclo (giorni)</label>
            <input
              type="number"
              value={cycleForm.cycle_length}
              onChange={(e) => setCycleForm((f) => ({ ...f, cycle_length: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 outline-none font-mono-num text-sm"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <PrimaryButton onClick={saveCycle} disabled={savingCycle} className="flex items-center gap-2 text-sm px-5 py-2.5">
            {savingCycle && <Loader2 size={14} className="animate-spin" />} Registra
          </PrimaryButton>
          {cycleSaved && (
            <span className="flex items-center gap-1.5 text-sm text-white">
              <Check size={15} /> Salvato
            </span>
          )}
        </div>

        <p className="text-xs text-white/50 mt-4">
          Stime approssimative basate sulla durata media del ciclo, non un metodo contraccettivo.
        </p>
      </div>
    </Page>
  );
}
