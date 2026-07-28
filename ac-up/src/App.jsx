import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Ricette from "./pages/Ricette.jsx";
import Spesa from "./pages/Spesa.jsx";
import Salute from "./pages/Salute.jsx";
import Profilo from "./pages/Profilo.jsx";

export default function App() {
  return (
    <div className="min-h-screen pb-20">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/ricette" element={<Ricette />} />
        <Route path="/spesa" element={<Spesa />} />
        <Route path="/salute" element={<Salute />} />
        <Route path="/profilo" element={<Profilo />} />
      </Routes>
      <NavBar />
    </div>
  );
}
