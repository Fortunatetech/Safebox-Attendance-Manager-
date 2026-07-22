import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);
  const isLoginPage = pathname === "/admin/login";

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
    if (isLoggedIn && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
