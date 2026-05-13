import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Hexagon, KeyRound, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { loginWithToken, adminLogin } from "@/lib/auth.functions";
import {
  getDeviceId,
  getToken,
  setToken,
  setAdminPassword,
} from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in" }] }),
});

type Tab = "token" | "admin";

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("token");
  const [tokenInput, setTokenInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenLogin = useServerFn(loginWithToken);
  const adminLoginFn = useServerFn(adminLogin);

  useEffect(() => {
    if (getToken()) navigate({ to: "/" });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "token") {
        const res = await tokenLogin({
          data: { token: tokenInput.trim(), deviceId: getDeviceId() },
        });
        if (!res.ok) {
          setError(res.error);
        } else {
          setToken(tokenInput.trim());
          navigate({ to: "/" });
        }
      } else {
        const res = await adminLoginFn({ data: { password } });
        if (!res.ok) {
          setError(res.error);
        } else {
          setAdminPassword(password);
          navigate({ to: "/admin" });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-4 py-10">
      <div className="w-full max-w-md animate-scale-in">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-foreground text-background shadow-lg">
            <Hexagon className="size-6" strokeWidth={3} />
          </span>
          <h1 className="text-2xl font-black tracking-tight">Xeno Verse | Login</h1>
          <p className="text-sm text-muted-foreground">Welcome Back To XenoVerse</p>
        </div>

        <div className="relative rounded-2xl border border-border bg-surface/60 p-1 mb-4 grid grid-cols-2 gap-1 overflow-hidden">
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-foreground shadow transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: tab === "token" ? "translateX(0%)" : "translateX(100%)" }}
          />
          {([
            { k: "token" as Tab, label: "Token", Icon: KeyRound },
            { k: "admin" as Tab, label: "Admin", Icon: ShieldCheck },
          ]).map(({ k, label, Icon }) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setTab(k);
                setError(null);
              }}
              className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                tab === k ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-surface/60 p-6 space-y-4 backdrop-blur"
        >
          <div key={tab} className="animate-slide-down space-y-2">
            {tab === "token" ? (
              <>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Access token
                </label>
                <input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste your token"
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm outline-none transition focus:border-foreground/40"
                />
              </>
            ) : (
              <>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
                />
              </>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (tab === "token" ? !tokenInput.trim() : !password)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Signing in..." : tab === "token" ? "Continue" : "Enter Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
