import { T } from "../lib/theme";

const CHIAVE_STORAGE = "ac-home-persona-predefinita";

export function getPersonaPredefinita() {
  try {
    return localStorage.getItem(CHIAVE_STORAGE) || "Anna";
  } catch {
    return "Anna";
  }
}

export function salvaPersonaPredefinita(persona) {
  try {
    localStorage.setItem(CHIAVE_STORAGE, persona);
  } catch {
    // ignora se localStorage non e' disponibile
  }
}

export default function PersonaSelector({ value, onChange }) {
  return (
    <>
      <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Chi ha speso / registrato</label>
      <div className="flex gap-2 mb-3">
        {["Anna", "Vanna"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              onChange(p);
              salvaPersonaPredefinita(p);
            }}
            className="flex-1 py-2 rounded-xl text-sm font-medium"
            style={value === p ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            {p}
          </button>
        ))}
      </div>
    </>
  );
}
