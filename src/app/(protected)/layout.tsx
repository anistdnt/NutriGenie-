import Navbar from "@/src/components/layout/Navbar";
import AuthProvider from "@/src/components/providers/SessionProvider";
import OnboardingGuard from "@/src/components/auth/OnboardingGuard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import { getOrCreateUserByEmail } from "@/src/lib/db/user";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let isProfileComplete = false;

  if (session?.user?.email) {
    await connectDB();
    const user = await getOrCreateUserByEmail(
      session.user.email,
      session.user.name,
      session.user.image
    );
    isProfileComplete = !!(user?.age && user?.height && user?.gender);
  }

  return (
    <AuthProvider>
      <OnboardingGuard isProfileComplete={isProfileComplete}>
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100">{children}</main>
      </OnboardingGuard>
    </AuthProvider>
  );
}
