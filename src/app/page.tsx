import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Github,
  Map,
  ShieldCheck,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Live fleet map",
    body: "Every vehicle on one map with real-time position, movement state, and instant drill-down into any driver.",
  },
  {
    icon: Activity,
    title: "Telemetry at a glance",
    body: "Speed, status, and activity streamed into a dashboard built for operations rooms, not spreadsheets.",
  },
  {
    icon: Users,
    title: "Drivers & organizations",
    body: "Multi-tenant by design — organizations, roles, and driver records with strict per-org isolation.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Clerk authentication, role-gated tRPC procedures, rate limiting, and hardened security headers.",
  },
];

const VEHICLES = [
  { id: "FP-102", status: "MOVING", speed: "87 km/h", color: "oklch(0.62 0.18 250)" },
  { id: "FP-215", status: "ONLINE", speed: "0 km/h", color: "oklch(0.68 0.17 155)" },
  { id: "FP-078", status: "IDLE", speed: "0 km/h", color: "oklch(0.70 0.15 75)" },
];

const STACK = ["Next.js 16", "React 19", "tRPC", "Prisma", "PostgreSQL", "Redis", "Clerk"];

export default function Home() {
  return (
    <div
      className="relative min-h-screen overflow-hidden font-sans text-[oklch(0.92_0.01_240)]"
      style={{ backgroundColor: "oklch(0.11 0.018 250)" }}
    >
      {/* Atmosphere: grid, glows, noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.03) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.45 0.18 250 / 0.35), oklch(0.65 0.15 195 / 0.12) 60%, transparent)",
        }}
      />
      <div className="noise-texture relative">
        {/* Nav */}
        <header className="landing-rise mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/fleet_pulse_logo.webp"
              alt="FleetPulse"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="text-lg font-semibold tracking-tight">
              Fleet<span className="text-[oklch(0.72_0.14_195)]">Pulse</span>
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-full px-4 py-2 text-sm text-[oklch(0.75_0.01_240)] transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-full bg-[oklch(0.62_0.18_250)] px-4 py-2 text-sm font-medium text-[oklch(0.12_0.02_250)] transition-all hover:bg-[oklch(0.68_0.18_250)]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <main className="mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <section>
            <p
              className="landing-rise flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-[oklch(0.72_0.14_195)]"
              style={{ animationDelay: "0.08s" }}
            >
              <span className="live-blink inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.68_0.17_155)]" />
              REAL-TIME FLEET OPERATIONS
            </p>
            <h1
              className="landing-rise mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
              style={{ animationDelay: "0.16s" }}
            >
              Every vehicle.
              <br />
              One pulse.
            </h1>
            <p
              className="landing-rise mt-6 max-w-md text-lg leading-8 text-[oklch(0.65_0.01_240)]"
              style={{ animationDelay: "0.24s" }}
            >
              FleetPulse turns scattered GPS pings into a living operations
              picture — vehicles, drivers, and organizations monitored from a
              single command surface.
            </p>
            <div
              className="landing-rise mt-9 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "0.32s" }}
            >
              <Link
                href="/sign-in"
                className="group flex items-center gap-2 rounded-full bg-[oklch(0.62_0.18_250)] px-6 py-3 font-medium text-[oklch(0.12_0.02_250)] shadow-[0_0_40px_oklch(0.62_0.18_250_/_0.35)] transition-all hover:bg-[oklch(0.68_0.18_250)] hover:shadow-[0_0_56px_oklch(0.62_0.18_250_/_0.5)]"
              >
                Enter the control room
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com/vitoriovarbanov/fleet-pulse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-[oklch(0.26_0.02_250)] px-6 py-3 text-[oklch(0.75_0.01_240)] transition-colors hover:border-[oklch(0.4_0.02_250)] hover:text-white"
              >
                <Github className="h-4 w-4" />
                View source
              </a>
            </div>
            <dl
              className="landing-rise mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-[oklch(0.22_0.015_250)] pt-6 font-mono"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                ["<1s", "position latency"],
                ["24/7", "live monitoring"],
                ["multi", "tenant orgs"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="order-last mt-1 text-[11px] uppercase tracking-wider text-[oklch(0.55_0.01_250)]">
                    {label}
                  </dt>
                  <dd className="text-2xl text-[oklch(0.72_0.14_195)]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Telemetry panel */}
          <section
            className="landing-rise gradient-border glass-card relative rounded-2xl p-1"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="rounded-xl bg-[oklch(0.13_0.02_250_/_0.85)]">
              <div className="flex items-center justify-between border-b border-[oklch(0.22_0.015_250)] px-5 py-3 font-mono text-[11px] tracking-widest text-[oklch(0.55_0.01_250)]">
                <span>LIVE FLEET VIEW</span>
                <span className="flex items-center gap-2 text-[oklch(0.68_0.17_155)]">
                  <span className="live-blink h-1.5 w-1.5 rounded-full bg-[oklch(0.68_0.17_155)]" />
                  CONNECTED
                </span>
              </div>
              <svg viewBox="0 0 480 300" className="w-full" role="img" aria-label="Stylized live fleet map">
                <defs>
                  <linearGradient id="route-a" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.62 0.18 250)" stopOpacity="0" />
                    <stop offset="100%" stopColor="oklch(0.62 0.18 250)" />
                  </linearGradient>
                </defs>
                {/* faint street grid */}
                {[60, 130, 200, 260].map((y) => (
                  <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="oklch(0.22 0.015 250)" strokeWidth="1" />
                ))}
                {[90, 190, 300, 400].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="oklch(0.22 0.015 250)" strokeWidth="1" />
                ))}
                {/* routes */}
                <path
                  d="M 20 250 C 120 240, 150 150, 250 140 S 430 80, 460 40"
                  fill="none"
                  stroke="url(#route-a)"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <path
                  d="M 20 250 C 120 240, 150 150, 250 140 S 430 80, 460 40"
                  fill="none"
                  stroke="oklch(0.72 0.14 195)"
                  strokeWidth="2"
                  className="route-flow"
                />
                <path
                  d="M 40 60 C 120 80, 220 60, 300 120 S 420 220, 460 240"
                  fill="none"
                  stroke="oklch(0.62 0.18 250 / 0.4)"
                  strokeWidth="2"
                  className="route-flow"
                  style={{ animationDelay: "0.8s" }}
                />
                {/* vehicle markers with radar pings */}
                {[
                  { cx: 250, cy: 140, color: "oklch(0.62 0.18 250)" },
                  { cx: 300, cy: 120, color: "oklch(0.68 0.17 155)" },
                  { cx: 120, cy: 243, color: "oklch(0.70 0.15 75)" },
                ].map((m, i) => (
                  <g key={i}>
                    <circle cx={m.cx} cy={m.cy} r="6" fill={m.color} opacity="0.35" className="radar-ping" style={{ animationDelay: `${i * 0.7}s` }} />
                    <circle cx={m.cx} cy={m.cy} r="4" fill={m.color} />
                    <circle cx={m.cx} cy={m.cy} r="1.5" fill="oklch(0.12 0.02 250)" />
                  </g>
                ))}
              </svg>
              <ul className="space-y-1 border-t border-[oklch(0.22_0.015_250)] p-3 font-mono text-xs">
                {VEHICLES.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[oklch(0.18_0.02_250)]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v.color }} />
                      <span className="text-[oklch(0.85_0.01_240)]">{v.id}</span>
                    </span>
                    <span className="text-[oklch(0.55_0.01_250)]">{v.status}</span>
                    <span className="text-[oklch(0.72_0.14_195)]">{v.speed}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className="landing-rise glass-card group rounded-2xl p-6 transition-transform hover:-translate-y-1"
                style={{ animationDelay: `${0.45 + i * 0.08}s` }}
              >
                <f.icon className="h-5 w-5 text-[oklch(0.72_0.14_195)] transition-transform group-hover:scale-110" />
                <h2 className="mt-4 font-semibold tracking-tight">{f.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[oklch(0.62_0.01_240)]">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[oklch(0.2_0.015_250)]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
            <p className="font-mono text-[11px] tracking-widest text-[oklch(0.5_0.01_250)]">
              {STACK.join("  ·  ")}
            </p>
            <a
              href="https://github.com/vitoriovarbanov/fleet-pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[oklch(0.6_0.01_240)] transition-colors hover:text-white"
            >
              <Github className="h-4 w-4" />
              vitoriovarbanov/fleet-pulse
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
