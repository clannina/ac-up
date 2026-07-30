import { useState } from "react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";

export default function Profilo() {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState({
    name: "Anna",
    email: session?.user?.email ?? "",
    weight: 98,
    target: 75,
    calories: 1900,
    water: 8,
  });

  const update = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const inputStyle = {
    border: `1px solid ${T.mist}`,
    background: "rgba(255,255,255,0.7)",
  };

  const Field = ({ label, name, type = "text" }) => (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: T.stone }}>{label}</label>
      <input
        type={type}
        name={name}
        value={profile[name]}
        onChange={update}
        className="w-full rounded-xl px-4 py-3 outline-none font-mono-num"
        style={inputStyle}
      />
    </div>
  );

  return (
    <Page maxWidth="max-w-4xl">
      <SectionTitle className="text-3xl">Profilo</SectionTitle>
      <p className="mt-2" style={{ color: T.stone }}>Gestisci il tuo account e gli obiettivi.</p>

      <div className={`${GLASS} rounded-2xl p-8 mt-8 space-y-6`}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: T.stone }}>Nome</label>
            <input
              type="text" name="name" value={profile.name} onChange={update}
              className="w-full rounded-xl px-4 py-3 outline-none" style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: T.stone }}>Email</label>
            <input
              type="email" name="email" value={profile.email} onChange={update}
              className="w-full rounded-xl px-4 py-3 outline-none" style={inputStyle}
            />
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
          <label className="block text-sm font-medium mb-2" style={{ color: T.stone }}>Preferenze alimentari</label>
          <textarea
            rows="5"
            className="w-full rounded-xl px-4 py-3 outline-none"
            style={inputStyle}
            placeholder="Es. niente pesce spada, salmone solo affumicato o in scatola..."
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            className="px-6 py-3 rounded-xl transition hover:bg-white/50"
            style={{ border: `1px solid ${T.mist}`, color: T.ink }}
          >
            Annulla
          </button>
          <PrimaryButton className="px-6 py-3">Salva profilo</PrimaryButton>
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full mt-6 py-3 rounded-xl font-semibold transition hover:bg-white/50"
        style={{ border: `1px solid ${T.coral}`, color: T.coral }}
      >
        Esci
      </button>
    </Page>
  );
}
