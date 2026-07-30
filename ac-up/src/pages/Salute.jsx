import { useEffect, useState } from "react";
import { Scale, Droplet, Flame, Activity, Flag, HeartPulse, CalendarHeart, Loader2, Check, Pencil, Trash2, X } from "lucide-react";
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

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// La durata del ciclo si calcola da sola dalla distanza tra gli inizi
// registrati; con un solo ciclo in storico si usa una stima di base (28gg).
function averageCycleLength(history) {
  if (!history || history.length < 2) return 28;
  const sorted = [...history].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(daysBetween(sorted[i - 1].start_date, sorted[i].start_date));
  }
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
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
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
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
  const [bpHistory, setBpHistory] = useState([]);
  const [bpForm, setBpForm] = useState({ systolic: "", diastolic: "", pulse: "" });
  const [editingBpId, setEditingBpId] = useState(null);
  const [savingBP, setSavingBP] = useState(false);
  const [bpSaved, setBpSaved] = useState(false);

  // ---------- Ciclo mestruale ----------
  const [cycleHistory, setCycleHistory] = useState([]);
  const [cycleForm, setCycleForm] = useState({ start_date: "", end_date: "" });
  const [editingCycleId, setEditingCycleId] = useState(null);
  const [savingCycle, setSavingCycle] = useState(false);
  const [cycleSaved, setCycleSaved] = useState(false);

  const loadBpHistory = async () => {
    if (!supabase || !session?.user?.id) return;
    const { data } = await supabase
      .from("blood_pressure_logs")
      .select("*")
      .eq("profile_id", session.user.id)
      .order("log_date", { ascending: false })
      .limit(20);
    setBpHistory(data ?? []);
  };

  const loadCycleHistory = async () => {
    if (!supabase || !session?.user?.id) return;
    const { data } = await supabase
      .from("cycle_logs")
      .select("*")
      .eq("profile_id", session.user.id)
      .order("start_date", { ascending: false })
      .limit(20);
    setCycleHistory(data ?? []);
  };

  useEffect(() => {
    loadBpHistory();
    loadCycleHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const startEditBp = (entry) => {
    setEditingBpId(entry.id);
    setBpForm({ systolic: entry.systolic, diastolic: entry.diastolic, pulse: entry.pulse ?? "" });
  };
  const cancelEditBp = () => {
    setEditingBpId(null);
    setBpForm({ systolic: "", diastolic: "", pulse: "" });
  };

  const saveBP = async () => {
    const systolic = Number(bpForm.systolic);
    const diastolic = Number(bpForm.diastolic);
    if (!systolic || !diastolic || !supabase || !session?.user?.id) return;
    setSavingBP(true);

    const payload = {
      systolic,
      diastolic,
      pulse: bpForm.pulse ? Number(bpForm.pulse) : null,
    };

    const { error } = editingBpId
      ? await supabase.from("blood_pressure_logs").update(payload).eq("id", editingBpId)
      : await supabase.from("blood_pressure_logs").insert({ ...payload, profile_id: session.user.id });

    setSavingBP(false);
    if (!error) {
      await loadBpHistory();
      setBpForm({ systolic: "", diastolic: "", pulse: "" });
      setEditingBpId(null);
      setBpSaved(true);
      setTimeout(() => setBpSaved(false), 2500);
    }
  };

  const deleteBp = async (id) => {
    if (!supabase || !window.confirm("Eliminare questa misurazione?")) return;
    await supabase.from("blood_pressure_logs").delete().eq("id", id);
    if (editingBpId === id) cancelEditBp();
    loadBpHistory();
  };

  const startEditCycle = (entry) => {
    setEditingCycleId(entry.id);
    setCycleForm({ start_date: entry.start_date, end_date: entry.end_date ?? "" });
  };
  const cancelEditCycle = () => {
    setEditingCycleId(null);
    setCycleForm({ start_date: "", end_date: "" });
  };

  const saveCycle = async () => {
    if (!cycleForm.start_date || !supabase || !session?.user?.id) return;
    setSavingCycle(true);

    const payload = {
      start_date: cycleForm.start_date,
      end_date: cycleForm.end_date || null,
    };

    const { error } = editingCycleId
      ? await supabase.from("cycle_logs").update(payload).eq("id", editingCycleId)
      : await supabase.from("cycle_logs").insert({ ...payload, profile_id: session.user.id });

    setSavingCycle(false);
    if (!error) {
      await loadCycleHistory();
      setCycleForm({ start_date: "", end_date: "" });
      setEditingCycleId(null);
      setCycleSaved(true);
      setTimeout(() => setCycleSaved(false), 2500);
    }
  };

  const deleteCycle = async (id) => {
    if (!supabase || !window.confirm("Eliminare questo ciclo dallo storico?")) return;
    await supabase.from("cycle_logs").delete().eq("id", id);
    if (editingCycleId === id) cancelEditCycle();
    loadCycleHistory();
  };

  const latestBP = bpHistory[0] ?? null;
  const bpCat = latestBP ? pressureCategory(latestBP.systolic, latestBP.diastolic) : null;

  const latestCycle = cycleHistory[0] ?? null;
  const avgCycleLength = averageCycleLength(cycleHistory);
  const cInfo = latestCycle ? cycleInfo(latestCycle.start_date, avgCycleLength) : null;

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
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white" style={{ color: bpCat.color }}>
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
            {savingBP && <Loader2 size={14} className="animate-spin" />} {editingBpId ? "Salva modifica" : "Registra"}
          </PrimaryButton>
          {editingBpId && (
            <button onClick={cancelEditBp} className="flex items-center gap-1.5 text-sm text-white/70">
              <X size={14} /> Annulla
            </button>
          )}
          {bpSaved && (
            <span className="flex items-center gap-1.5 text-sm text-white">
              <Check size={15} /> Salvato
            </span>
          )}
        </div>

        <p className="text-xs text-white/50 mt-4 mb-2">
          Valori puramente indicativi, non sostituiscono il parere del tuo medico.
        </p>

        {bpHistory.length > 0 && (
          <div className="mt-5 pt-5 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Storico</p>
            {bpHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-white/60 text-xs">{formatDate(entry.log_date)}</span>
                  <span className="font-mono-num text-white font-semibold">{entry.systolic}/{entry.diastolic}</span>
                  {entry.pulse && <span className="font-mono-num text-white/50 text-xs">{entry.pulse} bpm</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEditBp(entry)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15">
                    <Pencil size={13} className="text-white/70" />
                  </button>
                  <button onClick={() => deleteBp(entry.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15">
                    <Trash2 size={13} className="text-white/70" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <p className="col-span-2 text-xs text-white/50 -mt-2">
              Durata media calcolata dallo storico: <span className="font-mono-num">{avgCycleLength}</span> giorni
            </p>
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
            <label className="block text-xs text-white/60 mb-1.5">Data inizio</label>
            <input
              type="date"
              value={cycleForm.start_date}
              onChange={(e) => setCycleForm((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 outline-none font-mono-num text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1.5">Data fine (facoltativa)</label>
            <input
              type="date"
              value={cycleForm.end_date}
              onChange={(e) => setCycleForm((f) => ({ ...f, end_date: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 outline-none font-mono-num text-sm"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <PrimaryButton onClick={saveCycle} disabled={savingCycle} className="flex items-center gap-2 text-sm px-5 py-2.5">
            {savingCycle && <Loader2 size={14} className="animate-spin" />} {editingCycleId ? "Salva modifica" : "Registra"}
          </PrimaryButton>
          {editingCycleId && (
            <button onClick={cancelEditCycle} className="flex items-center gap-1.5 text-sm text-white/70">
              <X size={14} /> Annulla
            </button>
          )}
          {cycleSaved && (
            <span className="flex items-center gap-1.5 text-sm text-white">
              <Check size={15} /> Salvato
            </span>
          )}
        </div>

        <p className="text-xs text-white/50 mt-4 mb-2">
          Stime approssimative basate sullo storico registrato, non un metodo contraccettivo.
        </p>

        {cycleHistory.length > 0 && (
          <div className="mt-5 pt-5 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Storico</p>
            {cycleHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-white font-semibold">{formatDate(entry.start_date)}</span>
                  {entry.end_date && (
                    <span className="font-mono-num text-white/60 text-xs">
                      → {formatDate(entry.end_date)} ({daysBetween(entry.start_date, entry.end_date) + 1}g)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEditCycle(entry)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15">
                    <Pencil size={13} className="text-white/70" />
                  </button>
                  <button onClick={() => deleteCycle(entry.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15">
                    <Trash2 size={13} className="text-white/70" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
