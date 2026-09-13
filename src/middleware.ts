import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware: cheap cookie-presence gate so unauthenticated visitors never
 * reach an admin/account page. Real role verification happens in the layouts /
 * server helpers (better-auth sessions live in Postgres, which edge can't reach).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/account");

  if ((isAdmin || isAccount) && !sessionCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // administrators have no reason to use the customer auth pages
  if ((pathname === "/login" || pathname === "/register") && sessionCookie) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
