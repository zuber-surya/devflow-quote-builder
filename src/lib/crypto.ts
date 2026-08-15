import crypto from "crypto";

/**
 * SHA-256 hash of an opaque token, used everywhere a secret token (refresh
 * token, password reset token) is stored at rest - only the hash is ever
 * persisted, never the raw value.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
