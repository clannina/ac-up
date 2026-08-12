import { Link } from "react-router-dom";

// Header condiviso per tutte le pagine di AC UP:
// pittogramma + "AC UP" a sinistra, icona AC Home a destra per passare all'altra app.
export default function AcUpHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <img src="/icons/ac-up-logo-transparent.png" alt="AC UP" className="w-8 h-8" />
        <h1 className="font-display text-2xl" style={{ color: "#fff" }}>AC UP</h1>
      </div>

      <Link to="/ac-home" title="Vai a AC Home">
        <img src="/icons/ac-home-logo-transparent.png" alt="AC Home" className="w-7 h-7 opacity-90" />
      </Link>
    </div>
  );
}
