import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from "recharts";
import { Wind, Play, Square, RotateCcw, Trash2, Ruler } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import AcPepeHeader from "../../components/AcPepeHeader.jsx";
import { getRespiri, creaRespiro, eliminaRespiro, statoRespiro, getAddome, creaAddome, eliminaAddome } from "../../lib/acPepe";

const BACKGROUND = "linear-gradient(180deg, #F5C518 0%, #E9311A 100%)";
const DURATA_CONTEGGIO = 60; // secondi

export default function AcPepeRespiri() {
  const [scheda, setScheda] = useState("respiri"); // "respiri" | "addome"

  const [storico, setStorico] = useState([]);
  const [caricato, setCaricato] = useState(false);

  // Stato del contatore
  const [contando, setContando] = useState(false);
  const [conteggio, setConteggio] = useState(0);
  const [secondiRimasti, setSecondiRimasti] = useState(DURATA_CONTEGGIO);
  const [risultato, setRisultato] = useState(null); // { bpm, conteggio, durata }

  // Stato dell'inserimento manuale
  const [modalitaManuale, setModalitaManuale] = useState(false);
  const [bpmManuale, setBpmManuale] = useState("");

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Stato del monitoraggio addome (circonferenza + liquido)
  const [storicoAddome, setStoricoAddome] = useState([]);
  const [caricatoAddome, setCaricatoAddome] = useState(false);
  const [nuovoAddome, setNuovoAddome] = useState({ circonferenza_cm: "", liquido_ml: "", nota: "" });
  const [salvandoAddome, setSalvandoAddome] = useState(false);

  useEffect(() => {
    caricaStorico();
    caricaStoricoAddome();
  }, []);

  async function caricaStoricoAddome() {
    const dati = await getAddome();
    setStoricoAddome(dati);
    setCaricatoAddome(true);
  }

  async function salvaAddome() {
    const circonferenza = parseFloat(nuovoAddome.circonferenza_cm);
    if (!circonferenza || circonferenza <= 0) return;
    setSalvandoAddome(true);
    try {
      await creaAddome({
        circonferenza_cm: circonferenza,
        liquido_ml: nuovoAddome.liquido_ml ? parseFloat(nuovoAddome.liquido_ml) : null,
        nota: nuovoAddome.nota,
      });
      setNuovoAddome({ circonferenza_cm: "", liquido_ml: "", nota: "" });
      caricaStoricoAddome();
    } finally {
      setSalvandoAddome(false);
    }
  }

  async function handleEliminaAddome(id) {
    await eliminaAddome(id);
    caricaStoricoAddome();
  }

  async function caricaStorico() {
    const dati = await getRespiri();
    setStorico(dati);
    setCaricato(true);
  }

  function avviaConteggio() {
    setContando(true);
    setConteggio(0);
    setSecondiRimasti(DURATA_CONTEGGIO);
    setRisultato(null);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const trascorsi = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const rimasti = DURATA_CONTEGGIO - trascorsi;
      if (rimasti <= 0) {
        fermaConteggio();
      } else {
        setSecondiRimasti(rimasti);
      }
    }, 200);
  }

  function fermaConteggio() {
    clearInterval(intervalRef.current);
    setContando(false);

    setConteggio((count) => {
      const durataReale = Math.min(DURATA_CONTEGGIO, Math.round((Date.now() - startTimeRef.current) / 1000) || 1);
      const bpm = Math.round((count / durataReale) * 60);
      setRisultato({ bpm, conteggio: count, durata: durataReale });
      return count;
    });
  }

  function registraTocco() {
    if (contando) setConteggio((c) => c + 1);
  }

  function annullaRisultato() {
    setRisultato(null);
    setConteggio(0);
    setSecondiRimasti(DURATA_CONTEGGIO);
  }

  async function salvaRisultato() {
    if (!risultato) return;
    await creaRespiro({
      bpm: risultato.bpm,
      durata_secondi: risultato.durata,
      conteggio_respiri: risultato.conteggio,
    });
    annullaRisultato();
    caricaStorico();
  }

  async function salvaManuale() {
    const bpm = parseInt(bpmManuale, 10);
    if (!bpm || bpm <= 0) return;
    await creaRespiro({
      bpm,
      durata_secondi: 60,
      conteggio_respiri: bpm,
      nota: "inserito manualmente",
    });
    setBpmManuale("");
    setModalitaManuale(false);
    caricaStorico();
  }

  async function handleElimina(id) {
    await eliminaRespiro(id);
    caricaStorico();
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const ultimo = storico[0];
  const statoUltimo = ultimo ? statoRespiro(ultimo.bpm) : null;

  const datiGrafico = [...storico]
    .reverse()
    .map((r) => ({
      data: new Date(r.data).toLocaleDateString("it-IT", { day: "numeric", month: "short" }),
      bpm: r.bpm,
    }));

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcPepeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Respiri</h1>

      {/* Selettore scheda */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setScheda("respiri")}
          className="flex-1 py-2.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5"
          style={scheda === "respiri" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
        >
          <Wind size={16} /> Respiri
        </button>
        <button
          onClick={() => setScheda("addome")}
          className="flex-1 py-2.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5"
          style={scheda === "addome" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
        >
          <Ruler size={16} /> Addome
        </button>
      </div>

      {scheda === "respiri" && (
        <>
      {/* Ultimo valore registrato */}
      {ultimo && (
        <div className={`${GLASS} rounded-3xl p-4 mb-5 flex items-center justify-between`}>
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Ultima misurazione</p>
            <p className="font-mono-num text-3xl" style={{ color: "#fff" }}>{ultimo.bpm} <span className="text-sm font-sans">resp/min</span></p>
          </div>
          <div className="text-right">
            <span
              className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: statoUltimo.colore, color: "#1a1a1a" }}
            >
              {statoUltimo.label}
            </span>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              {new Date(ultimo.data).toLocaleDateString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      )}

      {/* Contatore a tocco */}
      <div className={`${GLASS} rounded-3xl p-6 mb-5 text-center`}>
        {!contando && !risultato && !modalitaManuale && (
          <>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
              Conta i respiri di Pepe mentre dorme o è tranquillo. Premi Avvia, poi tocca il cerchio ad ogni respiro per {DURATA_CONTEGGIO} secondi.
            </p>
            <button
              onClick={avviaConteggio}
              className="mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl font-display text-base"
              style={{ background: "#fff", color: T.forest }}
            >
              <Play size={18} /> Avvia conteggio
            </button>
            <button
              onClick={() => setModalitaManuale(true)}
              className="mx-auto mt-3 block text-sm underline"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Inserisci manualmente
            </button>
          </>
        )}

        {modalitaManuale && (
          <>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
              Hai già contato i respiri? Inserisci direttamente il valore in respiri al minuto.
            </p>
            <input
              type="number"
              inputMode="numeric"
              value={bpmManuale}
              onChange={(e) => setBpmManuale(e.target.value)}
              placeholder="es. 24"
              className="w-32 mx-auto block text-center rounded-xl px-3 py-2.5 text-2xl font-mono-num mb-4"
              style={{ background: "#fff", color: T.forest }}
              autoFocus
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setModalitaManuale(false); setBpmManuale(""); }}
                className="px-4 py-2.5 rounded-2xl text-sm font-display"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                Annulla
              </button>
              <button
                onClick={salvaManuale}
                disabled={!bpmManuale}
                className="px-5 py-2.5 rounded-2xl text-sm font-display disabled:opacity-40"
                style={{ background: "#fff", color: T.forest }}
              >
                Salva misurazione
              </button>
            </div>
          </>
        )}

        {contando && (
          <>
            <p className="font-mono-num text-sm mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>
              {secondiRimasti}s rimasti
            </p>
            <button
              onClick={registraTocco}
              className="mx-auto w-40 h-40 rounded-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              style={{ background: "rgba(255,255,255,0.95)" }}
            >
              <Wind size={32} style={{ color: T.forest }} />
              <span className="font-mono-num text-4xl font-bold" style={{ color: T.forest }}>{conteggio}</span>
              <span className="text-xs" style={{ color: T.stone }}>tocca ad ogni respiro</span>
            </button>
            <button
              onClick={fermaConteggio}
              className="mx-auto mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-display"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              <Square size={14} /> Ferma ora
            </button>
          </>
        )}

        {risultato && (
          <>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Risultato</p>
            <p className="font-mono-num text-5xl font-bold mb-1" style={{ color: "#fff" }}>{risultato.bpm}</p>
            <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>respiri al minuto</p>
            <span
              className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background: statoRespiro(risultato.bpm).colore, color: "#1a1a1a" }}
            >
              {statoRespiro(risultato.bpm).label}
            </span>
            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
              {risultato.conteggio} respiri contati in {risultato.durata}s
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={annullaRisultato}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-display"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                <RotateCcw size={14} /> Rifai
              </button>
              <button
                onClick={salvaRisultato}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-display"
                style={{ background: "#fff", color: T.forest }}
              >
                Salva misurazione
              </button>
            </div>
          </>
        )}
      </div>

      {/* Grafico andamento */}
      {caricato && datiGrafico.length > 1 && (
        <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
          <p className="font-display text-sm mb-3" style={{ color: "#fff" }}>Andamento</p>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={datiGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                {/* Fasce di riferimento: verde fino a 30, giallo fino a 36, rosso oltre */}
                <ReferenceArea y1={0} y2={30} fill="#7ed9a8" fillOpacity={0.12} />
                <ReferenceArea y1={30} y2={36} fill="#ffcf5c" fillOpacity={0.14} />
                <ReferenceArea y1={36} y2={60} fill="#e05252" fillOpacity={0.14} />
                <XAxis dataKey="data" tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, "dataMax + 5"]} />
                <Tooltip
                  contentStyle={{ background: "rgba(20,20,30,0.9)", border: "none", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line type="monotone" dataKey="bpm" stroke="#fff" strokeWidth={2.5} dot={{ r: 3, fill: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Storico misurazioni */}
      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Storico misurazioni</h2>
      <div className="flex flex-col gap-2">
        {caricato && storico.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna misurazione ancora registrata.</p>
        )}
        {storico.map((r) => {
          const stato = statoRespiro(r.bpm);
          return (
            <div key={r.id} className={`${GLASS} rounded-2xl px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: stato.colore }} />
                <div>
                  <p className="font-mono-num text-base font-semibold" style={{ color: "#fff" }}>{r.bpm} resp/min</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {new Date(r.data).toLocaleDateString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <button onClick={() => handleElimina(r.id)} className="p-2 rounded-lg" style={{ background: "rgba(224,82,82,0.35)" }}>
                <Trash2 size={15} color="#fff" />
              </button>
            </div>
          );
        })}
      </div>
        </>
      )}

      {scheda === "addome" && (
        <>
          {/* Ultimo valore registrato */}
          {storicoAddome[0] && (
            <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Ultima misurazione</p>
              <div className="flex items-end justify-between">
                <p className="font-mono-num text-3xl" style={{ color: "#fff" }}>
                  {storicoAddome[0].circonferenza_cm} <span className="text-sm font-sans">cm</span>
                </p>
                {storicoAddome[0].liquido_ml != null && (
                  <p className="font-mono-num text-xl" style={{ color: "#fff" }}>
                    {storicoAddome[0].liquido_ml} <span className="text-sm font-sans">ml</span>
                  </p>
                )}
              </div>
              <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                {new Date(storicoAddome[0].data).toLocaleDateString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          )}

          {/* Form nuova misurazione */}
          <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
              Misura la circonferenza dell'addome nello stesso punto ogni volta (di solito il punto più largo). Il liquido è opzionale, da compilare solo se drenato.
            </p>

            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Circonferenza (cm)</label>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={nuovoAddome.circonferenza_cm}
              onChange={(e) => setNuovoAddome((prev) => ({ ...prev, circonferenza_cm: e.target.value }))}
              placeholder="es. 52.5"
              className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Liquido drenato (ml) — opzionale</label>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              value={nuovoAddome.liquido_ml}
              onChange={(e) => setNuovoAddome((prev) => ({ ...prev, liquido_ml: e.target.value }))}
              placeholder="es. 350"
              className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Note (opzionale)</label>
            <input
              value={nuovoAddome.nota}
              onChange={(e) => setNuovoAddome((prev) => ({ ...prev, nota: e.target.value }))}
              placeholder="es. dopo la paracentesi dal veterinario"
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <button
              onClick={salvaAddome}
              disabled={salvandoAddome || !nuovoAddome.circonferenza_cm}
              className="w-full py-2.5 rounded-xl font-display text-sm disabled:opacity-40"
              style={{ background: "#fff", color: T.forest }}
            >
              {salvandoAddome ? "Salvo..." : "Salva misurazione"}
            </button>
          </div>

          {/* Grafico andamento circonferenza */}
          {caricatoAddome && storicoAddome.length > 1 && (
            <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
              <p className="font-display text-sm mb-3" style={{ color: "#fff" }}>Andamento circonferenza</p>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={[...storicoAddome].reverse().map((a) => ({
                      data: new Date(a.data).toLocaleDateString("it-IT", { day: "numeric", month: "short" }),
                      cm: a.circonferenza_cm,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                    <XAxis dataKey="data" tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
                    <Tooltip
                      contentStyle={{ background: "rgba(20,20,30,0.9)", border: "none", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="cm" stroke="#fff" strokeWidth={2.5} dot={{ r: 3, fill: "#fff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Storico misurazioni addome */}
          <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Storico misurazioni</h2>
          <div className="flex flex-col gap-2">
            {caricatoAddome && storicoAddome.length === 0 && (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna misurazione ancora registrata.</p>
            )}
            {storicoAddome.map((a) => (
              <div key={a.id} className={`${GLASS} rounded-2xl px-4 py-3 flex items-center justify-between`}>
                <div>
                  <p className="font-mono-num text-base font-semibold" style={{ color: "#fff" }}>
                    {a.circonferenza_cm} cm{a.liquido_ml != null && ` · ${a.liquido_ml} ml`}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {new Date(a.data).toLocaleDateString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {a.nota ? ` · ${a.nota}` : ""}
                  </p>
                </div>
                <button onClick={() => handleEliminaAddome(a.id)} className="p-2 rounded-lg" style={{ background: "rgba(224,82,82,0.35)" }}>
                  <Trash2 size={15} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
