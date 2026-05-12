import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { lookupRobloxUser } from "@/lib/roblox.functions";
import { loginWithToken } from "@/lib/auth.functions";
import { getToken, getDeviceId, clearToken } from "@/lib/auth-client";
import {
  Home,
  User,
  Sparkles,
  MessageSquare,
  Users,
  UserCircle2,
  Package,
  ShoppingBag,
  ArrowLeftRight,
  UsersRound,
  Palette,
  FileText,
  Store,
  Gift,
  Search,
  HelpCircle,
  Bell,
  Settings,
  Send,
  ChevronDown,
  Hexagon,
  X,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Buy Robux — Get up to 25% more" },
      {
        name: "description",
        content: "Purchase Robux packages and enjoy bonus Robux on every pack.",
      },
    ],
  }),
});

const navTop = [
  { label: "Home", icon: Home },
  { label: "Profile", icon: User },
  { label: "Roblox Plus", icon: Sparkles },
  { label: "Messages", icon: MessageSquare, badge: "90" },
  { label: "Friends", icon: Users, badge: "400" },
  { label: "Avatar", icon: UserCircle2 },
  { label: "Inventory", icon: Package },
  { label: "Sandbox", icon: ShoppingBag },
  { label: "Trade", icon: ArrowLeftRight },
  { label: "Communities", icon: UsersRound },
  { label: "Themes", icon: Palette },
  { label: "Blog", icon: FileText },
  { label: "Official Store", icon: Store },
  { label: "Buy Gift Cards", icon: Gift },
];

const topMenu = ["Home", "Charts", "Marketplace", "Create", "Robux"];

type Pack = {
  robux: number;
  base: number;
  bonus: number;
  price: number;
  featured?: boolean;
};

const packages: Pack[] = [
  { robux: 26400, base: 25000, bonus: 1400, price: 239.99, featured: true },
  { robux: 12100, base: 11000, bonus: 1100, price: 119.99 },
  { robux: 5800, base: 4950, bonus: 850, price: 59.99 },
  { robux: 4000, base: 3470, bonus: 530, price: 39.99 },
  { robux: 2200, base: 1870, bonus: 330, price: 24.99 },
  { robux: 1650, base: 1330, bonus: 320, price: 15.99 },
  { robux: 1100, base: 880, bonus: 220, price: 11.99 },
  { robux: 550, base: 440, bonus: 110, price: 5.99 },
];

const faqs = [
  {
    q: "What are Robux?",
    a: "Robux is the in-experience currency on Roblox. Use them to buy upgrades for your avatar, special abilities in experiences, and more.",
  },
  {
    q: "Where are my Robux?",
    a: "After a successful purchase, your Robux balance is updated automatically. Refresh the page or sign out and back in if you don't see them.",
  },
  {
    q: "Do Robux expire?",
    a: "No. Robux do not expire as long as your Roblox account remains active and in good standing.",
  },
  {
    q: "How to redeem your gift card?",
    a: "Visit roblox.com/redeem, sign in to your account, and enter the PIN found on the back of your gift card.",
  },
];

const initialNotifs = [
  { id: 1, title: "Welcome bonus", body: "Buy any pack to claim a bonus today.", read: false },
  { id: 2, title: "Friend request", body: "Builderman wants to be your friend.", read: false },
  { id: 3, title: "Limited drop", body: "New avatar items just released.", read: false },
];

function RobuxIcon({ className = "size-4" }: { className?: string }) {
  return (
    <Hexagon
      className={className}
      strokeWidth={2.5}
      style={{ transform: "rotate(30deg)" }}
    />
  );
}

function FallingCoins() {
  const coins = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((_, i) => {
        const left = (i * 7.3) % 100;
        const delay = (i * 0.7) % 8;
        const duration = 8 + ((i * 1.3) % 6);
        return (
          <div
            key={i}
            className="absolute text-[color:var(--robux-glow)]/40"
            style={{
              left: `${left}%`,
              top: 0,
              animation: `fall ${duration}s linear ${delay}s infinite`,
            }}
          >
            <RobuxIcon className="size-4" />
          </div>
        );
      })}
    </div>
  );
}

type Toast = { id: number; title: string; body?: string; tone?: "success" | "info" | "error" };

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((s) => [...s, { id, ...t }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3200);
  };
  return { toasts, push };
}

