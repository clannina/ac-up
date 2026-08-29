import { Link } from "react-router-dom";
import { Home as HomeIcon, LogOut } from "lucide-react";
import { useAuth } from "../lib/AuthContext.jsx";
import { PROPRIETARIO_ID } from "../lib/ownership.js";

// Header condiviso per tutte le pagine di AcPepe:
// pittogramma + "AcPepe" a sinistra, scorciatoie a destra.
// Le icone per AC UP/AC Home compaiono solo per la proprietaria (Anna);
// il logout è invece sempre visibile, per chiunque acceda.
export default function AcPepeHeader() {
  const { session, signOut } = useAuth();
  const isProprietario = session?.user?.id === PROPRIETARIO_ID;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <img src="/icons/ac-pepe-logo-transparent.png" alt="AcPepe" className="w-8 h-8" />
        <h1 className="font-display text-2xl" style={{ color: "#fff" }}>AcPepe</h1>
      </div>

      <div className="flex items-center gap-4">
        {isProprietario && (
          <>
            <Link to="/ac-up" title="Vai a AC UP">
              <img src="/icons/ac-up-logo-transparent.png" alt="AC UP" className="w-7 h-7 opacity-90" />
            </Link>
            <Link to="/ac-home" title="Vai a AC Home">
              <img src="/icons/ac-home-logo-transparent.png" alt="AC Home" className="w-7 h-7 opacity-90" />
            </Link>
          </>
        )}
        <Link to="/ac-pepe" title="Home" className="text-white">
          <HomeIcon size={22} />
        </Link>
        <button onClick={signOut} title="Esci" className="text-white">
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}
