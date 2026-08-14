import { Link } from "react-router-dom";
import { Home as HomeIcon, User } from "lucide-react";

// Header condiviso per tutte le pagine di AC UP:
// pittogramma + "AC UP" a sinistra, a destra: icona AC Home, icona AcPepe, Home, Profilo.
export default function AcUpHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <img src="/icons/ac-up-logo-transparent.png" alt="AC UP" className="w-8 h-8" />
        <h1 className="font-display text-2xl" style={{ color: "#fff" }}>AC UP</h1>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/ac-home" title="Vai a AC Home">
          <img src="/icons/ac-home-logo-transparent.png" alt="AC Home" className="w-7 h-7 opacity-90" />
        </Link>
        <Link to="/ac-pepe" title="Vai a AcPepe">
          <img src="/icons/ac-pepe-logo-transparent.png" alt="AcPepe" className="w-7 h-7 opacity-90" />
        </Link>
        <Link to="/ac-up" title="Home" className="text-white">
          <HomeIcon size={22} />
        </Link>
        <Link to="/profilo" title="Profilo" className="text-white">
          <User size={22} />
        </Link>
      </div>
    </div>
  );
}
