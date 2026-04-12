import Image from "next/image";
import Link from "next/link";
import { Manrope, Sora } from "next/font/google";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Leaf,
  MessageSquareText,
  Sparkles,
  Watch,
  Zap,
} from "lucide-react";
import ScrollReveal from "@/src/components/landing/ScrollReveal";

const sora = Sora({ subsets: ["latin"], weight: ["500", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const navigation = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#use-now" },
  { label: "Pricing", href: "#cta" },
];

const stats = [
  { value: "1.2M+", label: "AI-generated plans" },
  { value: "450K", label: "Active users" },
  { value: "85M", label: "Health metrics tracked" },
];

const previewPoints = [
  {
    title: "Dynamic Micronutrient Radar",
    description: "Visual feedback on vitamin and mineral levels in real-time.",
  },
  {
    title: "Predictive Hunger Modeling",
    description: "AI predicts glucose dips and hunger waves before they hit.",
  },
];

const partnerNames = ["VITAL", "BIO-STRATEGY", "PEAK HUMAN", "NEURALABS", "ZENITH"];

const footerGroups = [
  {
    title: "Product",
    items: ["Features", "How It Works", "Integrations"],
  },
  {
    title: "Resources",
    items: ["Newsletter", "Health Guides", "Case Studies"],
  },
  {
    title: "Company",
    items: ["Contact", "About Us", "Careers"],
  },
  {
    title: "Legal",
    items: ["Privacy Policy", "Terms of Service"],
  },
];

const brainCircuitPaths = [
  { d: "M288 54H248V74H214V104H188V142H206V172H228V206H248V246H286", soft: false },
  { d: "M286 76H262V96H234V126H222V156H242V186H262V228H286", soft: true },
  { d: "M286 98H250V116H236V142H252V166H270V196H286", soft: false },
  { d: "M286 120H266V138H282V158H286", soft: true },
  { d: "M286 146H258V164H238V194H220V226H206V248H186", soft: false },
  { d: "M286 172H250V192H236V220H222V252H208", soft: true },
  { d: "M286 198H266V214H248V238H232V260H218", soft: false },
  { d: "M286 224H258V242H246V264H236", soft: true },
  { d: "M252 54V84H232V118H208V150H224V182H248V214H266V250", soft: false },
  { d: "M228 74V102H214V134H196V164H214V192H236V226", soft: true },
  { d: "M206 108V138H188V170H202V202H224", soft: false },
  { d: "M186 144V168H170V198H184V226", soft: true },
  { d: "M244 238H274V266H286", soft: false },
  { d: "M232 206H258V224H286", soft: true },
] as const;

const brainNodes = [
  { cx: 248, cy: 54, r: 4, delay: "" },
  { cx: 214, cy: 104, r: 4, delay: " landing-brain-node-delay" },
  { cx: 188, cy: 142, r: 4.5, delay: " landing-brain-node-late" },
  { cx: 228, cy: 206, r: 4.5, delay: "" },
  { cx: 248, cy: 246, r: 4.5, delay: " landing-brain-node-delay" },
  { cx: 262, cy: 96, r: 4, delay: " landing-brain-node-late" },
  { cx: 242, cy: 156, r: 4.5, delay: "" },
  { cx: 262, cy: 228, r: 4.5, delay: " landing-brain-node-delay" },
  { cx: 252, cy: 54, r: 4.5, delay: " landing-brain-node-late" },
  { cx: 208, cy: 150, r: 4, delay: "" },
  { cx: 236, cy: 220, r: 4, delay: " landing-brain-node-delay" },
  { cx: 186, cy: 248, r: 4.5, delay: " landing-brain-node-late" },
  { cx: 170, cy: 198, r: 4, delay: "" },
  { cx: 236, cy: 264, r: 4, delay: " landing-brain-node-delay" },
] as const;

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_20px_50px_-20px_rgba(52,211,153,0.75)] transition-transform duration-300 hover:scale-[0.98]";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/10";

export default function Home() {
  return (
    <main
      className={`${manrope.className} relative min-h-screen overflow-hidden bg-[#081120] text-slate-100`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(78,222,163,0.16),transparent_32%),radial-gradient(circle_at_85%_22%,rgba(107,216,203,0.1),transparent_18%),linear-gradient(180deg,#091121_0%,#0a1020_38%,#081120_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[linear-gradient(180deg,rgba(8,17,32,0)_0%,rgba(8,17,32,0.28)_40%,#081120_100%)]" />

      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-[#0d1628]/72 px-4 py-3 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-emerald-400/12 ring-1 ring-emerald-300/20">
              <Image
                src="/logo.png"
                alt="NutriGenie logo"
                width={40}
                height={40}
                className="h-8 w-8 object-cover"
              />
            </span>
            <span className={`${sora.className} text-lg font-semibold tracking-tight text-emerald-300`}>
              NutriGenie
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300 transition-colors hover:text-emerald-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition-colors hover:text-white sm:px-4"
            >
              Sign In
            </Link>
            <Link href="/dashboard" className={`${primaryButtonClass} px-4 py-2.5 text-xs sm:px-5`}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-[4.5rem] pt-32 text-center sm:px-6 lg:px-8 lg:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center">
          <div className="landing-orb-drift h-56 w-[32rem] rounded-full bg-emerald-400/8 blur-[130px]" />
        </div>

        <ScrollReveal className="relative z-10 mx-auto max-w-5xl" variant="up">
          <span className="mb-6 inline-flex text-[11px] font-semibold uppercase tracking-[0.34em] text-emerald-300">
            The Neural Vitality
          </span>
          <h1 className={`${sora.className} text-4xl font-semibold leading-[0.96] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl`}>
            Your Personal AI Nutritionist,
            <span className="block bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Perfected.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Harness the power of generative intelligence to craft biology-aligned meal
            plans, synchronized with your real-time biometric data and lifestyle goals.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard" className={primaryButtonClass}>
              Get Started
            </Link>
            <Link href="#use-now" className={secondaryButtonClass}>
              View Demo
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal
          className="relative z-10 mx-auto mt-[4.5rem] max-w-6xl"
          variant="zoom"
          delay={120}
        >
          <div className="absolute inset-x-12 -bottom-8 h-24 rounded-full bg-emerald-400/10 blur-[90px]" />
          <div className="landing-float absolute -left-2 top-8 hidden w-44 rounded-[1.4rem] border border-emerald-300/12 bg-[#0c1627]/80 p-4 text-left shadow-[0_24px_60px_-38px_rgba(78,222,163,0.55)] backdrop-blur-xl md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Metabolic sync
            </p>
            <p className={`${sora.className} mt-2 text-2xl font-semibold text-white`}>98%</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Live adaptation from nutrition and health inputs.
            </p>
          </div>
          <div className="landing-float-delayed absolute -right-2 bottom-10 hidden w-48 rounded-[1.4rem] border border-white/8 bg-[#111b2d]/78 p-4 text-left shadow-[0_24px_60px_-38px_rgba(0,0,0,0.8)] backdrop-blur-xl md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Nutrient map
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-white/8">
                <div className="landing-shimmer h-full w-3/4 rounded-full bg-[linear-gradient(90deg,#6ee7b7_0%,#2dd4bf_50%,#6ee7b7_100%)]" />
              </div>
              <span className="text-xs text-white">Live</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Dynamic meal planning with real-time AI signals.
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/10 bg-[#101a2b] shadow-[0_35px_120px_-48px_rgba(78,222,163,0.4)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,222,163,0.11),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.18))]" />
            <div className="absolute left-0 top-0 h-full w-[11%] bg-[linear-gradient(180deg,#243148_0%,#172132_100%)]" />
            <div className="absolute right-0 top-0 h-full w-[18%] bg-[linear-gradient(180deg,#203047_0%,#152131_100%)]" />
            <div className="absolute right-[5%] top-[16%] h-[60%] w-[5%] rounded-[1.4rem] bg-[#172435] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
            <div className="absolute left-[15%] right-[20%] top-[17%] bottom-[26%] overflow-hidden rounded-[1.6rem] border border-emerald-300/14 bg-[linear-gradient(180deg,rgba(17,31,46,0.92),rgba(11,20,32,0.97))]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(110,231,183,0.15),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.14))]" />
              <div className="landing-grid-flow absolute inset-0 opacity-25" />
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-r from-transparent via-amber-100/60 to-transparent blur-xl" />
              <div className="landing-scan-line absolute inset-x-[10%] top-[6%] h-10 bg-gradient-to-b from-transparent via-emerald-300/28 to-transparent blur-md" />

              <div className="landing-float absolute left-[6%] top-[10%] hidden w-[22%] rounded-[1.25rem] border border-white/8 bg-[#0f1a2a]/78 p-3 text-left backdrop-blur-lg md:block">
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  <Leaf className="h-3.5 w-3.5" />
                  Adaptive plans
                </div>
                <p className="mt-3 text-[11px] leading-5 text-slate-300">
                  Meals tuned to preferences, goals, and recovery signals.
                </p>
              </div>

              <div className="landing-float-delayed absolute right-[6%] top-[11%] hidden w-[24%] rounded-[1.25rem] border border-white/8 bg-[#10192a]/82 p-3 text-left backdrop-blur-lg md:block">
                <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span className="inline-flex items-center gap-2 text-cyan-200">
                    <Watch className="h-3.5 w-3.5" />
                    Health sync
                  </span>
                  <span className="text-emerald-300">Live</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/7">
                  <div className="landing-shimmer h-full w-4/5 rounded-full bg-[linear-gradient(90deg,#6ee7b7_0%,#2dd4bf_50%,#6ee7b7_100%)]" />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-slate-300">
                  Real-time input from wearable and biomarker data streams.
                </p>
              </div>

              <div className="absolute inset-x-[18%] top-[18%] bottom-[24%] rounded-[1.7rem] border border-emerald-300/10 bg-[radial-gradient(circle_at_50%_50%,rgba(110,231,183,0.08),rgba(8,17,32,0.18)_48%,rgba(8,17,32,0.74)_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                <div className="landing-brain-halo absolute inset-[18%] rounded-full bg-emerald-300/14 blur-3xl" />
                <div className="absolute inset-[12%] rounded-[2rem] border border-white/6 bg-[radial-gradient(circle_at_50%_50%,rgba(110,231,183,0.06),transparent_54%)]" />
                <svg
                  viewBox="0 0 600 320"
                  className="absolute inset-[6%] h-[88%] w-[88%]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="brainStroke" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#dffef4" />
                      <stop offset="42%" stopColor="#8bf7d0" />
                      <stop offset="100%" stopColor="#78e7ff" />
                    </linearGradient>
                    <linearGradient id="brainFill" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(16,185,129,0.16)" />
                      <stop offset="100%" stopColor="rgba(14,165,233,0.07)" />
                    </linearGradient>
                    <filter id="brainGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g opacity="0.18" stroke="url(#brainStroke)" strokeWidth="1.4">
                    {brainCircuitPaths.map((path) => (
                      <path key={`bg-left-${path.d}`} d={path.d} fill="none" />
                    ))}
                    <g transform="translate(600 0) scale(-1 1)">
                      {brainCircuitPaths.map((path) => (
                        <path key={`bg-right-${path.d}`} d={path.d} fill="none" />
                      ))}
                    </g>
                  </g>

                  <path
                    d="M290 42C262 34 224 42 194 58C164 74 142 100 130 130C118 160 121 196 132 224C145 257 170 279 202 292C232 304 266 298 290 276"
                    fill="none"
                    stroke="url(#brainStroke)"
                    strokeOpacity="0.55"
                    strokeWidth="5"
                    strokeLinecap="round"
                    filter="url(#brainGlow)"
                  />
                  <path
                    d="M310 42C338 34 376 42 406 58C436 74 458 100 470 130C482 160 479 196 468 224C455 257 430 279 398 292C368 304 334 298 310 276"
                    fill="none"
                    stroke="url(#brainStroke)"
                    strokeOpacity="0.55"
                    strokeWidth="5"
                    strokeLinecap="round"
                    filter="url(#brainGlow)"
                  />

                  <path
                    d="M292 54C262 48 228 56 198 74C170 92 150 118 141 148C132 178 135 208 146 234C158 260 180 278 206 288C232 298 264 293 286 274L293 54Z"
                    fill="url(#brainFill)"
                    opacity="0.7"
                  />
                  <path
                    d="M308 54C338 48 372 56 402 74C430 92 450 118 459 148C468 178 465 208 454 234C442 260 420 278 394 288C368 298 336 293 314 274L307 54Z"
                    fill="url(#brainFill)"
                    opacity="0.7"
                  />

                  <g stroke="url(#brainStroke)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" filter="url(#brainGlow)">
                    {brainCircuitPaths.map((path) => (
                      <path
                        key={`left-${path.d}`}
                        className={path.soft ? "landing-brain-link-soft" : "landing-brain-link"}
                        d={path.d}
                        fill="none"
                      />
                    ))}
                    <g transform="translate(600 0) scale(-1 1)">
                      {brainCircuitPaths.map((path) => (
                        <path
                          key={`right-${path.d}`}
                          className={path.soft ? "landing-brain-link-soft" : "landing-brain-link"}
                          d={path.d}
                          fill="none"
                        />
                      ))}
                    </g>
                    <path className="landing-brain-link" d="M292 54V270" fill="none" strokeOpacity="0.75" />
                    <path className="landing-brain-link-soft" d="M308 54V270" fill="none" strokeOpacity="0.75" />
                    <path className="landing-brain-link" d="M286 158H314" fill="none" />
                    <path className="landing-brain-link-soft" d="M286 224H314" fill="none" />
                  </g>

                  <g fill="#dffef4" filter="url(#brainGlow)">
                    {brainNodes.map((node) => (
                      <circle
                        key={`left-node-${node.cx}-${node.cy}`}
                        className={`landing-brain-node${node.delay}`}
                        cx={node.cx}
                        cy={node.cy}
                        r={node.r}
                      />
                    ))}
                    <g transform="translate(600 0) scale(-1 1)">
                      {brainNodes.map((node) => (
                        <circle
                          key={`right-node-${node.cx}-${node.cy}`}
                          className={`landing-brain-node${node.delay}`}
                          cx={node.cx}
                          cy={node.cy}
                          r={node.r}
                        />
                      ))}
                    </g>
                    <circle className="landing-brain-node" cx="300" cy="158" r="7" />
                    <circle className="landing-brain-node landing-brain-node-delay" cx="300" cy="224" r="6" />
                  </g>
                </svg>
              </div>

              <div className="absolute inset-x-[9%] bottom-[8%] grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-left">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Meal plans
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">Adaptive suggestions</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-left">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Health sync
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">Wearable feedback</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-left">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    AI coach
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">Always-on guidance</p>
                </div>
              </div>
            </div>
            <div className="absolute left-[17%] right-[18%] bottom-[22%] h-[7%] rounded-t-[0.8rem] bg-[linear-gradient(90deg,#f7d9b9_0%,#d1a978_48%,#f3ddc7_100%)] opacity-80" />
            <div className="absolute left-[19%] right-[20%] bottom-[15%] h-[13%] rounded-[1.1rem] bg-[linear-gradient(180deg,#182537_0%,#101a29_100%)] shadow-[0_-18px_45px_rgba(0,0,0,0.45)]" />
            <div className="absolute left-[33%] bottom-[18.8%] h-[4.5%] w-[16%] rounded-full border border-white/8 bg-[#0d1826]" />
            <div className="absolute left-[51%] bottom-[18.8%] h-[4.5%] w-[12%] rounded-full border border-white/8 bg-[#0d1826]" />
            <div className="absolute bottom-[5.5%] left-[18%] h-[4.5rem] w-[4.5rem] rounded-full bg-emerald-400/18 blur-sm" />
            <div className="absolute bottom-[7%] left-[18.5%] h-14 w-14 rounded-full bg-gradient-to-br from-emerald-300 to-green-500 shadow-[0_14px_35px_rgba(16,185,129,0.3)]" />
            <div className="absolute bottom-[4.5%] left-[52%] h-[5.5rem] w-[5.5rem] rounded-full bg-emerald-300/14 blur-sm" />
            <div className="absolute bottom-[6.2%] left-[53%] h-16 w-16 rounded-full bg-gradient-to-br from-emerald-300 to-green-500 shadow-[0_14px_35px_rgba(16,185,129,0.28)]" />
            <div className="absolute bottom-[8%] right-[12%] h-14 w-3 rounded-full bg-[#2e4458]" />
            <div className="absolute bottom-[8%] right-[15.5%] h-16 w-3 rounded-full bg-[#31475d]" />
          </div>
        </ScrollReveal>
      </section>

      <section className="border-y border-white/6 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 text-center sm:grid-cols-3 sm:px-8">
          {stats.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 90} variant="up">
              <p className={`${sora.className} text-3xl font-semibold text-emerald-300 sm:text-4xl`}>
                {item.value}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {item.label}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
        <ScrollReveal className="mb-14" variant="up">
          <span className="mb-4 inline-flex text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Capabilities
          </span>
          <h2 className={`${sora.className} max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl`}>
            Next-Gen Biological Intelligence
          </h2>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-12">
          <ScrollReveal className="md:col-span-8" variant="left">
          <article className="group relative overflow-hidden rounded-[2rem] border border-white/7 bg-white/[0.04] p-7 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.9)] md:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(78,222,163,0.12),transparent_36%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-300/14">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className={`${sora.className} text-2xl font-semibold text-white sm:text-3xl`}>
                Adaptive Meal Planning
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Our neural network learns your flavor profile and inflammatory triggers
                to suggest meals that heal from within.
              </p>

              <div className="relative mt-10 h-44 overflow-hidden rounded-[1.6rem] border border-white/6 bg-[linear-gradient(135deg,#24313b_0%,#111722_100%)] transition-all duration-500 sm:h-52">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(110,231,183,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.24))]" />
                <div className="landing-grid-flow absolute inset-0 opacity-20" />
                <div className="landing-orb-drift absolute left-[18%] top-[20%] h-24 w-24 rounded-full bg-emerald-300/10 blur-xl" />
                <div className="landing-orb-drift absolute right-[14%] bottom-[14%] h-20 w-20 rounded-full bg-cyan-300/10 blur-xl" />
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-r from-transparent via-emerald-200/35 to-transparent blur-lg" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.88),rgba(255,255,255,0.12)_28%,rgba(15,23,42,0.12)_30%,rgba(17,24,39,0.9)_62%)] shadow-[0_0_0_24px_rgba(255,255,255,0.05)]">
                  <div className="landing-pulse-ring absolute inset-3 rounded-full border border-emerald-300/28" />
                </div>
                <div className="landing-float absolute left-[16%] top-[22%] h-8 w-20 rounded-full bg-emerald-100/24 blur-[1px]" />
                <div className="landing-float-delayed absolute left-[26%] top-[58%] h-6 w-10 rounded-full bg-amber-100/20 blur-[1px]" />
                <div className="landing-float absolute right-[18%] top-[30%] h-9 w-14 rounded-full bg-lime-100/22 blur-[1px]" />
                <div className="landing-float-delayed absolute right-[26%] top-[60%] h-7 w-7 rounded-full bg-red-100/18 blur-[1px]" />
                <div className="landing-float absolute left-[44%] top-[34%] h-12 w-12 rounded-full bg-white/22 blur-[1px]" />
                <div className="absolute inset-x-[18%] bottom-[12%] h-3 rounded-full bg-white/6" />
              </div>
            </div>
          </article>
          </ScrollReveal>

          <ScrollReveal className="md:col-span-4" variant="right" delay={100}>
          <article className="relative overflow-hidden rounded-[2rem] border border-white/7 bg-white/[0.06] p-7 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.9)] md:p-9">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/10">
              <Watch className="h-5 w-5" />
            </div>
            <h3 className={`${sora.className} text-2xl font-semibold text-white`}>Real-time Health Sync</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Continuous integration with Oura, Apple Health, and WHOOP for dynamic
              adjustment.
            </p>
            <div className="mt-10 flex justify-end text-cyan-200/10">
              <ArrowRight className="h-20 w-20" />
            </div>
          </article>
          </ScrollReveal>

          <ScrollReveal className="md:col-span-4" variant="left" delay={140}>
          <article className="rounded-[2rem] border border-white/7 bg-white/[0.06] p-7 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.9)] md:p-9">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-300/10 text-indigo-200 ring-1 ring-indigo-200/10">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className={`${sora.className} text-2xl font-semibold text-white`}>Biometric Analysis</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Deep-tissue insights extrapolated from genetic data and blood biomarkers.
            </p>
          </article>
          </ScrollReveal>

          <ScrollReveal className="md:col-span-8" variant="right" delay={220}>
          <article className="overflow-hidden rounded-[2rem] border border-white/7 bg-white/[0.04] p-7 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.9)] md:p-9">
            <div className="grid gap-8 md:grid-cols-[0.94fr,1.06fr] md:items-center">
              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-300/14">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <h3 className={`${sora.className} text-2xl font-semibold text-white`}>
                  24/7 Virtual Coach
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Immediate answers to cravings, dining out choices, and macronutrient
                  balancing whenever you need it.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[1.6rem] border border-emerald-300/10 bg-[#071425] p-5">
                <div className="landing-orb-drift absolute -right-3 -top-4 h-20 w-20 rounded-full bg-emerald-300/10 blur-xl" />
                <div className="space-y-3">
                  {[0.88, 0.7, 0.78].map((width) => (
                    <div
                      key={width}
                      className="h-1.5 rounded-full bg-emerald-300/20"
                      style={{ width: `${width * 100}%` }}
                    />
                  ))}
                </div>
                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      AI Processing
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Responding to cravings, meal timing, and macros.
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-300/12 p-2 text-emerald-300">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </article>
          </ScrollReveal>
        </div>
      </section>

      <section id="use-now" className="border-y border-white/6 bg-[#060d1a]/80 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <ScrollReveal className="lg:max-w-xl" variant="left">
            <h2 className={`${sora.className} text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl`}>
              The Future of Health,
              <br />
              In Your Pocket.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Experience an interface that breathes. NutriGenie&apos;s dashboard is more
              than data; it&apos;s a living reflection of your metabolic health, designed for
              maximum clarity and minimal friction.
            </p>

            <div className="mt-10 space-y-6">
              {previewPoints.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-300" />
                  <div>
                    <h3 className={`${sora.className} text-lg font-semibold text-white`}>
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/dashboard" className={primaryButtonClass}>
                Open Dashboard
              </Link>
              <Link href="/login" className={secondaryButtonClass}>
                Sign In First
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="relative lg:justify-self-end lg:w-full"
            variant="right"
            delay={120}
          >
            <div className="absolute inset-x-12 top-10 h-56 rounded-full bg-emerald-400/10 blur-[110px]" />
            <div className="relative mx-auto w-full max-w-[34rem] rounded-[2rem] border border-white/7 bg-white/[0.04] p-4 shadow-[0_28px_90px_-50px_rgba(78,222,163,0.32)] backdrop-blur-xl sm:p-5 lg:mx-0">
              <div className="relative rounded-[1.8rem] border border-white/7 bg-[#091222] p-5 sm:p-6">
                <div className="landing-orb-drift absolute right-8 top-8 h-16 w-16 rounded-full bg-emerald-300/8 blur-xl" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-300/12 text-emerald-300">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Your Health
                      </p>
                      <p className={`${sora.className} text-lg font-semibold text-white`}>
                        Optimal Vitality
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-500">i</span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/6 bg-white/[0.05] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      Protein
                    </p>
                    <p className={`${sora.className} mt-2 text-3xl font-semibold text-white`}>
                      142g
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/6 bg-white/[0.05] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                      Energy
                    </p>
                    <p className={`${sora.className} mt-2 text-3xl font-semibold text-white`}>
                      2,450
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.35rem] border border-emerald-300/10 bg-emerald-300/6 p-4">
                  <div className="flex gap-3">
                    <div className="rounded-full bg-emerald-300/12 p-2 text-emerald-300">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-slate-200">
                      AI Recommendation: Increase fiber by 10g tonight for better sleep
                      markers.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-8 gap-2 rounded-[1.25rem] border border-white/6 bg-white/[0.03] p-3">
                  {[45, 68, 52, 74, 61, 80, 57, 71].map((height, index) => (
                    <div key={height} className="flex items-end">
                      <div
                        className={`w-full rounded-full bg-gradient-to-t from-emerald-300/35 to-cyan-300/60 ${
                          index % 2 === 0 ? "landing-float" : "landing-float-delayed"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="h-1 w-32 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-7xl text-center" variant="up">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">
            Trusted by health enthusiasts worldwide
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 sm:gap-x-14">
            {partnerNames.map((name) => (
              <span key={name} className={`${sora.className} opacity-60`}>
                {name}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section id="cta" className="relative overflow-hidden px-5 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,32,0)_0%,rgba(52,211,153,0.06)_100%)]" />
        <div className="absolute inset-x-1/2 top-0 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[130px]" />
        <ScrollReveal className="relative mx-auto max-w-4xl" variant="zoom">
          <h2 className={`${sora.className} text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl md:text-6xl`}>
            Ready to Transform Your
            <span className="block">Health?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Join thousands of others who are optimizing their biology with the world&apos;s
            most advanced AI nutritionist.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard" className={primaryButtonClass}>
              Start Your Journey
            </Link>
            <Link href="/login" className={secondaryButtonClass}>
              Sign In
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-white/6 bg-[#121a2c] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.2fr,1.8fr] lg:items-start">
            <ScrollReveal variant="left">
            <div>
              <p className={`${sora.className} text-lg font-semibold text-emerald-300`}>NutriGenie</p>
              <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
                The next frontier of human nutrition, powered by neural vitality and
                biological precision.
              </p>
            </div>
            </ScrollReveal>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {footerGroups.map((group, index) => (
                <ScrollReveal key={group.title} delay={index * 80} variant="up">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    {group.title}
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-400">
                    {group.items.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal
            className="mt-14 border-t border-white/6 pt-6 text-xs text-slate-500 sm:flex sm:items-center sm:justify-between"
            variant="up"
            delay={120}
          >
            <p>(c) 2026 NutriGenie AI. The Neural Vitality.</p>
            <div className="mt-4 flex gap-6 sm:mt-0">
              <span>Twitter</span>
              <span>Instagram</span>
              <span>LinkedIn</span>
            </div>
          </ScrollReveal>
        </div>
      </footer>
    </main>
  );
}
