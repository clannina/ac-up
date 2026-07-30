import { useState } from "react";
import { Loader2, Check, Pencil } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../supabaseClient";

export default function Profilo() {
  const { session, profile: authProfile, refreshProfile, signOut } = useAuth();

  const initialProfile = {
    name: authProfile?.display_name || session?.user?.email?.split("@")[0] || "",
    email: session?.user?.email ?? "",
    weight: 98,
    target: 75,
    calories: 1900,
    water: 8,
    preferences: "",
  };

  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [mode, setMode] = useState("view"); // "view" | "edit"

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const startEditing = () => {
    setDraft(profile);
    setSaveError(null);
    setMode("edit");
  };

  const cancelEditing = () => {
    setMode("view");
    setSaveError(null);
  };

  const save = async () => {
    const name = draft.name.trim();
    if (!name) {
      setSaveError("Scegli un nome prima di salvare.");
      return;
    }
    if (!supabase || !session?.user?.id) {
      setSaveError("Non risulti collegato.");
      return;
    }
    setSaving(true);
    setSaveError(null);

    // Per ora su Supabase viene salvato solo il nome: le tabelle non hanno
    // ancora colonne per peso/obiettivo/calorie/acqua/preferenze, quindi
    // quei campi restano solo in questa sessione (si perdono al refresh).
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    await refreshProfile();
    setProfile({ ...draft, name });
    setMode("view");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  const inputStyle = {
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.15)",
    color: "white",
  };

  const Field = ({ label, name, type = "text" }) => (
    <div>
      <label className="block text-sm font-medium mb-2 text-white/70">{label}</label>
      <input
        type={type}
        name={name}
        value={draft[name]}
        onChange={update}
        className="w-full rounded-xl px-4 py-3 outline-none font-mono-num placeholder-white/50"
        style={inputStyle}
      />
    </div>
  );

  const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
      <span className="text-sm text-white/70">{label}</span>
      <span className="font-mono-num font-semibold text-white text-right">{value}</span>
    </div>
  );

  return (
    <Page maxWidth="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle className="text-3xl">Profilo</SectionTitle>
          <p className="mt-2 text-white/70">Gestisci il tuo account e gli obiettivi.</p>
        </div>
        {mode === "view" && (
          <button
            onClick={startEditing}
            className={`${GLASS} flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shrink-0 transition hover:bg-white/25`}
          >
            <Pencil size={15} /> Modifica
          </button>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-1.5 text-sm text-white mt-4">
          <Check size={16} /> Profilo salvato
        </div>
      )}

      {mode === "view" && (
        <div className={`${GLASS} rounded-[28px] p-8 mt-6`}>
          <SummaryRow label="Nome utente" value={profile.name || "—"} />
          <SummaryRow label="Email" value={profile.email || "—"} />
          <SummaryRow label="Peso attuale" value={`${profile.weight} kg`} />
          <SummaryRow label="Obiettivo" value={`${profile.target} kg`} />
          <SummaryRow label="Calorie giornaliere" value={`${profile.calories} kcal`} />
          <SummaryRow label="Obiettivo acqua" value={`${profile.water} bicchieri`} />
          <div className="pt-4">
            <span className="text-sm text-white/70 block mb-1.5">Preferenze alimentari</span>
            <p className="text-white text-sm">
              {profile.preferences?.trim() ? profile.preferences : "Nessuna preferenza indicata."}
            </p>
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div className={`${GLASS} rounded-[28px] p-8 mt-6 space-y-6`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Nome utente</label>
              <input
                type="text"
                name="name"
                value={draft.name}
                onChange={update}
                maxLength={30}
                placeholder="Come vuoi essere chiamato/a"
                className="w-full rounded-xl px-4 py-3 outline-none placeholder-white/50"
                style={inputStyle}
              />
              <p className="text-xs text-white/60 mt-1.5">Compare nel saluto della Home.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Email</label>
              <input type="email" name="email" value={draft.email} onChange={update} className="w-full rounded-xl px-4 py-3 outline-none" style={inputStyle} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Peso attuale (kg)" name="weight" type="number" />
            <Field label="Obiettivo (kg)" name="target" type="number" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Calorie giornaliere" name="calories" type="number" />
            <Field label="Obiettivo acqua (bicchieri)" name="water" type="number" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">Preferenze alimentari</label>
            <textarea
              name="preferences"
              value={draft.preferences}
              onChange={update}
              rows="5"
              className="w-full rounded-xl px-4 py-3 outline-none placeholder-white/50"
              style={inputStyle}
              placeholder="Es. niente pesce spada, salmone solo affumicato o in scatola..."
            />
          </div>

          {saveError && (
            <div className="text-sm rounded-xl p-3 bg-white" style={{ color: T.coral }}>
              {saveError}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              onClick={cancelEditing}
              className="px-6 py-3 rounded-xl transition hover:bg-white/10 text-white"
              style={{ border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Annulla
            </button>
            <PrimaryButton onClick={save} disabled={saving} className="px-6 py-3 flex items-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              Salva profilo
            </PrimaryButton>
          </div>
        </div>
      )}

      <button
        onClick={signOut}
        className="w-full mt-6 py-3 rounded-xl font-semibold transition hover:bg-white/10 text-white"
        style={{ border: "1px solid rgba(255,255,255,0.4)" }}
      >
        Esci
      </button>
    </Page>
  );
}
