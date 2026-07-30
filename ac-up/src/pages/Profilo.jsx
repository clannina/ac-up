import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../supabaseClient";

export default function Profilo() {
  const { session, profile: authProfile, refreshProfile, signOut } = useAuth();

  const [profile, setProfile] = useState({
    name: authProfile?.display_name || session?.user?.email?.split("@")[0] || "",
    email: session?.user?.email ?? "",
    weight: 98,
    target: 75,
    calories: 1900,
    water: 8,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const saveName = async () => {
    const name = profile.name.trim();
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
    setSaved(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
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
        value={profile[name]}
        onChange={update}
        className="w-full rounded-xl px-4 py-3 outline-none font-mono-num placeholder-white/50"
        style={inputStyle}
      />
    </div>
  );

  return (
    <Page maxWidth="max-w-4xl">
      <SectionTitle className="text-3xl">Profilo</SectionTitle>
      <p className="mt-2 text-white/70">Gestisci il tuo account e gli obiettivi.</p>

      <div className={`${GLASS} rounded-[28px] p-8 mt-8 space-y-6`}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">Nome utente</label>
            <input
              type="text"
              name="name"
              value={profile.name}
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
            <input type="email" name="email" value={profile.email} onChange={update} className="w-full rounded-xl px-4 py-3 outline-none" style={inputStyle} />
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
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-white">
              <Check size={16} /> Salvato
            </span>
          )}
          <button className="px-6 py-3 rounded-xl transition hover:bg-white/10 text-white" style={{ border: "1px solid rgba(255,255,255,0.3)" }}>
            Annulla
          </button>
          <PrimaryButton onClick={saveName} disabled={saving} className="px-6 py-3 flex items-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            Salva profilo
          </PrimaryButton>
        </div>
      </div>

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
