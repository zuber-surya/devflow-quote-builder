import { describe, it, expect, vi, beforeEach } from "vitest";

// src/lib/auth.ts calls NextAuth(...) at module scope, which needs its
// providers/adapter to exist. Mock them so importing the module (to test
// verifyCredentials) doesn't require a real DB connection or AUTH_SECRET.
const dbMock = vi.hoisted(() => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/db", () => dbMock);

vi.mock("next-auth", () => ({
  default: () => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));
vi.mock("next-auth/providers/credentials", () => ({ default: vi.fn() }));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: vi.fn() }));

import bcrypt from "bcryptjs";
import { verifyCredentials } from "@/lib/auth";

describe("verifyCredentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for a nonexistent user", async () => {
    dbMock.prisma.user.findUnique.mockResolvedValue(null);
    const result = await verifyCredentials("nobody@example.com", "whatever");
    expect(result).toBeNull();
  });

  it("returns null for a wrong password", async () => {
    const hashed = await bcrypt.hash("correct-password", 10);
    dbMock.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "a@example.com",
      name: "Alice",
      password: hashed,
    });
    const result = await verifyCredentials("a@example.com", "wrong-password");
    expect(result).toBeNull();
  });

  it("returns the user (without password) for correct credentials", async () => {
    const hashed = await bcrypt.hash("correct-password", 10);
    dbMock.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "a@example.com",
      name: "Alice",
      password: hashed,
    });
    const result = await verifyCredentials("a@example.com", "correct-password");
    expect(result).toEqual({ id: "user-1", email: "a@example.com", name: "Alice" });
    expect(result).not.toHaveProperty("password");
  });
});