function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto animate-float-up rounded-xl border border-border bg-surface/95 p-3 shadow-2xl backdrop-blur"
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                t.tone === "error"
                  ? "bg-destructive/20 text-destructive"
                  : "bg-[color:var(--robux-glow)]/20 text-[color:var(--robux-glow)]"
              }`}
            >
              {t.tone === "error" ? <X className="size-3.5" /> : <Check className="size-3.5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-xs text-muted-foreground">{t.body}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoinBurst({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);
  const coins = Array.from({ length: 12 });
  return (
    <div
      className="pointer-events-none fixed z-[55]"
      style={{ left: x, top: y }}
    >
      {coins.map((_, i) => {
        const angle = (i / coins.length) * Math.PI * 2;
        const dx = Math.cos(angle) * (60 + (i % 4) * 12);
        const dy = Math.sin(angle) * (60 + (i % 4) * 12);
        return (
          <span
            key={i}
            className="absolute text-[color:var(--robux-glow)]"
            style={{
              left: 0,
              top: 0,
              animation: "burst 0.9s cubic-bezier(0.22,1,0.36,1) forwards",
              ["--bx" as string]: `${dx}px`,
              ["--by" as string]: `${dy}px`,
            }}
          >
            <RobuxIcon className="size-4" />
          </span>
        );
      })}
    </div>
  );
}

function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [balance, setBalance] = useState<number>(0);
  const [activeNav, setActiveNav] = useState<string>("Robux");
  const [activeSide, setActiveSide] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifs);
  const [showNotifs, setShowNotifs] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [pendingBuy, setPendingBuy] = useState<{ pack: Pack; x: number; y: number } | null>(null);
  const balanceRef = useRef<HTMLSpanElement | null>(null);
  const [pulseBalance, setPulseBalance] = useState(false);
  const { toasts, push } = useToasts();

  // Persist balance
  useEffect(() => {
    const saved = Number(localStorage.getItem("robux_balance") || "0");
    if (!Number.isNaN(saved)) setBalance(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("robux_balance", String(balance));
  }, [balance]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter(
      (p) =>
        p.robux.toString().includes(q) ||
        p.price.toString().includes(q) ||
        ("robux".includes(q) && q.length > 1),
    );
  }, [search]);

  const triggerBurst = (e: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
  };

  const animateBalance = () => {
    setPulseBalance(true);
    setTimeout(() => setPulseBalance(false), 700);
  };

  const handleBuy = (p: Pack, e: React.MouseEvent) => {
    setPendingBuy({ pack: p, x: e.clientX, y: e.clientY });
  };

  const confirmBuy = () => {
    if (!pendingBuy) return;
    const { pack, x, y } = pendingBuy;
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x, y }]);
    setBalance((b) => b + pack.robux);
    animateBalance();
    push({
      title: "Purchase complete",
      body: `+${pack.robux.toLocaleString()} Robux added to your balance`,
    });
    setPendingBuy(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
        <a href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="grid size-8 place-items-center rounded-md bg-foreground text-background">
            <Hexagon className="size-4" strokeWidth={3} />
          </span>
          <span className="hidden sm:inline">ROBLOX</span>
        </a>
        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {topMenu.map((l) => (
            <button
              key={l}
              onClick={() => {
                setActiveNav(l);
                push({ title: l, body: `Switched to ${l}` });
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeNav === l
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </nav>
        <div className="relative ml-auto hidden max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages, price..."
            className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-9 text-sm outline-none transition-colors focus:border-[color:var(--robux-glow)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              onClick={() => {
                setShowHelp((s) => !s);
                setShowNotifs(false);
                setShowSettings(false);
              }}
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <HelpCircle className="size-5" />
            </button>
            {showHelp && (
              <Dropdown onClose={() => setShowHelp(false)}>
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Help
                </p>
                {["Support center", "Report a bug", "Community guidelines"].map((x) => (
                  <button
                    key={x}
                    onClick={() => {
                      push({ title: x, body: "Opening..." });
                      setShowHelp(false);
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-hover"
                  >
                    {x}
                  </button>
                ))}
              </Dropdown>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs((s) => !s);
                setShowHelp(false);
                setShowSettings(false);
              }}
              className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <Dropdown onClose={() => setShowNotifs(false)} wide>
                <div className="flex items-center justify-between px-3 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notifications
                  </p>
                  <button
                    onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}
                    className="text-xs font-semibold text-[color:var(--robux-glow)] hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 space-y-1 overflow-auto">
                  {notifs.length === 0 && (
                    <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                      You're all caught up
                    </p>
                  )}
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className={`group flex items-start gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-surface-hover ${
                        n.read ? "opacity-60" : ""
                      }`}
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                          n.read ? "bg-muted-foreground/40" : "bg-[color:var(--robux-glow)]"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotifs((s) => s.filter((x) => x.id !== n.id))
                        }
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </Dropdown>
            )}
          </div>

          <div className={`hidden items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold transition-transform sm:flex ${pulseBalance ? "scale-110" : ""}`}>
            <RobuxIcon className="size-4 text-[color:var(--robux-glow)]" />
            <span ref={balanceRef} className={pulseBalance ? "glow-text" : ""}>
              {balance.toLocaleString()}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowSettings((s) => !s);
                setShowHelp(false);
                setShowNotifs(false);
              }}
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <Settings className="size-5" />
            </button>
            {showSettings && (
              <Dropdown onClose={() => setShowSettings(false)}>
                <button
                  onClick={() => {
                    setBalance(0);
                    push({ title: "Balance reset", body: "Robux balance set to 0" });
                    setShowSettings(false);
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-hover"
                >
                  Reset balance
                </button>
                <button
                  onClick={() => {
                    setNotifs(initialNotifs);
                    push({ title: "Notifications restored" });
                    setShowSettings(false);
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-hover"
                >
                  Restore notifications
                </button>
              </Dropdown>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-background/60 p-3 lg:block">
          <div className="mb-3 flex items-center gap-2 rounded-lg p-2">
            <div className="grid size-8 place-items-center rounded-full bg-surface text-muted-foreground">
              <HelpCircle className="size-4" />
            </div>
            <span className="text-sm text-muted-foreground">Not logged in</span>
          </div>
          <nav className="space-y-0.5">
            {navTop.map(({ label, icon: Icon, badge }, i) => {
              const isActive = activeSide === label;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setActiveSide(label);
                    push({ title: label, body: `Opened ${label}` });
                  }}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className={`animate-float-up group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-surface text-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 transition-transform group-hover:scale-110" />
                  <span className="flex-1 text-left">{label}</span>
                  {badge && (
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted-foreground group-hover:bg-background">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="relative flex-1 px-4 py-8 md:px-10 md:py-12">
          <FallingCoins />

          {/* Balance / Send button */}
          <div className="relative mx-auto mb-10 flex max-w-3xl justify-end">
            <div className={`flex items-center gap-2 rounded-full border border-border bg-surface/80 p-1 pl-4 backdrop-blur animate-float-up transition-transform ${pulseBalance ? "scale-105" : ""}`}>
              <RobuxIcon className="size-4 text-[color:var(--robux-glow)]" />
              <span className={`text-sm font-semibold ${pulseBalance ? "glow-text" : ""}`}>
                {balance.toLocaleString()}
              </span>
              <button
                onClick={() => setShowSend(true)}
                className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-background transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="size-3.5" /> Send
              </button>
            </div>
          </div>

          {/* Hero */}
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--robux-glow)]/30 bg-[color:var(--robux-glow)]/10 px-4 py-1.5 text-xs font-semibold text-[color:var(--robux-glow)] animate-float-up">
              <Sparkles className="size-3.5" /> Limited bonus offer
            </div>
            <h1
              className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl animate-float-up"
              style={{ animationDelay: "120ms" }}
            >
              Enjoy up to{" "}
              <span className="robux-gradient glow-text">25% more</span>
              <br />
              Robux
            </h1>
            <p
              className="mx-auto mt-4 max-w-md text-sm text-muted-foreground md:text-base animate-float-up"
              style={{ animationDelay: "240ms" }}
            >
              Power up your avatar, unlock new experiences, and grab a bigger
              bundle on every pack you buy.
            </p>
          </div>

          {/* Packages */}
          <section className="relative mx-auto mt-14 max-w-3xl">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-xl font-bold">Robux packages</h2>
              <span className="text-xs text-muted-foreground">
                {filteredPackages.length} of {packages.length} packages
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur">
              {filteredPackages.length === 0 && (
                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No packages match your search.
                </p>
              )}
              {filteredPackages.map((p, i) => (
                <div
                  key={p.price}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="row-hover animate-float-up flex items-center gap-3 border-b border-border/60 px-4 py-4 last:border-0 md:gap-6 md:px-6"
                >
                  <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-1.5 text-lg font-bold">
                      <RobuxIcon className="size-4 text-[color:var(--robux-glow)]" />
                      {p.robux.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground line-through">
                      <RobuxIcon className="size-3.5" />
                      {p.base.toLocaleString()}
                    </div>
                    <div className="rounded-full bg-[color:var(--robux-glow)]/15 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--robux-glow)]">
                      + {p.bonus.toLocaleString()} more
                    </div>
                    {p.featured && (
                      <div className="hidden rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background sm:inline-block">
                        Best value
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleBuy(p, e)}
                    className={`relative overflow-hidden rounded-full px-5 py-2 text-sm font-bold transition-transform hover:scale-105 active:scale-95 ${
                      p.featured
                        ? "bg-foreground text-background animate-pulse-glow"
                        : "bg-surface-hover text-foreground hover:bg-foreground hover:text-background"
                    }`}
                  >
                    <span className="relative z-10">${p.price}</span>
                    <span className="absolute inset-0 animate-shimmer" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="relative mx-auto mt-16 max-w-3xl">
            <h2 className="mb-5 text-xl font-bold">FAQ</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur">
              {faqs.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={f.q} className="border-b border-border/60 last:border-0">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition-colors hover:bg-surface-hover md:px-6"
                    >
                      {f.q}
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </button>
                    <div
                      className="grid overflow-hidden text-sm text-muted-foreground transition-[grid-template-rows] duration-300"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0">
                        <p className="px-5 pb-5 md:px-6">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
              When you buy Robux you receive only a limited, non-refundable,
              non-transferable, revocable license to use Robux, which has no
              value in real currency.
            </p>
            <p className="mt-6 border-t border-border pt-6 text-xs text-muted-foreground">
              ©2026 Roblox-style demo. Built with Lovable.
            </p>
          </section>
        </main>
      </div>

      {showSend && (
        <SendDialog
          balance={balance}
          onClose={() => setShowSend(false)}
          onSend={(to, amount) => {
            setBalance((b) => b - amount);
            animateBalance();
            push({
              title: "Robux sent",
              body: `${amount.toLocaleString()} Robux sent to @${to}`,
            });
            setShowSend(false);
          }}
          onError={(msg) => push({ title: "Cannot send", body: msg, tone: "error" })}
        />
      )}

      {pendingBuy && (
        <BuyConfirmDialog
          pack={pendingBuy.pack}
          onCancel={() => setPendingBuy(null)}
          onConfirm={confirmBuy}
        />
      )}

      {bursts.map((b) => (
        <CoinBurst
          key={b.id}
          x={b.x}
          y={b.y}
          onDone={() => setBursts((s) => s.filter((x) => x.id !== b.id))}
        />
      ))}

      <Toaster toasts={toasts} />
    </div>
  );
}

function Dropdown({
  children,
  onClose,
  wide,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className={`absolute right-0 top-full z-50 mt-2 origin-top-right animate-slide-down rounded-xl border border-border bg-surface/95 p-2 shadow-2xl backdrop-blur ${
        wide ? "w-80" : "w-56"
      }`}
    >
      {children}
    </div>
  );
}

function BuyConfirmDialog({
  pack,
  onCancel,
  onConfirm,
}: {
  pack: Pack;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  const handleConfirm = () => {
    if (processing) return;
    setProcessing(true);
    setTimeout(() => onConfirm(), 1200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (processing) return;
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") handleConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const total = pack.base + pack.bonus;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !processing && onCancel()}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-bold">Confirm purchase</h3>
          <button
            onClick={onCancel}
            disabled={processing}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm text-muted-foreground">
            {processing
              ? "Processing your purchase..."
              : "You are about to purchase the following Robux pack:"}
          </p>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <RobuxIcon className="size-5 text-[color:var(--robux-glow)]" />
              <div>
                <div className="text-base font-bold">
                  {total.toLocaleString()} Robux
                </div>
                <div className="text-xs text-muted-foreground">
                  {pack.base.toLocaleString()} + {pack.bonus.toLocaleString()} bonus
                </div>
              </div>
            </div>
            <div className="text-lg font-black">${pack.price}</div>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            By continuing you agree that Robux are non-refundable and have no real
            currency value.
          </p>
        </div>
        <div className="flex gap-2 border-t border-border bg-surface/30 px-5 py-4">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {processing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Confirm ${pack.price}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; id: number; name: string; displayName: string; avatarUrl: string | null }
  | { status: "not_found" }
  | { status: "error"; message: string };

function SendDialog({
  balance,
  onClose,
  onSend,
  onError,
}: {
  balance: number;
  onClose: () => void;
  onSend: (to: string, amount: number) => void;
  onError: (msg: string) => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const [sending, setSending] = useState(false);
  const lookupFn = useServerFn(lookupRobloxUser);
  const reqId = useRef(0);

  // Debounced Roblox username lookup
  useEffect(() => {
    const trimmed = to.trim().replace(/^@/, "");
    if (!trimmed) {
      setLookup({ status: "idle" });
      return;
    }
    setLookup({ status: "loading" });
    const myReq = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const res = await lookupFn({ data: { username: trimmed } });
        if (myReq !== reqId.current) return;
        if (res.found) {
          setLookup({
            status: "found",
            id: res.id,
            name: res.name,
            displayName: res.displayName,
            avatarUrl: res.avatarUrl,
          });
        } else {
          setLookup({ status: "not_found" });
        }
      } catch {
        if (myReq !== reqId.current) return;
        setLookup({ status: "error", message: "Lookup failed" });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [to, lookupFn]);

  const submit = () => {
    if (sending) return;
    const n = Number(amount);
    if (lookup.status !== "found") return onError("Enter a valid Roblox username.");
    if (!n || n <= 0) return onError("Enter a valid amount.");
    if (n > balance) return onError("Insufficient Robux balance.");
    setSending(true);
    setTimeout(() => onSend(lookup.name, n), 1200);
  };

  const canSend =
    !sending &&
    lookup.status === "found" &&
    Number(amount) > 0 &&
    Number(amount) <= balance;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 px-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !sending && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-scale-in rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Send Robux</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Available balance:{" "}
              <span className="font-semibold text-foreground">
                {balance.toLocaleString()}
              </span>{" "}
              Robux
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>
        <label className="mb-2 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Recipient Roblox username
          </span>
          <div className="relative">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="@username"
              autoComplete="off"
              spellCheck={false}
              className={`h-11 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none transition-colors focus:border-[color:var(--robux-glow)] ${
                lookup.status === "not_found" || lookup.status === "error"
                  ? "border-destructive/60"
                  : lookup.status === "found"
                  ? "border-[color:var(--robux-glow)]/60"
                  : "border-border"
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {lookup.status === "loading" && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              {lookup.status === "found" && (
                <Check className="size-4 text-[color:var(--robux-glow)]" />
              )}
              {(lookup.status === "not_found" || lookup.status === "error") && (
                <AlertCircle className="size-4 text-destructive" />
              )}
            </div>
          </div>
        </label>

        {/* Lookup result */}
        <div className="mb-4 min-h-[58px]">
          {lookup.status === "found" && (
            <div className="animate-scale-in flex items-center gap-3 rounded-lg border border-[color:var(--robux-glow)]/30 bg-[color:var(--robux-glow)]/5 p-2.5">
              {lookup.avatarUrl ? (
                <img
                  src={lookup.avatarUrl}
                  alt={lookup.name}
                  className="size-10 rounded-full bg-surface-hover object-cover"
                />
              ) : (
                <div className="grid size-10 place-items-center rounded-full bg-surface-hover">
                  <User className="size-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{lookup.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  @{lookup.name} · ID {lookup.id}
                </p>
              </div>
              <Check className="size-4 shrink-0 text-[color:var(--robux-glow)]" />
            </div>
          )}
          {lookup.status === "not_found" && (
            <p className="animate-fade-in flex items-center gap-2 px-1 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              No Roblox user found with that username.
            </p>
          )}
          {lookup.status === "error" && (
            <p className="animate-fade-in flex items-center gap-2 px-1 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              {lookup.message}
            </p>
          )}
          {lookup.status === "loading" && (
            <p className="animate-fade-in flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Searching Roblox...
            </p>
          )}
        </div>

        <label className="mb-2 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Amount
          </span>
          <div className="relative">
            <RobuxIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--robux-glow)]" />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              inputMode="numeric"
              className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-20 text-sm outline-none transition-colors focus:border-[color:var(--robux-glow)]"
            />
            <button
              onClick={() => setAmount(String(balance))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-surface-hover px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground"
            >
              MAX
            </button>
          </div>
        </label>
        <div className="mb-5 flex flex-wrap gap-2">
          {[100, 500, 1000, 5000].map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="rounded-full bg-surface-hover px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              +{q.toLocaleString()}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!canSend}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-bold text-background transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending Robux...
            </>
          ) : (
            <>
              <Send className="size-4" /> Send Robux
            </>
          )}
        </button>
      </div>
    </div>
  );
}
