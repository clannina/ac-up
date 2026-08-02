import { Routes, Route } from "react-router-dom";
import Hub from "./Hub.jsx";
import AuthGate from "./AuthGate.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Ricette from "./pages/Ricette.jsx";
import Spesa from "./pages/Spesa.jsx";
import Salute from "./pages/Salute.jsx";
import Profilo from "./pages/Profilo.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />

      {/* Tutte le route, sia AC UP che AC Home, passano dallo stesso gate di login */}
      <Route element={<AuthGate />}>
        <Route path="ac-up" element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="ricette" element={<Ricette />} />
        <Route path="spesa" element={<Spesa />} />
        <Route path="salute" element={<Salute />} />
        <Route path="profilo" element={<Profilo />} />

        {/* Placeholder finche' non costruiamo AC Home */}
        <Route path="ac-home" element={<div className="p-6">AC Home in arrivo</div>} />
      </Route>
    </Routes>
  );
}
