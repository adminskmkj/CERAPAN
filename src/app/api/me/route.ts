import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/types";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ profile: null, demo: true });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak log masuk" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Service role tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, role, org_id, school_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json(
      {
        error: "Profil tidak dijumpai. Hubungi pentadbir sistem.",
        userId: user.id,
        email: user.email,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    profile: {
      id: data.id,
      fullName: data.full_name,
      role: data.role as UserRole,
      orgId: data.org_id,
      schoolId: data.school_id,
      email: user.email,
    },
  });
}