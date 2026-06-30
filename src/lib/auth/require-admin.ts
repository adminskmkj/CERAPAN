import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

type AdminResult =
  | { user: import("@supabase/supabase-js").User; error?: undefined }
  | { user?: undefined; error: NextResponse };

/** Pentadbir sahaja (panel pengguna, dll.) */
export async function requireAdmin(): Promise<AdminResult> {
  const session = await getAuthSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Tidak log masuk" }, { status: 401 }),
    };
  }

  if (session.appRole !== "pentadbir") {
    return {
      error: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }),
    };
  }

  return { user: session.user };
}