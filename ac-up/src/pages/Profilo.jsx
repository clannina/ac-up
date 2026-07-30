import { useState } from "react";
import { Flag } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";

export default function Profilo() {
  const { session, profile: authProfile, signOut } = useAuth();

  const [profile, setProfile] = useState({
    name: authProfile?.display_name || session?.user?.email?.split("@")[0] || "",
    email: session?.user?.email ?? "",
    weight: 98,
    target: 75,
    calories: 1900,
    water: 8,
  });

  const weightDelta = -0.8;
  const span = 30;
  const distance = Number(profile.weight) - Number(profile.target);
  const trackPct = Math.max(4, Math.min(96, 100 - (distance / span) * 100));

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

      {/* Obiettivo — spostata qui da Home, identica a come appariva */}
      <div className={`${GLASS} rounded-[28px] p-7 mt-8`}>
        <div className="flex items-center gap-2 mb-6">
          <Flag size={15} className="text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Obiettivo</span>
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="font-mono-num text-5xl font-bold text-white">{profile.weight}</span>
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
          <span>{profile.target} kg obiettivo</span>
        </div>
      </div>

      <div className={`${GLASS} rounded-[28px] p-8 mt-6 space-y-6`}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">Nome</label>
            <input type="text" name="name" value={profile.name} onChange={update} className="w-full rounded-xl px-4 py-3 outline-none" style={inputStyle} />
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

        <div className="flex justify-end gap-4 pt-4">
          <button className="px-6 py-3 rounded-xl transition hover:bg-white/10 text-white" style={{ border: "1px solid rgba(255,255,255,0.3)" }}>
            Annulla
          </button>
          <PrimaryButton className="px-6 py-3">Salva profilo</PrimaryButton>
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
