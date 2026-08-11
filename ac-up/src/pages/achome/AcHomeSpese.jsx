import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Home as HomeIcon, Car, Bike, HeartPulse } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getCategorie, creaCategoria, getSpese, creaSpesa, aggiornaSpesa, eliminaSpesa, registraRimborso, segnaRimborsoCompleto, azzeraRimborso, caricaFotoScontrino, getTotaleGenerale } from "../../lib/acHome";
import PersonaSelector, { getPersonaPredefinita } from "../../components/PersonaSelector.jsx";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
  { id: "mediche", label: "Spese mediche", icon: HeartPulse },
];

const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();
const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";

export default function AcHomeSpese() {
  const [searchParams] = useSearchParams();
  const [gruppo, setGruppo] = useState(searchParams.get("gruppo") || "casa");
  const [categorie, setCategorie] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [nuovaCategoria, setNuovaCategoria] = useState("");
  const [importo, setImporto] = useState("");
  const [data, setData] = useState(() => oggi.toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const [foto, setFoto] = useState(null);
  const [spese, setSpese] = useState([]);
  const [totaleGenerale, setTotaleGenerale] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [persona, setPersona] = useState(getPersonaPredefinita());
  const [condivisa, setCondivisa] = useState(false);
  const [rimborsato, setRimborsato] = useState(false);
  const [importoParziale, setImportoParziale] = useState({});
  const [filtroStorico, setFiltroStorico] = useState(null);
  const [storico, setStorico] = useState([]);
  const [caricandoStorico, setCaricandoStorico] = useState(false);

  useEffect(() => {
    caricaCategorie();
    caricaSpese();
    caricaTotaleGenerale();
    setFiltroStorico(null);
    setStorico([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gruppo]);

  async function caricaCategorie() {
    const cats = await getCategorie(gruppo);
    setCategorie(cats);
    if (!editingId) setCategoriaId(cats[0]?.id || "");
  }

  async function caricaSpese() {
    const lista = await getSpese({ mese: MESE_CORRENTE, anno: ANNO_CORRENTE, gruppo });
    setSpese(lista);
  }

  async function caricaTotaleGenerale() {
    const tot = await getTotaleGenerale(gruppo);
    setTotaleGenerale(tot);
  }

  async function handleNuovaCategoria() {
    if (!nuovaCategoria.trim()) return;
    const cat = await creaCategoria(gruppo, nuovaCategoria.trim());
    setNuovaCategoria("");
    const cats = await getCategorie(gruppo);
    setCategorie(cats);
    setCategoriaId(cat.id);
  }

  function handleModifica(s) {
    setEditingId(s.id);
    setCategoriaId(s.categoria_id);
    setImporto(String(s.importo));
    setData(s.data);
    setNota(s.nota || "");
    setFoto(null);
    setPersona(s.persona || getPersonaPredefinita());
    setCondivisa(!!s.condivisa);
    setRimborsato(!!s.rimborsato);
    setErrore(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annullaModifica() {
    setEditingId(null);
    setImporto("");
    setNota("");
    setFoto(null);
    setData(oggi.toISOString().slice(0, 10));
    setPersona(getPersonaPredefinita());
    setCondivisa(false);
    setRimborsato(false);
    setErrore(null);
  }

  async function handleSalva(e) {
    e.preventDefault();
    setErrore(null);
    if (!categoriaId || !importo || !data) {
      setErrore("Categoria, importo e data sono obbligatori.");
      return;
    }
    setSalvando(true);
    try {
      let foto_url = null;
      if (foto) foto_url = await caricaFotoScontrino(foto);

      if (editingId) {
        await aggiornaSpesa(editingId, { categoria_id: categoriaId, importo: parseFloat(importo), data, nota, foto_url, persona, condivisa, rimborsato });
        setEditingId(null);
      } else {
        await creaSpesa({ categoria_id: categoriaId, importo: parseFloat(importo), data, nota, foto_url, persona, condivisa, rimborsato: false });
      }

      setImporto("");
      setNota("");
      setFoto(null);
      setCondivisa(false);
      caricaSpese();
      caricaTotaleGenerale();
      if (filtroStorico) caricaStorico(filtroStorico);
    } catch (err) {
      setErrore("Errore nel salvataggio: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleElimina(id) {
    await eliminaSpesa(id);
    if (editingId === id) annullaModifica();
    caricaSpese();
    caricaTotaleGenerale();
    if (filtroStorico) caricaStorico(filtroStorico);
  }

  async function handleRegistraParziale(s) {
    const valore = parseFloat(importoParziale[s.id]);
    if (!valore || valore <= 0) return;
    await registraRimborso(s.id, valore);
    setImportoParziale((prev) => ({ ...prev, [s.id]: "" }));
    caricaSpese();
  }

  async function handleSegnaCompleto(s) {
    await segnaRimborsoCompleto(s.id, s.importo);
    caricaSpese();
  }

  async function handleAzzeraRimborso(s) {
    await azzeraRimborso(s.id);
    caricaSpese();
  }

  async function caricaStorico(periodo) {
    setFiltroStorico(periodo);
    setCaricandoStorico(true);
    try {
      const tutte = await getSpese({ gruppo }); // tutte le spese del gruppo, senza filtro di mese

      const oggiData = new Date();
      const primoGiornoMeseCorrente = new Date(oggiData.getFullYear(), oggiData.getMonth(), 1);
      const fine = new Date(primoGiornoMeseCorrente.getTime() - 1); // ultimo giorno del mese precedente

      let inizio;
      if (periodo === "precedente") {
        inizio = new Date(fine.getFullYear(), fine.getMonth(), 1);
      } else if (periodo === "3mesi") {
        inizio = new Date(fine.getFullYear(), fine.getMonth() - 2, 1);
      } else {
        inizio = new Date(fine.getFullYear(), fine.getMonth() - 11, 1);
      }

      const filtrate = tutte.filter((s) => {
        const d = new Date(s.data);
        return d >= inizio && d <= fine;
      });

      const gruppi = {};
      filtrate.forEach((s) => {
        const d = new Date(s.data);
        const chiave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!gruppi[chiave]) {
          gruppi[chiave] = { chiave, label: d.toLocaleDateString("it-IT", { month: "long", year: "numeric" }), spese: [], totale: 0 };
        }
        gruppi[chiave].spese.push(s);
        gruppi[chiave].totale += Number(s.importo);
      });

      setStorico(Object.values(gruppi).sort((a, b) => b.chiave.localeCompare(a.chiave)));
    } finally {
      setCaricandoStorico(false);
    }
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Spese</h1>

      <div className="flex gap-2 mb-5">
        {GRUPPI.map((g) => {
          const Icon = g.icon;
          const attivo = gruppo === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGruppo(g.id)}
              className="flex-1 py-2 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5"
              style={attivo ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              <Icon size={16} /> {g.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSalva} className={`${GLASS} rounded-3xl p-4 mb-5`}>
        {editingId && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-display" style={{ color: "#fff" }}>Stai modificando una spesa</p>
            <button type="button" onClick={annullaModifica} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              Annulla
            </button>
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Sottocategoria</label>
        <div className="flex gap-2 mb-3">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 text-sm"
            style={{ background: "#fff" }}
          >
            {categorie.length === 0 && <option value="">Nessuna categoria</option>}
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            value={nuovaCategoria}
            onChange={(e) => setNuovaCategoria(e.target.value)}
            placeholder="Nuova sottocategoria..."
            className="flex-1 rounded-xl px-3 py-2 text-sm"
            style={{ background: "#fff" }}
          />
          <button type="button" onClick={handleNuovaCategoria} className="px-3 rounded-xl text-sm font-display" style={{ background: T.forest, color: "#fff" }}>
            +
          </button>
        </div>

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Importo (€)</label>
        <input
          type="number"
          step="0.01"
          value={importo}
          onChange={(e) => setImporto(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Nota (opzionale)</label>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="es. tagliando scooter"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Foto scontrino (opzionale)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
          className="w-full text-sm mb-3"
          style={{ color: "#fff" }}
        />

        <PersonaSelector value={persona} onChange={setPersona} />

        <button
          type="button"
          onClick={() => setCondivisa((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm mb-3"
          style={{ background: condivisa ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.2)", color: condivisa ? T.forest : "#fff" }}
        >
          <span>Spesa condivisa con l'altra persona (50/50)</span>
          <span
            className="w-9 h-5 rounded-full relative flex-shrink-0 ml-2"
            style={{ background: condivisa ? T.forest : "rgba(255,255,255,0.4)" }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: condivisa ? "18px" : "2px" }}
            />
          </span>
        </button>

        {errore && <p className="text-xs text-red-100 mb-2">{errore}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="w-full py-2.5 rounded-xl font-display text-sm"
          style={{ background: T.forest, color: "#fff", opacity: salvando ? 0.6 : 1 }}
        >
          {salvando ? "Salvo..." : editingId ? "Aggiorna spesa" : "Salva spesa"}
        </button>
      </form>

      <div className={`${GLASS} rounded-2xl p-4 mb-4 flex justify-between`}>
        <div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Totale mese</p>
          <p className="font-mono-num text-lg" style={{ color: "#fff" }}>
            € {spese.reduce((tot, s) => tot + Number(s.importo), 0).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Totale generale</p>
          <p className="font-mono-num text-lg" style={{ color: "#fff" }}>€ {totaleGenerale.toFixed(2)}</p>
        </div>
      </div>

      {spese.some((s) => s.condivisa) && (
        <div className={`${GLASS} rounded-2xl p-4 mb-4`}>
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Spese condivise questo mese</p>
              <p className="font-mono-num text-lg" style={{ color: "#fff" }}>
                € {spese.filter((s) => s.condivisa).reduce((tot, s) => tot + Number(s.importo), 0).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Quota a testa (50%)</p>
              <p className="font-mono-num text-lg" style={{ color: "#fff" }}>
                € {(spese.filter((s) => s.condivisa).reduce((tot, s) => tot + Number(s.importo), 0) / 2).toFixed(2)}
              </p>
            </div>
          </div>

          {(() => {
            const rimastoDi = (s) => Math.max(0, Number(s.importo) / 2 - Number(s.importo_rimborsato || 0));
            const nonSaldate = spese.filter((s) => s.condivisa && rimastoDi(s) > 0);
            const doveVannaAnna = nonSaldate.filter((s) => s.persona === "Anna").reduce((t, s) => t + rimastoDi(s), 0);
            const doveAnnaVanna = nonSaldate.filter((s) => s.persona === "Vanna").reduce((t, s) => t + rimastoDi(s), 0);
            if (doveVannaAnna === 0 && doveAnnaVanna === 0) {
              return <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>✓ Tutto saldato tra Anna e Vanna.</p>;
            }
            return (
              <div className="flex flex-col gap-1 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                {doveVannaAnna > 0 && (
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Vanna deve ancora restituire ad Anna: <span className="font-mono-num font-semibold">€ {doveVannaAnna.toFixed(2)}</span>
                  </p>
                )}
                {doveAnnaVanna > 0 && (
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Anna deve ancora restituire a Vanna: <span className="font-mono-num font-semibold">€ {doveAnnaVanna.toFixed(2)}</span>
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Spese di questo mese</h2>
      <div className="flex flex-col gap-2">
        {spese.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna spesa registrata.</p>}
        {spese.map((s) => {
          const quota = Number(s.importo) / 2;
          const giaRestituito = Number(s.importo_rimborsato || 0);
          const rimasto = Math.max(0, quota - giaRestituito);
          const saldato = s.condivisa && rimasto <= 0;

          return (
            <div
              key={s.id}
              className={`${GLASS} rounded-2xl px-4 py-3`}
              style={{
                outline: editingId === s.id ? "2px solid rgba(255,255,255,0.6)" : "none",
                borderLeft: s.condivisa && !saldato ? "4px solid #ffcf5c" : undefined,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>
                    {s.ac_home_categorie?.nome || "—"} {s.ricorrente_id && <span className="text-xs opacity-70">· ricorrente</span>} {s.condivisa && <span className="text-xs opacity-70">· condivisa</span>}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {s.data} {s.persona ? `· pagato da ${s.persona}` : ""} {s.nota ? `· ${s.nota}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-mono-num font-semibold" style={{ color: "#fff" }}>€ {Number(s.importo).toFixed(2)}</p>
                  <button onClick={() => handleModifica(s)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    Modifica
                  </button>
                  <button onClick={() => handleElimina(s.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                    Elimina
                  </button>
                </div>
              </div>

              {s.condivisa && (
                <div className="mt-2 pt-2 flex flex-wrap items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                  {saldato ? (
                    <p className="text-xs font-medium" style={{ color: "#fff" }}>
                      ✓ Quota di € {quota.toFixed(2)} restituita per intero
                      {giaRestituito > 0 && (
                        <button onClick={() => handleAzzeraRimborso(s)} className="ml-2 underline opacity-70">annulla</button>
                      )}
                    </p>
                  ) : (
                    <>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                        Restituiti € {giaRestituito.toFixed(2)} di € {quota.toFixed(2)} · mancano <span className="font-mono-num font-bold text-sm" style={{ color: "#ffcf5c" }}>€ {rimasto.toFixed(2)}</span>
                      </p>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={`es. ${rimasto.toFixed(2)}`}
                        value={importoParziale[s.id] ?? ""}
                        onChange={(e) => setImportoParziale((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        className="w-24 rounded-lg px-2 py-1 text-xs font-mono-num"
                        style={{ background: "#fff" }}
                      />
                      <button onClick={() => handleRegistraParziale(s)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                        Registra
                      </button>
                      <button onClick={() => handleSegnaCompleto(s)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.95)", color: T.forest }}>
                        Salda tutto
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Storico */}
      <h2 className="font-display text-sm mt-6 mb-2" style={{ color: "#fff" }}>Storico</h2>
      <div className="flex gap-2 mb-4">
        {[
          { id: "precedente", label: "Mese precedente" },
          { id: "3mesi", label: "3 mesi" },
          { id: "anno", label: "Anno" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => caricaStorico(f.id)}
            className="flex-1 py-2 rounded-2xl text-xs font-medium"
            style={filtroStorico === f.id ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {caricandoStorico && <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>Carico lo storico...</p>}

      {!caricandoStorico && filtroStorico && storico.length === 0 && (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna spesa trovata in questo periodo.</p>
      )}

      <div className="flex flex-col gap-4">
        {storico.map((gruppoMese) => (
          <div key={gruppoMese.chiave}>
            <div className={`${GLASS} rounded-2xl px-4 py-2 flex justify-between items-center mb-2`}>
              <p className="text-sm font-display capitalize" style={{ color: "#fff" }}>{gruppoMese.label}</p>
              <p className="font-mono-num text-sm font-semibold" style={{ color: "#fff" }}>€ {gruppoMese.totale.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-2">
              {gruppoMese.spese.map((s) => (
                <div key={s.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#fff" }}>
                      {s.ac_home_categorie?.nome || "—"} {s.condivisa && <span className="text-xs opacity-70">· condivisa</span>}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {s.data} {s.persona ? `· ${s.persona}` : ""} {s.nota ? `· ${s.nota}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono-num font-semibold" style={{ color: "#fff" }}>€ {Number(s.importo).toFixed(2)}</p>
                    <button onClick={() => handleModifica(s)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                      Modifica
                    </button>
                    <button onClick={() => handleElimina(s.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
