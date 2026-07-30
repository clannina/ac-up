import { useState } from "react";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { PrimaryButton } from "../components/ui";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6" style={{ background: T.paper }}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: T.sage }} />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30" style={{ background: T.protein }} />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25" style={{ background: T.carbs }} />
      </div>

      <div className={`${GLASS} rounded-2xl p-8 w-full max-w-sm`}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: T.ink }}>AC UP</h1>
        <p className="text-sm mb-7" style={{ color: T.stone }}>
          {mode === "signin" ? "Accedi al tuo piano alimentare." : "Crea il tuo account."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5" size={18} style={{ color: T.stone }} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl pl-11 pr-4 py-3 outline-none bg-white/70"
              style={{ border: `1px solid ${T.mist}` }}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5" size={18} style={{ color: T.stone }} />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl pl-11 pr-11 py-3 outline-none bg-white/70"
              style={{ border: `1px solid ${T.mist}` }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-3.5"
              style={{ color: T.stone }}
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="text-sm rounded-xl p-3" style={{ background: `${T.coral}15`, color: T.coral }}>
              {error}
            </div>
          )}
          {info && (
            <div className="text-sm rounded-xl p-3" style={{ background: `${T.sage}15`, color: T.forest }}>
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
          className="w-full text-center text-sm mt-5"
          style={{ color: T.sage }}
        >
          {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}
