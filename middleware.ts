import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("AQUI")
  // evita loop infinito
  if (pathname === "/cancelado") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/cancelado", request.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
