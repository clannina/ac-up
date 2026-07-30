import { useMemo, useState } from "react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle } from "../components/ui";

const initialItems = [
  { id: 1, name: "Petto di pollo", category: "Carne", checked: false },
  { id: 2, name: "Pane integrale", category: "Panetteria", checked: false },
  { id: 3, name: "Avocado", category: "Frutta e Verdura", checked: true },
  { id: 4, name: "Yogurt greco", category: "Latticini", checked: false },
  { id: 5, name: "Tonno al naturale", category: "Dispensa", checked: false },
  { id: 6, name: "Pomodori", category: "Frutta e Verdura", checked: false },
];

export default function Spesa() {
  const [items, setItems] = useState(initialItems);

  const toggle = (id) => {
    setItems(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [items]);

  const progress = Math.round((items.filter((i) => i.checked).length / items.length) * 100);

  return (
    <Page maxWidth="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <SectionTitle className="text-3xl">Lista della Spesa</SectionTitle>
          <p className="mt-2 text-white/70">Generata dalle ricette selezionate.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold font-mono-num text-white">{progress}%</div>
          <div className="text-sm text-white/70">Completata</div>
        </div>
      </div>

      <div className="w-full rounded-full h-2.5 mb-10 bg-white/20">
        <div className="h-2.5 rounded-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {Object.entries(grouped).map(([category, list]) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: T.cream }}>
            {category}
          </h2>

          <div className={`${GLASS} rounded-[28px] divide-y divide-white/15`}>
            {list.map((item) => (
              <label key={item.id} className="flex items-center justify-between p-4 cursor-pointer transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggle(item.id)}
                    className="w-5 h-5"
                  />
                  <span className={item.checked ? "line-through text-white/50" : "text-white"}>
                    {item.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </Page>
  );
}
