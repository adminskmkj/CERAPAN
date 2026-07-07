import { NextResponse } from "next/server";
import { requireCerapanDelete } from "@/lib/auth/require-cerapan";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  deleteCerapanSupabase,
  getCerapanSupabase,
} from "@/lib/storage/cerapan-supabase";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  try {
    const record = await getCerapanSupabase(admin, id);
    if (!record) {
      return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: formatSupabaseError(e) }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const record = await getCerapanSupabase(admin, id);
  if (!record) {
    return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });
  }

  const auth = await requireCerapanDelete(record);
  if (auth.error) return auth.error;

  try {
    await deleteCerapanSupabase(admin, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: formatSupabaseError(e) }, { status: 400 });
  }
}