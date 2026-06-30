let cached: boolean | null = null;

export async function isCloudEnabled(): Promise<boolean> {
  if (cached) return cached;
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return false;
    const json = await res.json();
    cached = Boolean(json.cloudMode);
    return cached;
  } catch {
    return false;
  }
}

export function resetCloudCache() {
  cached = null;
}