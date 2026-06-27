let cached: boolean | null = null;

export async function isCloudEnabled(): Promise<boolean> {
  if (cached !== null) return cached;
  try {
    const res = await fetch("/api/config");
    if (!res.ok) {
      cached = false;
      return false;
    }
    const json = await res.json();
    cached = Boolean(json.cloudMode);
    return cached;
  } catch {
    cached = false;
    return false;
  }
}

export function resetCloudCache() {
  cached = null;
}