export const ADMIN_EMAIL = "adminskmkj@gmail.com";

/**
 * Domain e-mel panitia subjek SMKJS.
 * Setiap KP: `{subjek}.skmkj@edu.my`
 */
export const KP_CERAPAN_EMAIL_DOMAIN = "skmkj.edu.my";

/**
 * Kata laluan sementara semasa pendaftaran KP (manual di Supabase).
 * Wajib ditukar pada log masuk pertama — lihat `must_change_password` dalam user metadata.
 */
export const KP_TEMP_PASSWORD = "123456";

export const KP_PASSWORD_MIN_LENGTH = 8;

export function isAdminEmail(email?: string | null): boolean {
  return email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}