import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

/**
 * Issues a new password reset token for a user, stores only its hash, and
 * returns the raw token to embed in the emailed reset link. Does not check
 * whether the user exists - callers should look the user up first and stay
 * silent about whether the email matched (prevents account enumeration).
 */
export async function generateResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      userId,
    },
  });
  return rawToken;
}

export interface ResetResult {
  userId: string;
}

/**
 * Atomically validates and consumes a password reset token, applying the
 * new (already-hashed) password in the same transaction:
 *  1. look up the token by hash, reject if unknown/used/expired
 *  2. claim it via a conditional update (usedAt: null guard) - if two
 *     concurrent requests race here, only one's update touches a row
 *  3. only if the claim actually succeeded, update the user's password
 *
 * This closes the TOCTOU gap a separate validate-then-consume-then-update
 * sequence would have: two requests with the same still-valid token can no
 * longer both succeed, and a crash between steps can't leave the token
 * consumed without the password changed (or vice versa) since it's all one
 * transaction.
 */
export async function consumePasswordReset(
  rawToken: string,
  newPasswordHash: string
): Promise<ResetResult | null> {
  const hashed = hashToken(rawToken);

  return prisma.$transaction(async (tx) => {
    const record = await tx.passwordResetToken.findUnique({ where: { token: hashed } });
    if (!record || record.usedAt || record.expiresAt < new Date()) return null;

    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count !== 1) return null; // lost the race to a concurrent request

    await tx.user.update({
      where: { id: record.userId },
      data: { password: newPasswordHash },
    });

    return { userId: record.userId };
  });
}

/**
 * Sends the password reset email via Resend. Callers should not await this
 * inline in a request path that also runs for "user not found" (where
 * nothing is sent) - doing so creates a timing side-channel that leaks
 * account existence even when the response body is identical either way.
 * Fire-and-forget with .catch() instead; see password-reset/route.ts.
 */
export async function sendPasswordResetEmail(email: string, rawToken: string): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
  const fromAddress = process.env.EMAIL_FROM || "no-reply@example.com";

  const resend = getResendClient();
  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "Reset your password",
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
