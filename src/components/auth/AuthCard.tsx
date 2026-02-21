export default function AuthCard({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <h1 className="text-2xl font-black mb-1 text-slate-100">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mb-6">{subtitle}</p>}
      {children}
    </div>
  );
}
