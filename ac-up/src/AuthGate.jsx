import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import AcHomeNavBar from "./components/AcHomeNavBar.jsx";
import AcPepeNavBar from "./components/AcPepeNavBar.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { T } from "./lib/theme";
// Gate condiviso: stessa sessione/login per AC UP, AC Home e AcPepe.
export default function AuthGate() {
  const { session, authError } = useAuth();
  const location = useLocation();
  const isAcUp = location.pathname === "/ac-up" || ["/menu", "/ricette", "/spesa", "/salute", "/profilo"].includes(location.pathname);
  const isAcHome = location.pathname.startsWith("/ac-home");
  const isAcPepe = location.pathname.startsWith("/ac-pepe");
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
    <div className={`min-h-screen ${isAcUp ? "pb-20" : ""}`}>
      <Outlet />
      {isAcUp && <NavBar />}
      {isAcHome && <AcHomeNavBar />}
      {isAcPepe && <AcPepeNavBar />}
    </div>
  );
}
