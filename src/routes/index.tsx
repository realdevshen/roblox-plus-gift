import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

const packages = [
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
        const size = 14 + ((i * 3) % 18);
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
            <RobuxIcon className={`size-[${size}px]`} />
          </div>
        );
      })}
    </div>
  );
}

function Index() {
  const [open, setOpen] = useState<number | null>(0);

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
          {["Home", "Charts", "Marketplace", "Create", "Robux"].map((l) => (
            <a
              key={l}
              href="#"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="relative ml-auto hidden max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search"
            className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-4 text-sm outline-none transition-colors focus:border-[color:var(--robux-glow)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <HelpCircle className="size-5" />
          </button>
          <button className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              34
            </span>
          </button>
          <div className="hidden items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold sm:flex">
            <RobuxIcon className="size-4" />
            <span>0</span>
          </div>
          <button className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <Settings className="size-5" />
          </button>
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
            {navTop.map(({ label, icon: Icon, badge }, i) => (
              <a
                key={label}
                href="#"
                style={{ animationDelay: `${i * 30}ms` }}
                className="animate-float-up group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-surface hover:text-foreground"
              >
                <Icon className="size-4 transition-transform group-hover:scale-110" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted-foreground group-hover:bg-background">
                    {badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="relative flex-1 px-4 py-8 md:px-10 md:py-12">
          <FallingCoins />

          {/* Balance / Send button */}
          <div className="relative mx-auto mb-10 flex max-w-3xl justify-end">
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface/80 p-1 pl-4 backdrop-blur animate-float-up">
              <RobuxIcon className="size-4" />
              <span className="text-sm font-semibold">0</span>
              <button className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-background transition-transform hover:scale-105 active:scale-95">
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
              <span className="text-xs text-muted-foreground">Bonus included</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur">
              {packages.map((p, i) => (
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
                const isOpen = open === i;
                return (
                  <div key={f.q} className="border-b border-border/60 last:border-0">
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
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
              value in real currency. By selecting the Premium subscription
              package, (1) you agree that you are over 18 and that you authorize
              us to charge your account every month until you cancel the
              subscription, and (2) you represent that you understand and agree
              to the Terms of Use, which includes an agreement to arbitrate any
              dispute between you and Roblox, and Privacy Policy.
            </p>
            <p className="mt-6 border-t border-border pt-6 text-xs text-muted-foreground">
              ©2026 Roblox-style demo. Built with Lovable. Roblox, the Roblox
              logo and Powering Imagination are trademarks of Roblox Corporation.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
