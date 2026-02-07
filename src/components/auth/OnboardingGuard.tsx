"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OnboardingGuardProps {
    isProfileComplete: boolean;
    children: React.ReactNode;
}

export default function OnboardingGuard({
    isProfileComplete,
    children,
}: OnboardingGuardProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Normalize check to handle trailing slashes
        const isOnboarding = pathname?.startsWith("/onboarding");

        if (!isProfileComplete && !isOnboarding) {
            router.replace("/onboarding");
        } else if (isProfileComplete && isOnboarding) {
            router.replace("/dashboard");
        }
    }, [mounted, pathname, isProfileComplete, router]);

    // Prevent hydration mismatch or flash of content
    if (!mounted) return null;

    const isOnboarding = pathname?.startsWith("/onboarding");

    // While checking/redirecting, show nothing or loading
    if (!isProfileComplete && !isOnboarding) return null;
    if (isProfileComplete && isOnboarding) return null;

    return <>{children}</>;
}
