import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const dbMock = vi.hoisted(() => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("@/lib/db", () => dbMock);

const resetLibMock = vi.hoisted(() => ({
  generateResetToken: vi.fn(() => Promise.resolve("raw-token")),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  consumePasswordReset: vi.fn(),
}));
vi.mock("@/lib/password-reset", () => resetLibMock);

const jwtMock = vi.hoisted(() => ({
  revokeAllRefreshTokensForUser: vi.fn(() => Promise.resolve()),
}));
vi.mock("@/lib/jwt", () => jwtMock);

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn(() => Promise.resolve("hashed-password")) },
}));

import { POST as requestHandler } from "@/app/api/v1/auth/password-reset/route";
import { POST as confirmHandler } from "@/app/api/v1/auth/password-reset/confirm/route";

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/v1/auth/password-reset", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/auth/password-reset (request)", () => {
  beforeEach(() => {
  vi.clearAllMocks();
});

  it("returns the generic success message for a known email, and actually sends", async () => {
    dbMock.prisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "a@example.com" });
    const res = await requestHandler(jsonRequest({ email: "a@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/if an account exists/i);
    expect(resetLibMock.generateResetToken).toHaveBeenCalledWith("user-1");
    expect(resetLibMock.sendPasswordResetEmail).toHaveBeenCalledOnce();
  });

  it("returns the identical generic success message for an unknown email (no enumeration)", async () => {
    dbMock.prisma.user.findUnique.mockResolvedValue(null);
    const res = await requestHandler(jsonRequest({ email: "nobody@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/if an account exists/i);
    expect(resetLibMock.generateResetToken).not.toHaveBeenCalled();
    expect(resetLibMock.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("still returns generic success even if email delivery throws", async () => {
    dbMock.prisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "a@example.com" });
    resetLibMock.sendPasswordResetEmail.mockRejectedValueOnce(new Error("Resend down"));

    const res = await requestHandler(jsonRequest({ email: "a@example.com" }));
    expect(res.status).toBe(200);
  });

  it("returns 400 for an invalid email", async () => {
    const res = await requestHandler(jsonRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/password-reset/confirm", () => {
  beforeEach(() => {
  vi.clearAllMocks();
});

  it("returns 401 for an invalid/expired/already-used token", async () => {
    resetLibMock.consumePasswordReset.mockResolvedValue(null);
    const res = await confirmHandler(jsonRequest({ token: "bad", newPassword: "newpass123" }));
    expect(res.status).toBe(401);
    expect(jwtMock.revokeAllRefreshTokensForUser).not.toHaveBeenCalled();
  });

  it("on success: consumes+applies the password atomically, then revokes all refresh tokens", async () => {
    resetLibMock.consumePasswordReset.mockResolvedValue({ userId: "user-1" });

    const res = await confirmHandler(
      jsonRequest({ token: "good", newPassword: "newpass123" })
    );

    expect(res.status).toBe(200);
    expect(resetLibMock.consumePasswordReset).toHaveBeenCalledWith("good", "hashed-password");
    expect(jwtMock.revokeAllRefreshTokensForUser).toHaveBeenCalledWith("user-1");
  });

  it("returns 400 for a too-short new password", async () => {
    const res = await confirmHandler(jsonRequest({ token: "x", newPassword: "abc" }));
    expect(res.status).toBe(400);
  });
});
