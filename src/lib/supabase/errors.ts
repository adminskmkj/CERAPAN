/** Ekstrak mesej ralat daripada Supabase/PostgREST (bukan instance Error). */
export function formatSupabaseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const e = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    if (e.message) {
      if (e.code === "23503" && e.message.includes("cerapan_created_by_fkey")) {
        return "Profil pentadbir/KP tidak lengkap dalam sistem. Hubungi pentadbir untuk set profil (jadual profiles) sebelum menyimpan pencerapan.";
      }
      return e.details ? `${e.message} (${e.details})` : e.message;
    }
  }
  return "Ralat simpan";
}