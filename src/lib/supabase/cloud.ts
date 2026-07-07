let cached: boolean | null = null;

function cloudModeFromEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && anonKey);
}

export async function isCloudEnabled(): Promise<boolean> {
  if (typeof window === "undefined") {
    return cloudModeFromEnv();
  }
  if (cached !== null) return cached;
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return false;
    const json = await res.json();
    cached = Boolean(json.cloudMode);
    return cached;
  } catch {
    return cloudModeFromEnv();
  }
}

export function resetCloudCache() {
  cached = null;
}