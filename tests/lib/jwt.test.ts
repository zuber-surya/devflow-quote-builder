import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

const dbMock = vi.hoisted(() => {
  const refreshToken = {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  };
  return {
    prisma: {
      refreshToken,
      // rotateRefreshToken runs inside prisma.$transaction(async (tx) => ...);
      // simulate that by just handing the callback the same mocked client.
      $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback({ refreshToken })),
    },
  };
});

vi.mock("@/lib/db", () => dbMock);

process.env.JWT_SECRET = "test-secret";

import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "@/lib/jwt";

describe("access tokens", () => {
  it("round-trips a valid token", () => {
    const token = generateAccessToken("user-1");
    const payload = verifyAccessToken(token);
    expect(payload?.sub).toBe("user-1");
  });

  it("rejects a garbage token", () => {
    expect(verifyAccessToken("not-a-real-token")).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const forged = jwt.sign({ sub: "user-1" }, "wrong-secret");
    expect(verifyAccessToken(forged)).toBeNull();
  });
});

describe("refresh tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores only a hash, never the raw token", async () => {
    dbMock.prisma.refreshToken.create.mockResolvedValue({});
    const raw = await generateRefreshToken("user-1");

    expect(dbMock.prisma.refreshToken.create).toHaveBeenCalledOnce();
    const stored = dbMock.prisma.refreshToken.create.mock.calls[0][0].data.token;
    expect(stored).not.toBe(raw);
    expect(stored).toHaveLength(64); // sha256 hex
  });

  it("rejects an unknown refresh token", async () => {
    dbMock.prisma.refreshToken.findUnique.mockResolvedValue(null);
    const result = await rotateRefreshToken("unknown-token");
    expect(result).toBeNull();
  });

  it("rejects an expired refresh token", async () => {
    dbMock.prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000),
    });
    const result = await rotateRefreshToken("expired-token");
    expect(result).toBeNull();
    expect(dbMock.prisma.refreshToken.delete).not.toHaveBeenCalled();
  });

  it("rotates a valid token: deletes the old one, issues a new one", async () => {
    dbMock.prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    dbMock.prisma.refreshToken.create.mockResolvedValue({});

    const result = await rotateRefreshToken("valid-token");

    expect(dbMock.prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: "rt-1" } });
    expect(result?.userId).toBe("user-1");
    expect(result?.refreshToken).toBeTypeOf("string");
  });

  it("revoke deletes by hash, no error if token does not exist", async () => {
    dbMock.prisma.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
    await expect(revokeRefreshToken("whatever")).resolves.toBeUndefined();
    expect(dbMock.prisma.refreshToken.deleteMany).toHaveBeenCalledOnce();
  });
});
