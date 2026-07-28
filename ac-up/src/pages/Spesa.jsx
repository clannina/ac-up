import { useMemo, useState } from "react";

const initialItems = [
  { id:1, name:"Petto di pollo", category:"Carne", checked:false },
  { id:2, name:"Pane integrale", category:"Panetteria", checked:false },
  { id:3, name:"Avocado", category:"Frutta e Verdura", checked:true },
  { id:4, name:"Yogurt greco", category:"Latticini", checked:false },
  { id:5, name:"Tonno al naturale", category:"Dispensa", checked:false },
  { id:6, name:"Pomodori", category:"Frutta e Verdura", checked:false },
];

export default function Spesa() {
  const [items,setItems]=useState(initialItems);

  const toggle=id=>{
    setItems(items.map(i=>i.id===id?{...i,checked:!i.checked}:i));
  };

  const grouped=useMemo(()=>{
    return items.reduce((acc,item)=>{
      acc[item.category]=acc[item.category]||[];
      acc[item.category].push(item);
      return acc;
    },{});
  },[items]);

  const progress=Math.round((items.filter(i=>i.checked).length/items.length)*100);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Lista della Spesa</h1>
          <p className="text-gray-500 mt-2">Generata dalle ricette selezionate.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">{progress}%</div>
          <div className="text-sm text-gray-500">Completata</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-10">
        <div className="bg-green-600 h-3 rounded-full" style={{width:`${progress}%`}} />
      </div>

      {Object.entries(grouped).map(([category,list])=>(
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y">
            {list.map(item=>(
              <label key={item.id} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={()=>toggle(item.id)}
                    className="w-5 h-5"
                  />
                  <span className={item.checked?"line-through text-gray-400":""}>
                    {item.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
