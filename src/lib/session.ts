import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/jwt";

export interface CurrentUser {
  id: string;
}

/**
 * Resolves the current user for a request: tries the Auth.js session
 * (web, httpOnly cookie) first, then falls back to a Bearer JWT (mobile).
 * Per api.md, this applies identically regardless of x-client-type -
 * whichever credential is actually present wins.
 */
export async function getCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  const session = await auth();
  if (session?.user?.id) {
    return { id: session.user.id };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    if (payload?.sub) return { id: payload.sub };
  }

  return null;
}

/**
 * Like getCurrentUser, but throws a 401-shaped error for routes that
 * require auth. Callers should catch and return the response.
 */
export class UnauthorizedError extends Error {}

export async function requireUser(request: NextRequest): Promise<CurrentUser> {
  const user = await getCurrentUser(request);
  if (!user) throw new UnauthorizedError("Authentication required");
  return user;
}
