import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/types";
import { isAdminRole } from "@/lib/auth/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi sepenuhnya" },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .single();

  if (!callerProfile || !isAdminRole(callerProfile.role as UserRole)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, fullName, role, schoolId, orgId } = body as {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    schoolId?: string;
    orgId?: string;
  };

  if (!email || !password || !fullName || !role) {
    return NextResponse.json(
      { error: "E-mel, kata laluan, nama, dan peranan diperlukan" },
      { status: 400 }
    );
  }

  const { data: newUser, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

  if (createError || !newUser.user) {
    const msg = createError?.message ?? "Gagal cipta pengguna";
    const friendly = msg.toLowerCase().includes("already")
      ? "E-mel ini sudah digunakan. Guna e-mel lain atau semak senarai pengguna."
      : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: newUser.user.id,
    full_name: fullName,
    role,
    school_id: schoolId ?? null,
    org_id: orgId ?? callerProfile.org_id ?? null,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({
    id: newUser.user.id,
    email: newUser.user.email,
    fullName,
    role,
  });
}

export async function GET() {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json({ error: "Supabase tidak dikonfigurasi" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || !isAdminRole(callerProfile.role as UserRole)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, role, school_id, org_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}