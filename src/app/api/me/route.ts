import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({
      user: null,
      appRole: null,
      fullName: null,
      panitia: null,
    });
  }

  return NextResponse.json({
    user: { id: session.user.id, email: session.user.email },
    appRole: session.appRole,
    fullName: session.fullName,
    panitia: session.panitia,
  });
}