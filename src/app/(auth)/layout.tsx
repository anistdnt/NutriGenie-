export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0f172a_0%,#020617_60%)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-6 py-10 md:grid-cols-2">
        <div className="hidden md:block">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 font-semibold mb-3">
            NutriGenie
          </p>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Personalized nutrition guidance that feels like a real coach.
          </h1>
          <p className="text-slate-300 text-sm max-w-md">
            Plan meals, track progress, and ask health questions with AI assistance tailored to your profile.
          </p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
