import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Wallet, Scale, Home as HomeIcon, Smartphone,
  PiggyBank, Target, ClipboardCheck, BarChart3, Trash2, Plus, Check,
} from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext.jsx";
import { PROPRIETARIO_ID } from "../../lib/ownership.js";
import AcHomeHeader from "../../components/AcHomeHeader.jsx";
import { apriMese, aggiornaMese, creaVoce, aggiornaVoce, eliminaVoce } from "../../lib/acCoppia";

const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";
const NOME_A = "Anna";
const NOME_B = "Vanna";

const SUGG_SPESE = [
  "Affitto / mutuo", "Spese condominiali", "Luce e gas", "Acqua", "Internet",
  "Spesa alimentare", "Assicurazioni", "Manutenzioni casa", "Viaggi / vacanze", "Altre spese comuni",
];
const SUGG_ABBONAMENTI = [
  "Streaming", "Musica", "Palestra / sport", "App e software", "Telefono", "Cloud / archiviazione", "Riviste / giornali",
];
const SUGG_OBIETTIVI = [
  "Vacanze", "Acquisto importante", "Ristrutturazione casa", "Studio / formazione", "Fondo per figli", "Pensione integrativa",
];
const DOMANDE_CONTROLLO = [
  { id: "spese", testo: "Abbiamo controllato tutte le spese?" },
  { id: "abbonamenti", testo: "Ci sono abbonamenti da eliminare?" },
  { id: "quote", testo: "Stiamo rispettando le quote concordate?" },
  { id: "importi", testo: "Dobbiamo modificare qualche importo?" },
  { id: "obiettivi", testo: "Stiamo raggiungendo i nostri obiettivi?" },
  { id: "parlare", testo: "C'è qualcosa di cui vogliamo parlare?" },
];
const METODI = [
  { id: "50_50", label: "50 / 50" },
  { id: "proporzionale", label: "In base al reddito" },
  { id: "personalizzato", label: "Personalizzato" },
];

const BIANCO_SOFT = "rgba(255,255,255,0.75)";
const BTN_ON = { background: "#fff", color: T.forest };
const BTN_OFF = { background: "rgba(255,255,255,0.2)", color: "#fff" };

function num(v) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function euro(v) {
  return `€ ${num(v).toFixed(2)}`;
}
function etichettaMese(anno, mese) {
  const s = new Date(anno, mese - 1, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Header ridotto per chi non è proprietario (Vanna): niente link ad AC UP o al resto di AC Home.
function HeaderOspite() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <img src="/icons/ac-home-logo-transparent.png" alt="AC Home" className="w-8 h-8" />
        <h1 className="font-display text-2xl" style={{ color: "#fff" }}>AC Home</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/ac-pepe" title="Vai a AcPepe">
          <img src="/icons/ac-pepe-logo-transparent.png" alt="AcPepe" className="w-7 h-7 opacity-90" />
        </Link>
        <Link to="/" title="Hub" className="text-white">
          <HomeIcon size={22} />
        </Link>
      </div>
    </div>
  );
}

