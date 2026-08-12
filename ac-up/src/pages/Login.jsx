import { useState } from "react";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { T, GLASS, PAGE_GRADIENT } from "../lib/theme";
import { PrimaryButton, PageBackground } from "../components/ui";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error } =
      mode === "signin" ? await signIn(email, password) : await signUp(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setInfo("Account creato. Controlla la tua email per confermare l'account, poi accedi.");
      setMode("signin");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6" style={{ background: PAGE_GRADIENT }}>
      <PageBackground />

      <div className={`${GLASS} rounded-[28px] p-8 w-full max-w-sm relative`}>
        <img
          src="/icons/ac-hub-full-logo-transparent.png"
          alt="AC Hub"
          className="w-16 mx-auto mb-4"
        />
        <p className="text-sm mb-7 text-white/70 text-center">
          {mode === "signin" ? "Accedi per continuare." : "Crea il tuo account."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-white/70" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl pl-11 pr-4 py-3 outline-none bg-white/15 text-white placeholder-white/50"
              style={{ border: "1px solid rgba(255,255,255,0.3)" }}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-white/70" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl pl-11 pr-11 py-3 outline-none bg-white/15 text-white placeholder-white/50"
              style={{ border: "1px solid rgba(255,255,255,0.3)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-3.5 text-white/70"
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="text-sm rounded-xl p-3 bg-white" style={{ color: T.coral }}>
              {error}
            </div>
          )}
          {info && (
            <div className="text-sm rounded-xl p-3 bg-white" style={{ color: T.forest }}>
              {info}
            </div>
          )}

          <PrimaryButton type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "signin" ? "Accedi" : "Crea account"}
          </PrimaryButton>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="w-full text-center text-sm mt-5 text-white"
        >
          {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}
