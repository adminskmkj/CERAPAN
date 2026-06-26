import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const cloudMode = Boolean(url && anonKey);

  return NextResponse.json({
    cloudMode,
    url: cloudMode ? url : "",
    anonKey: cloudMode ? anonKey : "",
  });
}