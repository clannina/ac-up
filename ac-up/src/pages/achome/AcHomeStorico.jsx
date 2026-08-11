import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getSpese, getEntrate } from "../../lib/acHome";

const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";
const MESI_LABEL = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export default function AcHomeStorico() {
  const [spese, setSpese] = useState([]);
  const [entrate, setEntrate] = useState([]);
  const [anno, setAnno] = useState(new Date().getFullYear());
  const [meseEspanso, setMeseEspanso] = useState(null);
  const [caricato, setCaricato] = useState(false);

  useEffect(() => {
    Promise.all([getSpese({}), getEntrate()]).then(([s, e]) => {
      setSpese(s);
      setEntrate(e);
      setCaricato(true);
    });
  }, []);

  const anniDisponibili = useMemo(() => {
    const anni = new Set([new Date().getFullYear()]);
    spese.forEach((s) => anni.add(new Date(s.data).getFullYear()));
    entrate.forEach((e) => anni.add(new Date(e.data).getFullYear()));
    return Array.from(anni).sort((a, b) => b - a);
  }, [spese, entrate]);

  const speseAnno = useMemo(() => spese.filter((s) => new Date(s.data).getFullYear() === anno), [spese, anno]);
  const entrateAnno = useMemo(() => entrate.filter((e) => new Date(e.data).getFullYear() === anno), [entrate, anno]);

  // Dati per il grafico: totale spese ed entrate per ciascuno dei 12 mesi dell'anno selezionato
  const datiGrafico = useMemo(() => {
    return MESI_LABEL.map((label, i) => {
      const speseDelMeseCorrente = speseAnno.filter((s) => new Date(s.data).getMonth() === i);
      const speseAnna = speseDelMeseCorrente.filter((s) => s.persona === "Anna").reduce((t, s) => t + Number(s.importo), 0);
      const speseVanna = speseDelMeseCorrente.filter((s) => s.persona === "Vanna").reduce((t, s) => t + Number(s.importo), 0);
      const speseAltro = speseDelMeseCorrente.filter((s) => s.persona !== "Anna" && s.persona !== "Vanna").reduce((t, s) => t + Number(s.importo), 0);
      const entrateMese = entrateAnno.filter((e) => new Date(e.data).getMonth() === i).reduce((t, e) => t + Number(e.importo), 0);
      return {
        mese: label,
        Entrate: Math.round(entrateMese),
        "Spese Anna": Math.round(speseAnna),
        "Spese Vanna": Math.round(speseVanna),
        "Altre spese": Math.round(speseAltro),
      };
    });
  }, [speseAnno, entrateAnno]);

  const totaleSpeseAnno = speseAnno.reduce((t, s) => t + Number(s.importo), 0);
  const totaleEntrateAnno = entrateAnno.reduce((t, e) => t + Number(e.importo), 0);
  const risparmioAnno = totaleEntrateAnno - totaleSpeseAnno;

  // Classifica categorie che pesano di piu' nell'anno, con media mensile
  const classificaCategorie = useMemo(() => {
    const mappa = {};
    speseAnno.forEach((s) => {
      const nome = s.ac_home_categorie?.nome || "Senza categoria";
      const gruppo = s.ac_home_categorie?.gruppo || "";
      const chiave = `${gruppo}__${nome}`;
      if (!mappa[chiave]) mappa[chiave] = { nome, gruppo, totale: 0 };
      mappa[chiave].totale += Number(s.importo);
    });
    return Object.values(mappa).sort((a, b) => b.totale - a.totale);
  }, [speseAnno]);

  // Chi spende cosa: totale annuale per persona
  const totalePerPersona = useMemo(() => {
    const mappa = { Anna: 0, Vanna: 0, "Non specificato": 0 };
    speseAnno.forEach((s) => {
      const chiave = s.persona || "Non specificato";
      mappa[chiave] = (mappa[chiave] || 0) + Number(s.importo);
    });
    return mappa;
  }, [speseAnno]);

  function speseDelMese(indiceMese) {
    return speseAnno
      .filter((s) => new Date(s.data).getMonth() === indiceMese)
      .reduce((acc, s) => {
        const nome = s.ac_home_categorie?.nome || "Senza categoria";
        acc[nome] = (acc[nome] || 0) + Number(s.importo);
        return acc;
      }, {});
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Storico</h1>

      {/* Selettore anno */}
      <div className="flex gap-2 mb-5">
        {anniDisponibili.map((a) => (
          <button
            key={a}
            onClick={() => setAnno(a)}
            className="px-4 py-2 rounded-2xl text-sm font-medium font-mono-num"
            style={anno === a ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            {a}
          </button>
        ))}
      </div>

      {!caricato ? (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>Carico lo storico...</p>
      ) : (
        <>
          {/* Riepilogo annuale */}
          <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} color="#fff" />
              <p className="font-display text-sm" style={{ color: "#fff" }}>Bilancio {anno}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>Entrate</p>
                <p className="font-mono-num text-base" style={{ color: "#fff" }}>€ {totaleEntrateAnno.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>Spese</p>
                <p className="font-mono-num text-base" style={{ color: "#fff" }}>€ {totaleSpeseAnno.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>Risparmio</p>
                <p className="font-mono-num text-base" style={{ color: risparmioAnno >= 0 ? "#fff" : "#ffd0d0" }}>€ {risparmioAnno.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Chi spende cosa */}
          <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
            <p className="font-display text-sm mb-3" style={{ color: "#fff" }}>Chi spende cosa</p>
            <div className="flex gap-2">
              {["Anna", "Vanna"].map((p) => (
                <div key={p} className="flex-1 rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{p}</p>
                  <p className="font-mono-num text-lg" style={{ color: "#fff" }}>€ {totalePerPersona[p].toFixed(0)}</p>
                </div>
              ))}
            </div>
            {totalePerPersona["Non specificato"] > 0 && (
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                € {totalePerPersona["Non specificato"].toFixed(0)} senza persona indicata
              </p>
            )}
          </div>

          {/* Grafico andamento mensile */}
          <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
            <p className="font-display text-sm mb-3" style={{ color: "#fff" }}>Andamento mensile</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={datiGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis dataKey="mese" tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "rgba(20,50,60,0.9)", border: "none", borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#fff" }} />
                  <Bar dataKey="Entrate" fill="#8ee6c9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spese Anna" fill="#e07a7a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spese Vanna" fill="#f2c14e" radius={[4, 4, 0, 0]} />
                  {totalePerPersona["Non specificato"] > 0 && (
                    <Bar dataKey="Altre spese" fill="rgba(255,255,255,0.5)" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Classifica categorie */}
          <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Cosa pesa di più nell'anno</h2>
          <div className="flex flex-col gap-2 mb-6">
            {classificaCategorie.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna spesa registrata in questo anno.</p>}
            {classificaCategorie.slice(0, 10).map((c, i) => (
              <div key={c.nome + c.gruppo} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-xs opacity-60" style={{ color: "#fff" }}>#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#fff" }}>{c.nome}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>media € {(c.totale / 12).toFixed(0)}/mese</p>
                  </div>
                </div>
                <p className="font-mono-num font-semibold" style={{ color: "#fff" }}>€ {c.totale.toFixed(0)}</p>
              </div>
            ))}
          </div>

          {/* Registro mese per mese */}
          <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Registro mensile</h2>
          <div className="flex flex-col gap-2">
            {MESI_LABEL.map((label, i) => {
              const totaleMese = speseAnno.filter((s) => new Date(s.data).getMonth() === i).reduce((t, s) => t + Number(s.importo), 0);
              const espanso = meseEspanso === i;
              const dettaglio = espanso ? Object.entries(speseDelMese(i)).sort((a, b) => b[1] - a[1]) : [];
              return (
                <div key={label} className={`${GLASS} rounded-2xl overflow-hidden`}>
                  <button
                    onClick={() => setMeseEspanso(espanso ? null : i)}
                    className="w-full flex justify-between items-center px-4 py-3"
                  >
                    <p className="text-sm font-medium" style={{ color: "#fff" }}>{label} {anno}</p>
                    <p className="font-mono-num text-sm" style={{ color: "#fff" }}>€ {totaleMese.toFixed(0)}</p>
                  </button>
                  {espanso && (
                    <div className="px-4 pb-3 flex flex-col gap-1">
                      {dettaglio.length === 0 && <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Nessuna spesa questo mese.</p>}
                      {dettaglio.map(([nome, tot]) => (
                        <div key={nome} className="flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                          <span>{nome}</span>
                          <span className="font-mono-num">€ {tot.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
