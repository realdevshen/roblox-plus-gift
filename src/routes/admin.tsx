import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import {
  Hexagon,
  Plus,
  LogOut,
  Copy,
  Check,
  Trash2,
  Ban,
  Loader2,
  Smartphone,
  ShieldX,
  Clock,
  Infinity as InfinityIcon,
} from "lucide-react";
import {
  adminListTokens,
  adminCreateToken,
  adminRevokeToken,
  adminDeleteToken,
  adminUnbindDevice,
  adminSetPoints,
} from "@/lib/auth.functions";
import { getAdminPassword, clearAdminPassword } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin" }] }),
});

type Expiry = "day" | "week" | "month" | "year" | "lifetime";

const EXPIRY_LABELS: { value: Expiry; label: string }[] = [
  { value: "day", label: "1 Day" },
  { value: "week", label: "1 Week" },
  { value: "month", label: "1 Month" },
  { value: "year", label: "1 Year" },
  { value: "lifetime", label: "Lifetime" },
];

type TokenRow = {
  id: string;
  token: string;
  expires_at: string | null;
  revoked: boolean;
  device_id: string | null;
  created_at: string;
  last_used_at: string | null;
  points: number | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const list = useServerFn(adminListTokens);
  const create = useServerFn(adminCreateToken);
  const revoke = useServerFn(adminRevokeToken);
  const remove = useServerFn(adminDeleteToken);
  const unbind = useServerFn(adminUnbindDevice);
  const setPoints = useServerFn(adminSetPoints);

  const [password, setPassword] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [expiry, setExpiry] = useState<Expiry>("month");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"token" | "points">("token");
  const [pointsDraft, setPointsDraft] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const p = getAdminPassword();
    if (!p) {
      navigate({ to: "/login" });
      return;
    }
    setPassword(p);
  }, [navigate]);

  const refresh = useCallback(async (pw: string) => {
    setLoading(true);
    try {
      const res = await list({ data: { password: pw } });
      setTokens(res.tokens as TokenRow[]);
    } catch {
      clearAdminPassword();
      navigate({ to: "/login" });
    } finally {
      setLoading(false);
    }
  }, [list, navigate]);

  useEffect(() => {
    if (password) refresh(password);
  }, [password, refresh]);

  const onCreate = async () => {
    if (!password) return;
    setCreating(true);
    try {
      await create({ data: { password, expiry } });
      await refresh(password);
    } finally {
      setCreating(false);
    }
  };

  const onRevoke = async (id: string) => {
    if (!password) return;
    setBusyId(id);
    try {
      await revoke({ data: { password, id } });
      await refresh(password);
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!password) return;
    if (!confirm("Permanently delete this token?")) return;
    setBusyId(id);
    try {
      await remove({ data: { password, id } });
      await refresh(password);
    } finally {
      setBusyId(null);
    }
  };

  const onUnbind = async (id: string) => {
    if (!password) return;
    setBusyId(id);
    try {
      await unbind({ data: { password, id } });
      await refresh(password);
    } finally {
      setBusyId(null);
    }
  };

  const copy = async (id: string, token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const onSavePoints = async (id: string) => {
    if (!password) return;
    const raw = pointsDraft[id];
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    setBusyId(id);
    try {
      await setPoints({ data: { password, id, points: Math.floor(n) } });
      await refresh(password);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 1400);
    } finally {
      setBusyId(null);
    }
  };

  const logout = () => {
    clearAdminPassword();
    navigate({ to: "/login" });
  };

  const tokenStatus = (t: TokenRow) => {
    if (t.revoked) return { label: "Revoked", tone: "bg-destructive/15 text-destructive" };
    if (t.expires_at && new Date(t.expires_at).getTime() < Date.now())
      return { label: "Expired", tone: "bg-yellow-500/15 text-yellow-500" };
    return { label: "Active", tone: "bg-emerald-500/15 text-emerald-500" };
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-foreground text-background">
            <Hexagon className="size-4" strokeWidth={3} />
          </span>
          <h1 className="text-base font-black tracking-tight">Admin Panel</h1>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-xs font-semibold hover:bg-surface transition"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 md:px-6 py-8 space-y-8">
        {/* Generate */}
        <section className="rounded-2xl border border-border bg-surface/60 p-6 animate-fade-in">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Generate token
          </h2>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Expires in
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_LABELS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => setExpiry(e.value)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      expiry === e.value
                        ? "bg-foreground text-background shadow"
                        : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                    }`}
                  >
                    {e.value === "lifetime" && <InfinityIcon className="inline size-3.5 mr-1" />}
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={onCreate}
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-40"
            >
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Generate
            </button>
          </div>
        </section>

        {/* List */}
        <section className="rounded-2xl border border-border bg-surface/60 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Tokens ({tokens.length})
            </h2>
            {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>

          {!loading && tokens.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No tokens yet. Generate your first one above.
            </div>
          )}

          <ul className="divide-y divide-border">
            {tokens.map((t) => {
              const status = tokenStatus(t);
              return (
                <li key={t.id} className="p-4 md:p-5 hover:bg-surface/40 transition-colors">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="font-mono text-xs md:text-sm break-all">{t.token}</code>
                        <button
                          onClick={() => copy(t.id, t.token)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-surface transition"
                        >
                          {copiedId === t.id ? (
                            <><Check className="size-3" /> Copied</>
                          ) : (
                            <><Copy className="size-3" /> Copy</>
                          )}
                        </button>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.tone}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {t.expires_at
                            ? `Expires ${new Date(t.expires_at).toLocaleString()}`
                            : "Lifetime"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Smartphone className="size-3" />
                          {t.device_id ? `Bound: ${t.device_id.slice(0, 8)}…` : "Unbound"}
                        </span>
                        {t.last_used_at && (
                          <span>Last used {new Date(t.last_used_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {t.device_id && !t.revoked && (
                        <button
                          onClick={() => onUnbind(t.id)}
                          disabled={busyId === t.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface transition disabled:opacity-40"
                        >
                          <Smartphone className="size-3.5" /> Unbind
                        </button>
                      )}
                      {!t.revoked && (
                        <button
                          onClick={() => onRevoke(t.id)}
                          disabled={busyId === t.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition disabled:opacity-40"
                        >
                          {busyId === t.id ? <Loader2 className="size-3.5 animate-spin" /> : <Ban className="size-3.5" />}
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(t.id)}
                        disabled={busyId === t.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 transition disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <ShieldX className="hidden" />
    </div>
  );
}
