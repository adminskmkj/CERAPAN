import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Tiada login — alihkan terus ke borang cerapan
  if (path === "/log-masuk" || path.startsWith("/log-masuk/")) {
    return NextResponse.redirect(new URL("/cerapan/baharu", request.url));
  }

  return NextResponse.next();
}