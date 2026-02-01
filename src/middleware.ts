// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/meal-plan",
];

const authRoutes = [
  "/login",
  "/register",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  // ❌ Not logged in → protected route
  if (!isLoggedIn && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      new URL(pathname, req.url).toString()
    );
    return NextResponse.redirect(loginUrl);
  }

  // ❌ Logged in → auth pages
  if (isLoggedIn && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/meal-plan/:path*",
    "/login",
    "/register",
  ],
};
