import { describe, it, expect, vi, beforeEach } from "vitest";

const dbMock = vi.hoisted(() => {
  const passwordResetToken = {
    create: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  };
  const user = { update: vi.fn() };
  return {
    prisma: {
      passwordResetToken,
      user,
      // consumePasswordReset runs inside prisma.$transaction(async (tx) => ...)
      $transaction: vi.fn((callback: (tx: unknown) => unknown) =>
        callback({ passwordResetToken, user })
      ),
    },
  };
});
vi.mock("@/lib/db", () => dbMock);

const resendSendMock = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: resendSendMock },
  })),
}));

process.env.RESEND_API_KEY = "test-resend-key";
process.env.EMAIL_FROM = "no-reply@test.com";
process.env.NEXTAUTH_URL = "http://localhost:3000";

import {
  generateResetToken,
  consumePasswordReset,
  sendPasswordResetEmail,
} from "@/lib/password-reset";

describe("generateResetToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores only a hash, never the raw token", async () => {
    dbMock.prisma.passwordResetToken.create.mockResolvedValue({});
    const raw = await generateResetToken("user-1");

    const stored = dbMock.prisma.passwordResetToken.create.mock.calls[0][0].data.token;
    expect(stored).not.toBe(raw);
    expect(stored).toHaveLength(64); // sha256 hex
  });
});

describe("consumePasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unknown token", async () => {
    dbMock.prisma.passwordResetToken.findUnique.mockResolvedValue(null);
    const result = await consumePasswordReset("unknown", "hashed-pw");
    expect(result).toBeNull();
    expect(dbMock.prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects an already-used token", async () => {
    dbMock.prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "prt-1",
      userId: "user-1",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    const result = await consumePasswordReset("used", "hashed-pw");
    expect(result).toBeNull();
    expect(dbMock.prisma.passwordResetToken.updateMany).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    dbMock.prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "prt-1",
      userId: "user-1",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });
    const result = await consumePasswordReset("expired", "hashed-pw");
    expect(result).toBeNull();
  });

  it("rejects if the conditional claim loses the race (count !== 1)", async () => {
    dbMock.prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "prt-1",
      userId: "user-1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    dbMock.prisma.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });

    const result = await consumePasswordReset("raced", "hashed-pw");
    expect(result).toBeNull();
    expect(dbMock.prisma.user.update).not.toHaveBeenCalled();
  });

  it("on success: claims the token with a usedAt:null guard and updates the password", async () => {
    dbMock.prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "prt-1",
      userId: "user-1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    dbMock.prisma.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    dbMock.prisma.user.update.mockResolvedValue({});

    const result = await consumePasswordReset("valid", "hashed-pw");

    expect(dbMock.prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { id: "prt-1", usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(dbMock.prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "hashed-pw" },
    });
    expect(result).toEqual({ userId: "user-1" });
  });
});

describe("sendPasswordResetEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends via Resend with the raw token embedded in the link", async () => {
    resendSendMock.mockResolvedValue({});
    await sendPasswordResetEmail("a@example.com", "raw-token-123");

    expect(resendSendMock).toHaveBeenCalledOnce();
    const call = resendSendMock.mock.calls[0][0];
    expect(call.to).toBe("a@example.com");
    expect(call.from).toBe("no-reply@test.com");
    expect(call.html).toContain("raw-token-123");
  });
});
