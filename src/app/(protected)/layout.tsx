import Navbar from "@/src/components/layout/Navbar";
import AuthSessionProvider from "@/src/components/providers/SessionProvider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <Navbar />
      <main className="p-6">{children}</main>
    </AuthSessionProvider>
  );
}
