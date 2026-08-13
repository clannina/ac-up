import { Routes, Route } from "react-router-dom";
import Hub from "./Hub.jsx";
import AuthGate from "./AuthGate.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Ricette from "./pages/Ricette.jsx";
import Spesa from "./pages/Spesa.jsx";
import Salute from "./pages/Salute.jsx";
import Profilo from "./pages/Profilo.jsx";
import AcHomeDashboard from "./pages/achome/AcHomeDashboard.jsx";
import AcHomeSpese from "./pages/achome/AcHomeSpese.jsx";
import AcHomeBudget from "./pages/achome/AcHomeBudget.jsx";
import AcHomeRicorrenti from "./pages/achome/AcHomeRicorrenti.jsx";
import AcHomeScadenze from "./pages/achome/AcHomeScadenze.jsx";
import AcHomeProfilo from "./pages/achome/AcHomeProfilo.jsx";
import AcHomeEntrate from "./pages/achome/AcHomeEntrate.jsx";
import AcHomeStorico from "./pages/achome/AcHomeStorico.jsx";
import AcPepeDashboard from "./pages/acpepe/AcPepeDashboard.jsx";
import AcPepeRespiri from "./pages/acpepe/AcPepeRespiri.jsx";
import AcPepeTerapie from "./pages/acpepe/AcPepeTerapie.jsx";
import AcPepeScadenze from "./pages/acpepe/AcPepeScadenze.jsx";
import AcPepeReferti from "./pages/acpepe/AcPepeReferti.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      {/* Tutte le route, sia AC UP che AC Home che AcPepe, passano dallo stesso gate di login */}
      <Route element={<AuthGate />}>
        <Route path="ac-up" element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="ricette" element={<Ricette />} />
        <Route path="spesa" element={<Spesa />} />
        <Route path="salute" element={<Salute />} />
        <Route path="profilo" element={<Profilo />} />
        <Route path="ac-home" element={<AcHomeDashboard />} />
        <Route path="ac-home/spese" element={<AcHomeSpese />} />
        <Route path="ac-home/budget" element={<AcHomeBudget />} />
        <Route path="ac-home/ricorrenti" element={<AcHomeRicorrenti />} />
        <Route path="ac-home/scadenze" element={<AcHomeScadenze />} />
        <Route path="ac-home/profilo" element={<AcHomeProfilo />} />
        <Route path="ac-home/entrate" element={<AcHomeEntrate />} />
        <Route path="ac-home/storico" element={<AcHomeStorico />} />
        <Route path="ac-pepe" element={<AcPepeDashboard />} />
        <Route path="ac-pepe/respiri" element={<AcPepeRespiri />} />
        <Route path="ac-pepe/terapie" element={<AcPepeTerapie />} />
        <Route path="ac-pepe/scadenze" element={<AcPepeScadenze />} />
        <Route path="ac-pepe/referti" element={<AcPepeReferti />} />
      </Route>
    </Routes>
  );
}
