import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateNewPassword,
  userMustChangePassword,
} from "@/lib/auth/password-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak log masuk" }, { status: 401 });
  }

  if (!userMustChangePassword(user)) {
    return NextResponse.json(
      { error: "Akaun ini tidak memerlukan pertukaran kata laluan." },
      { status: 400 }
    );
  }

  let body: { password?: string; confirm?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak sah" }, { status: 400 });
  }

  const password = String(body.password ?? "");
  const confirm = String(body.confirm ?? "");

  if (password !== confirm) {
    return NextResponse.json(
      { error: "Pengesahan kata laluan tidak sepadan." },
      { status: 400 }
    );
  }

  const policyError = validateNewPassword(password);
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({
    password,
    data: { must_change_password: false },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}