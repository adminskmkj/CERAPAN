import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { dbRoleToAppRole, type AppRole } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";
import { userMustChangePassword } from "@/lib/auth/password-policy";

const STAFF_CERAPAN_PREFIXES = ["/cerapan/baharu", "/cerapan/ketua-panitia"];

async function resolveAppRole(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null }
): Promise<AppRole | null> {
  const fromEmail = dbRoleToAppRole(null, user.email);
  if (fromEmail) return fromEmail;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return dbRoleToAppRole(data?.role as UserRole | undefined, user.email);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return response;
  }

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (user && userMustChangePassword(user)) {
    const allowed =
      path === "/tukar-kata-laluan" ||
      path.startsWith("/api/auth/tukar-kata-laluan");
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/tukar-kata-laluan";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const needsStaffCerapan = STAFF_CERAPAN_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (user && needsStaffCerapan) {
    const role = await resolveAppRole(supabase, user);
    if (role !== "pentadbir" && role !== "ketua_panitia") {
      const url = request.nextUrl.clone();
      url.pathname = "/log-masuk";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  if (user && path === "/log-masuk") {
    if (userMustChangePassword(user)) {
      const url = request.nextUrl.clone();
      url.pathname = "/tukar-kata-laluan";
      url.search = "";
      return NextResponse.redirect(url);
    }
    const role = await resolveAppRole(supabase, user);
    if (role) {
      const url = request.nextUrl.clone();
      const redirect = request.nextUrl.searchParams.get("redirect");
      url.pathname =
        redirect ??
        (role === "ketua_panitia" ? "/cerapan/baharu" : "/dashboard");
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
  }

  return response;
}