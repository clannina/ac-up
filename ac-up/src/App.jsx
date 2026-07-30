import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Ricette from "./pages/Ricette.jsx";
import Spesa from "./pages/Spesa.jsx";
import Salute from "./pages/Salute.jsx";
import Profilo from "./pages/Profilo.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { T } from "./lib/theme";

export default function App() {
  const { session, authError } = useAuth();

  // Sessione ancora da controllare: breve schermata di caricamento,
  // evita un lampo della schermata di login prima di sapere se sei già dentro.
  if (session === undefined && !authError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.paper, color: T.stone }}>
        Caricamento...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

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
