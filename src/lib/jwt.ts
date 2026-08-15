import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getAccessSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export interface AccessTokenPayload {
  sub: string; // user id
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId } as AccessTokenPayload, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, getAccessSecret()) as AccessTokenPayload;
  } catch {
    return null;
  }
}

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

/**
 * Issues a new opaque refresh token, stores only its hash (never the raw
 * value) in the RefreshToken table, and returns the raw token to the client.
 * Accepts an optional transaction client so callers (like rotateRefreshToken)
 * can compose this into a larger atomic operation.
 */
export async function generateRefreshToken(
  userId: string,
  client: PrismaClientOrTx = prisma
): Promise<string> {
  const rawToken = crypto.randomBytes(48).toString("hex");
  await client.refreshToken.create({
    data: {
      token: hashToken(rawToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userId,
    },
  });
  return rawToken;
}

/**
 * Validates a raw refresh token against its stored hash, rejecting
 * expired or unknown tokens. Rotates it: the old record is deleted and a
 * new refresh token is issued, so a stolen token can only be replayed once
 * before detection (reuse of the old token after rotation is a signal of
 * compromise, though not yet alerted on - see security.md).
 *
 * The lookup, delete, and re-issue happen inside one transaction so two
 * concurrent refresh calls with the same token can't both succeed and end
 * up with two live refresh tokens from a single one.
 */
export async function rotateRefreshToken(
  rawToken: string
): Promise<{ userId: string; refreshToken: string } | null> {
  const hashed = hashToken(rawToken);

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const record = await tx.refreshToken.findUnique({ where: { token: hashed } });
    if (!record || record.expiresAt < new Date()) return null;

    await tx.refreshToken.delete({ where: { id: record.id } });
    const newRefreshToken = await generateRefreshToken(record.userId, tx);
    return { userId: record.userId, refreshToken: newRefreshToken };
  });
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const hashed = hashToken(rawToken);
  await prisma.refreshToken.deleteMany({ where: { token: hashed } });
}

/**
 * Revokes every refresh token for a user - used after a password reset,
 * so a stolen-but-not-yet-used refresh token from before the reset can't
 * keep a session alive.
 */
export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