function Sezione({ numero, titolo, icona: Icona, children }) {
  return (
    <div className={`${GLASS} rounded-3xl p-4 mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono-num text-sm font-semibold" style={{ background: "#fff", color: T.forest }}>
          {numero}
        </div>
        <p className="font-display text-sm flex-1" style={{ color: "#fff" }}>{titolo}</p>
        {Icona && <Icona size={18} color="#fff" />}
      </div>
      {children}
    </div>
  );
}

function RigaTotale({ label, valore, grande }) {
  return (
    <div className="flex justify-between items-center pt-2 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
      <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "#fff" }}>{label}</span>
      <span className={`font-mono-num ${grande ? "text-2xl" : "text-base"}`} style={{ color: "#fff" }}>{euro(valore)}</span>
    </div>
  );
}

// Campo importo che salva quando esci dal campo.
function CampoImporto({ label, valore, onSalva }) {
  const [v, setV] = useState(valore ?? "");
  useEffect(() => { setV(valore ?? ""); }, [valore]);
  return (
    <div className="flex items-center justify-between gap-3 mb-2">
      <label className="text-sm flex-1" style={{ color: "#fff" }}>{label}</label>
      <input
        inputMode="decimal"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => { if (num(v) !== num(valore)) onSalva(num(v)); }}
        className="w-32 rounded-xl px-3 py-2 text-sm text-right font-mono-num"
        style={{ background: "#fff" }}
      />
    </div>
  );
}

function RigaVoce({ voce, conDaEliminare, onAggiorna, onElimina }) {
  const [importo, setImporto] = useState(voce.importo ?? "");
  useEffect(() => { setImporto(voce.importo ?? ""); }, [voce.importo]);
  return (
    <div className="flex items-center gap-2 mb-2" style={{ opacity: voce.da_eliminare ? 0.6 : 1 }}>
      <p className="text-sm flex-1 min-w-0 truncate" style={{ color: "#fff", textDecoration: voce.da_eliminare ? "line-through" : "none" }}>
        {voce.nome}
      </p>
      <input
        inputMode="decimal"
        value={importo}
        onChange={(e) => setImporto(e.target.value)}
        onBlur={() => { if (num(importo) !== num(voce.importo)) onAggiorna(voce.id, { importo: num(importo) }); }}
        className="w-24 rounded-xl px-2 py-1.5 text-sm text-right font-mono-num"
        style={{ background: "#fff" }}
      />
      {conDaEliminare && (
        <button
          onClick={() => onAggiorna(voce.id, { da_eliminare: !voce.da_eliminare })}
          title="Da eliminare il mese prossimo"
          className="px-2 py-1.5 rounded-lg text-[10px] font-medium"
          style={voce.da_eliminare ? { background: "#ffcf5c", color: T.ink } : BTN_OFF}
        >
          {voce.da_eliminare ? "Via" : "Tieni"}
        </button>
      )}
      <button onClick={() => onElimina(voce.id)} className="p-1.5 rounded-lg" style={{ background: "rgba(224,82,82,0.35)" }}>
        <Trash2 size={14} color="#fff" />
      </button>
    </div>
  );
}

function ListaVoci({ voci, suggerimenti, conDaEliminare, onAggiungi, onAggiorna, onElimina, placeholder }) {
  const [nome, setNome] = useState("");
  const [importo, setImporto] = useState("");
  const nomiPresenti = new Set(voci.map((v) => v.nome.toLowerCase()));
  const daSuggerire = suggerimenti.filter((s) => !nomiPresenti.has(s.toLowerCase()));

  async function aggiungi() {
    if (!nome.trim()) return;
    await onAggiungi(nome.trim(), num(importo));
    setNome("");
    setImporto("");
  }

  return (
    <>
      {voci.length === 0 && (
        <p className="text-xs mb-2" style={{ color: BIANCO_SOFT }}>Nessuna voce. Tocca un suggerimento o aggiungine una.</p>
      )}
      {voci.map((v) => (
        <RigaVoce key={v.id} voce={v} conDaEliminare={conDaEliminare} onAggiorna={onAggiorna} onElimina={onElimina} />
      ))}

      {daSuggerire.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
          {daSuggerire.map((s) => (
            <button key={s} onClick={() => onAggiungi(s, 0)} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]" style={BTN_OFF}>
              <Plus size={11} /> {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm"
          style={{ background: "#fff" }}
        />
        <input
          inputMode="decimal"
          value={importo}
          onChange={(e) => setImporto(e.target.value)}
          placeholder="€"
          className="w-20 rounded-xl px-2 py-2 text-sm text-right font-mono-num"
          style={{ background: "#fff" }}
        />
        <button onClick={aggiungi} className="px-3 rounded-xl" style={{ background: T.forest }}>
          <Plus size={16} color="#fff" />
        </button>
      </div>
    </>
  );
}

export default function AcHomeCoppia() {
  const { session } = useAuth();
  const isProprietario = session?.user?.id === PROPRIETARIO_ID;

  const oggi = new Date();
  const [anno, setAnno] = useState(oggi.getFullYear());
  const [mese, setMese] = useState(oggi.getMonth() + 1);
  const [m, setM] = useState(null);
  const [voci, setVoci] = useState([]);
  const [errore, setErrore] = useState("");
  const [nota, setNota] = useState("");

  useEffect(() => { carica(); }, [anno, mese]);

  async function carica() {
    setM(null);
    setErrore("");
    try {
      const r = await apriMese(anno, mese);
      setM(r.mese);
      setVoci(r.voci);
      setNota(r.mese?.note || "");
    } catch (e) {
      console.error(e);
      setErrore("Non riesco a caricare i dati. Controlla di aver creato le tabelle su Supabase.");
    }
  }

  async function ricaricaVoci() {
    const r = await apriMese(anno, mese);
    setVoci(r.voci);
  }

  function cambiaMese(delta) {
    let nm = mese + delta;
    let na = anno;
    if (nm < 1) { nm = 12; na -= 1; }
    if (nm > 12) { nm = 1; na += 1; }
    setMese(nm);
    setAnno(na);
  }

  async function salvaCampo(campi) {
    setM((prev) => ({ ...prev, ...campi }));
    await aggiornaMese(m.id, campi);
  }

  async function aggiungiVoce(tipo, nome, importo) {
    const ordine = voci.filter((v) => v.tipo === tipo).length;
    await creaVoce({ anno, mese, tipo, nome, importo, ordine });
    ricaricaVoci();
  }
  async function modificaVoce(id, campi) {
    setVoci((prev) => prev.map((v) => (v.id === id ? { ...v, ...campi } : v)));
    await aggiornaVoce(id, campi);
  }
  async function cancellaVoce(id) {
    setVoci((prev) => prev.filter((v) => v.id !== id));
    await eliminaVoce(id);
  }

  async function toggleControllo(id) {
    const nuova = { ...(m.checklist || {}), [id]: !m.checklist?.[id] };
    await salvaCampo({ checklist: nuova });
  }

  // ---- Calcoli ----
  const spese = voci.filter((v) => v.tipo === "spesa");
  const abbonamenti = voci.filter((v) => v.tipo === "abbonamento");
  const obiettivi = voci.filter((v) => v.tipo === "obiettivo");
  const somma = (lista) => lista.reduce((t, v) => t + num(v.importo), 0);

  const sA = num(m?.stipendio_a);
  const sB = num(m?.stipendio_b);
  const altre = num(m?.altre_entrate);
  const totaleEntrate = sA + sB + altre;
  const totaleSpese = somma(spese);
  const totaleAbbonamenti = somma(abbonamenti);
  const totaleRisparmio = somma(obiettivi);

  let quotaA = 0;
  let quotaB = 0;
  let percA = 50;
  if (m?.metodo === "personalizzato") {
    quotaA = num(m.quota_a);
    quotaB = num(m.quota_b);
  } else if (m?.metodo === "proporzionale" && sA + sB > 0) {
    percA = (sA / (sA + sB)) * 100;
    quotaA = (totaleSpese * sA) / (sA + sB);
    quotaB = totaleSpese - quotaA;
  } else {
    quotaA = totaleSpese / 2;
    quotaB = totaleSpese / 2;
  }
  const totaleVersamento = quotaA + quotaB;
  const differenzaConto = totaleVersamento - totaleSpese;

  const totaleImprevisti = m?.imprevisti_tipo === "percentuale"
    ? (totaleEntrate * num(m?.imprevisti_valore)) / 100
    : num(m?.imprevisti_valore);

  const residuo = totaleEntrate - totaleSpese - totaleAbbonamenti - totaleImprevisti - totaleRisparmio;

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      {isProprietario ? <AcHomeHeader /> : <HeaderOspite />}
      <h1 className="font-display text-2xl mb-1" style={{ color: "#fff" }}>Soldi in coppia</h1>
      <p className="text-xs mb-4" style={{ color: BIANCO_SOFT }}>
        Conto comune per le spese condivise, conti personali per il resto.
      </p>

      {/* Selettore mese */}
      <div className={`${GLASS} rounded-2xl px-3 py-2 mb-4 flex items-center justify-between`}>
        <button onClick={() => cambiaMese(-1)} className="p-1.5 rounded-lg" style={BTN_OFF}><ChevronLeft size={18} /></button>
        <p className="font-display text-base" style={{ color: "#fff" }}>{etichettaMese(anno, mese)}</p>
        <button onClick={() => cambiaMese(1)} className="p-1.5 rounded-lg" style={BTN_OFF}><ChevronRight size={18} /></button>
      </div>

      {errore && <p className="text-sm mb-4 px-1" style={{ color: "#fff" }}>{errore}</p>}
      {!m && !errore && <p className="text-sm px-1" style={{ color: BIANCO_SOFT }}>Caricamento...</p>}

      {m && (
        <>
          {/* 1. Entrate */}
          <Sezione numero="1" titolo="Entrate del mese (nette)" icona={Wallet}>
            <CampoImporto label={`Stipendio ${NOME_A}`} valore={m.stipendio_a} onSalva={(v) => salvaCampo({ stipendio_a: v })} />
            <CampoImporto label={`Stipendio ${NOME_B}`} valore={m.stipendio_b} onSalva={(v) => salvaCampo({ stipendio_b: v })} />
            <CampoImporto label="Altre entrate (bonus, affitti…)" valore={m.altre_entrate} onSalva={(v) => salvaCampo({ altre_entrate: v })} />
            <RigaTotale label="Totale entrate" valore={totaleEntrate} />
          </Sezione>

          {/* 2. Quota conto comune */}
          <Sezione numero="2" titolo="Quota per il conto comune" icona={Scale}>
            <div className="flex gap-1.5 mb-3">
              {METODI.map((x) => (
                <button
                  key={x.id}
                  onClick={() => salvaCampo({ metodo: x.id })}
                  className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={m.metodo === x.id ? BTN_ON : BTN_OFF}
                >
                  {x.label}
                </button>
              ))}
            </div>

            {m.metodo === "personalizzato" ? (
              <>
                <CampoImporto label={`Versamento ${NOME_A}`} valore={m.quota_a} onSalva={(v) => salvaCampo({ quota_a: v })} />
                <CampoImporto label={`Versamento ${NOME_B}`} valore={m.quota_b} onSalva={(v) => salvaCampo({ quota_b: v })} />
              </>
            ) : (
              <p className="text-[11px] mb-2" style={{ color: BIANCO_SOFT }}>
                {m.metodo === "proporzionale"
                  ? sA + sB > 0
                    ? `${NOME_A} ${percA.toFixed(0)}% · ${NOME_B} ${(100 - percA).toFixed(0)}% delle spese comuni, in base agli stipendi.`
                    : "Inserisci gli stipendi per calcolare le percentuali (intanto è 50/50)."
                  : "Ognuna versa metà delle spese comuni."}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { nome: NOME_A, quota: quotaA, stip: sA },
                { nome: NOME_B, quota: quotaB, stip: sB },
              ].map((p) => (
                <div key={p.nome} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <p className="text-xs font-semibold" style={{ color: "#fff" }}>{p.nome}</p>
                  <p className="text-[11px] mt-1" style={{ color: BIANCO_SOFT }}>Versa</p>
                  <p className="font-mono-num text-lg" style={{ color: "#fff" }}>{euro(p.quota)}</p>
                  <p className="text-[11px] mt-1" style={{ color: BIANCO_SOFT }}>Resta sul personale</p>
                  <p className="font-mono-num text-sm" style={{ color: "#fff" }}>{euro(p.stip - p.quota)}</p>
                </div>
              ))}
            </div>

            <RigaTotale label="Totale versamento" valore={totaleVersamento} />
            {Math.abs(differenzaConto) >= 0.01 && (
              <p className="text-[11px] mt-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,207,92,0.3)", color: "#fff" }}>
                {differenzaConto > 0
                  ? `I versamenti superano le spese comuni di ${euro(differenzaConto)}.`
                  : `Mancano ${euro(-differenzaConto)} per coprire le spese comuni.`}
              </p>
            )}
          </Sezione>

          {/* 3. Spese comuni */}
          <Sezione numero="3" titolo="Spese comuni" icona={HomeIcon}>
            <ListaVoci
              voci={spese}
              suggerimenti={SUGG_SPESE}
              placeholder="Altra spesa comune"
              onAggiungi={(n, i) => aggiungiVoce("spesa", n, i)}
              onAggiorna={modificaVoce}
              onElimina={cancellaVoce}
            />
            <RigaTotale label="Totale spese comuni" valore={totaleSpese} />
          </Sezione>

          {/* 4. Abbonamenti */}
          <Sezione numero="4" titolo="Abbonamenti" icona={Smartphone}>
            <p className="text-[11px] mb-2" style={{ color: BIANCO_SOFT }}>
              Segna "Via" quelli da disdire: dal mese prossimo non vengono più copiati.
            </p>
            <ListaVoci
              voci={abbonamenti}
              suggerimenti={SUGG_ABBONAMENTI}
              conDaEliminare
              placeholder="Altro abbonamento"
              onAggiungi={(n, i) => aggiungiVoce("abbonamento", n, i)}
              onAggiorna={modificaVoce}
              onElimina={cancellaVoce}
            />
            <RigaTotale label="Totale abbonamenti" valore={totaleAbbonamenti} />
          </Sezione>

          {/* 5. Imprevisti */}
          <Sezione numero="5" titolo="Fondo imprevisti" icona={PiggyBank}>
            <p className="text-[11px] mb-2" style={{ color: BIANCO_SOFT }}>
              Spese mediche, riparazioni auto o casa, elettrodomestici, spese extra.
            </p>
            <div className="flex gap-2 mb-3">
              <button onClick={() => salvaCampo({ imprevisti_tipo: "fisso" })} className="flex-1 py-2 rounded-xl text-xs font-medium" style={m.imprevisti_tipo !== "percentuale" ? BTN_ON : BTN_OFF}>
                Importo fisso
              </button>
              <button onClick={() => salvaCampo({ imprevisti_tipo: "percentuale" })} className="flex-1 py-2 rounded-xl text-xs font-medium" style={m.imprevisti_tipo === "percentuale" ? BTN_ON : BTN_OFF}>
                % sulle entrate
              </button>
            </div>
            <CampoImporto
              label={m.imprevisti_tipo === "percentuale" ? "Percentuale (es. 5–10)" : "Importo mensile €"}
              valore={m.imprevisti_valore}
              onSalva={(v) => salvaCampo({ imprevisti_valore: v })}
            />
            <RigaTotale label="Da accantonare" valore={totaleImprevisti} />
          </Sezione>

          {/* 6. Obiettivi di risparmio */}
          <Sezione numero="6" titolo="Obiettivi di risparmio" icona={Target}>
            <ListaVoci
              voci={obiettivi}
              suggerimenti={SUGG_OBIETTIVI}
              placeholder="Altro obiettivo"
              onAggiungi={(n, i) => aggiungiVoce("obiettivo", n, i)}
              onAggiorna={modificaVoce}
              onElimina={cancellaVoce}
            />
            <RigaTotale label="Totale risparmio" valore={totaleRisparmio} />
          </Sezione>

          {/* 7. Controllo mensile */}
          <Sezione numero="7" titolo="Controllo mensile insieme" icona={ClipboardCheck}>
            <div className="flex flex-col gap-1.5 mb-3">
              {DOMANDE_CONTROLLO.map((d) => {
                const fatto = !!m.checklist?.[d.id];
                return (
                  <button key={d.id} onClick={() => toggleControllo(d.id)} className="flex items-center gap-2 text-left">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={fatto ? { background: "#fff" } : { border: "2px solid rgba(255,255,255,0.6)" }}>
                      {fatto && <Check size={13} strokeWidth={3} color={T.forest} />}
                    </span>
                    <span className="text-sm" style={{ color: "#fff", opacity: fatto ? 0.7 : 1 }}>{d.testo}</span>
                  </button>
                );
              })}
            </div>
            <label className="block text-xs mb-1" style={{ color: BIANCO_SOFT }}>Note del mese</label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              onBlur={() => { if (nota !== (m.note || "")) salvaCampo({ note: nota }); }}
              rows={3}
              placeholder="Decisioni prese, cose da rivedere…"
              className="w-full rounded-xl px-3 py-2 text-sm"
              style={{ background: "#fff" }}
            />
          </Sezione>

          {/* 8. Bilancio finale */}
          <Sezione numero="8" titolo="Bilancio finale" icona={BarChart3}>
            {[
              ["Totale entrate", totaleEntrate],
              ["Totale spese comuni", totaleSpese],
              ["Totale abbonamenti", totaleAbbonamenti],
              ["Totale imprevisti", totaleImprevisti],
              ["Totale risparmio", totaleRisparmio],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm mb-1" style={{ color: "#fff" }}>
                <span>{l}</span>
                <span className="font-mono-num">{euro(v)}</span>
              </div>
            ))}
            <RigaTotale label="Residuo" valore={residuo} grande />
            {residuo < 0 && (
              <p className="text-[11px] mt-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(224,82,82,0.4)", color: "#fff" }}>
                Le uscite previste superano le entrate di {euro(-residuo)}.
              </p>
            )}
          </Sezione>
        </>
      )}
    </div>
  );
}
