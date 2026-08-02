import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { T } from "./lib/theme";

// Stessa logica che prima stava in App.jsx, ma applicata solo alle route di AC UP.
// Cosi' Hub e AC Home restano fuori da questo controllo di sessione.
export default function AcUpGate() {
  const { session, authError } = useAuth();

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
      <NavBar />
    </div>
  );
}
