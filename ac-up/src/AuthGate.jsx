import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { T } from "./lib/theme";

// Gate condiviso: stessa sessione/login per AC UP e AC Home.
// La NavBar (quella di AC UP, con menu/ricette/spesa/salute/profilo)
// viene mostrata solo quando siamo dentro le pagine di AC UP.
export default function AuthGate() {
  const { session, authError } = useAuth();
  const location = useLocation();
  const isAcUp = location.pathname === "/ac-up" || ["/menu", "/ricette", "/spesa", "/salute", "/profilo"].includes(location.pathname);

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
      <Outlet />
      {isAcUp && <NavBar />}
    </div>
  );
}
