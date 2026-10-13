import { Outlet, useLocation, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import AcHomeNavBar from "./components/AcHomeNavBar.jsx";
import AcPepeNavBar from "./components/AcPepeNavBar.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { T } from "./lib/theme";
import { PROPRIETARIO_ID } from "./lib/ownership.js";
// Gate condiviso: stessa sessione/login per AC UP, AC Home e AcPepe.
export default function AuthGate() {
  const { session, authError } = useAuth();
  const location = useLocation();
  const isAcUp = location.pathname === "/ac-up" || ["/menu", "/ricette", "/spesa", "/salute", "/profilo"].includes(location.pathname);
  const isAcHome = location.pathname.startsWith("/ac-home");
  const isAcPepe = location.pathname.startsWith("/ac-pepe");
  // "Soldi in coppia" è l'unica pagina di AC Home condivisa con Vanna.
  const isCoppia = location.pathname.startsWith("/ac-home/coppia");
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
  // AC UP e AC Home restano riservati al proprietario: chiunque altro
  // (es. una persona con cui condividi solo AcPepe) viene rimandato lì.
  // Eccezione: la pagina "Soldi in coppia", aperta anche a Vanna (senza la barra di AC Home).
  const isProprietario = session.user?.id === PROPRIETARIO_ID;
  if ((isAcUp || (isAcHome && !isCoppia)) && !isProprietario) {
    return <Navigate to="/ac-pepe" replace />;
  }
  return (
    <div className={`min-h-screen ${isAcUp ? "pb-20" : ""}`}>
      <Outlet />
      {isAcUp && <NavBar />}
      {isAcHome && isProprietario && <AcHomeNavBar />}
      {isAcPepe && <AcPepeNavBar />}
    </div>
  );
}
