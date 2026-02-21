import Link from "next/link";
import { Sora, Manrope } from "next/font/google";
import { ArrowRight, Bot, ChartSpline, ShieldCheck, UtensilsCrossed } from "lucide-react";

const sora = Sora({ subsets: ["latin"], weight: ["500", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const stats = [
  { label: "Adaptive Guidance", value: "24/7", note: "Smart health and nutrition support" },
  { label: "Meal Intelligence", value: "AI", note: "Profile-aware meal and recipe generation" },
  { label: "Data Ownership", value: "100%", note: "Personalized history per authenticated user" },
];

const featureCards = [
  {
    icon: Bot,
    title: "Health-First AI Coach",
    desc: "Ask lifestyle, nutrition, and condition-aware questions in natural language.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal Plans and Recipes",
    desc: "Generate complete plans and practical recipes with nutrient-aware structure.",
  },
  {
    icon: ChartSpline,
    title: "Progress Visibility",
    desc: "Track averages, recent plans, and momentum from your dashboard data.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Guidance Boundaries",
    desc: "Built for educational guidance without unsafe diagnosis or medication advice.",
  },
];

export default function Home() {
  return (
    <main className={`${manrope.className} min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0b1220_35%,#020617_100%)] text-slate-100`}>
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <header className="mb-14 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold">
              NG
            </div>
            <div>
              <p className={`${sora.className} text-lg font-semibold`}>NutriGenie</p>
              <p className="text-xs text-slate-400">AI Nutrition and Health Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800">
              Sign In
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
              Use It Now
            </Link>
          </div>
        </header>

        <section className="mb-14 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_20px_70px_-40px_rgba(16,185,129,0.7)] md:p-10">
            <p className="mb-3 inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Personalized Health Intelligence
            </p>
            <h1 className={`${sora.className} mb-4 text-4xl font-bold leading-tight md:text-5xl`}>
              Plan Better Meals. Build Better Daily Habits.
            </h1>
            <p className="max-w-2xl text-base text-slate-300 md:text-lg">
              NutriGenie combines conversational guidance, practical meal planning, and progress insights so users can make healthier decisions every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#use-now" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">
                See How to Start
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className={`${sora.className} mt-2 text-3xl font-bold text-emerald-300`}>{item.value}</p>
                <p className="mt-2 text-sm text-slate-300">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between">
            <h2 className={`${sora.className} text-2xl font-semibold md:text-3xl`}>What Users Get Inside</h2>
            <span className="text-sm font-medium text-slate-400">Built on your current NutriGenie stack</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featureCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-transform hover:-translate-y-1">
                <div className="mb-4 inline-flex rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className={`${sora.className} mb-2 text-lg font-semibold`}>{card.title}</h3>
                <p className="text-sm text-slate-300">{card.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="use-now" className="rounded-3xl bg-[linear-gradient(135deg,#111827_0%,#0b1220_55%,#134e4a_100%)] border border-slate-800 p-8 text-white md:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Use It Now</p>
          <h2 className={`${sora.className} mb-3 text-3xl font-semibold md:text-4xl`}>
            Jump Into Your Dashboard and Start Chatting
          </h2>
          <p className="max-w-3xl text-sm text-slate-200 md:text-base">
            Ask your first health question, generate a tailored meal plan, track nutrition signals, and continue in multiple chat threads.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Sign In First
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
