import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.hoisted(() => ({
  verifyCredentials: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/auth", () => authMock);

const jwtMock = vi.hoisted(() => ({
  ACCESS_TOKEN_TTL_SECONDS: 900,
  generateAccessToken: vi.fn(() => "fake-access-token"),
  generateRefreshToken: vi.fn(() => Promise.resolve("fake-refresh-token")),
  rotateRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
}));
vi.mock("@/lib/jwt", () => jwtMock);

import { POST as loginHandler } from "@/app/api/v1/auth/login/route";
import { POST as logoutHandler } from "@/app/api/v1/auth/logout/route";
import { POST as refreshHandler } from "@/app/api/v1/auth/refresh/route";

function jsonRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/v1/auth/x", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validUser = { id: "user-1", email: "a@example.com", name: "Alice" };

describe("POST /api/v1/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for invalid credentials without touching signIn or token generation", async () => {
    authMock.verifyCredentials.mockResolvedValue(null);
    const res = await loginHandler(jsonRequest({ email: "a@example.com", password: "wrong" }));
    expect(res.status).toBe(401);
    expect(authMock.signIn).not.toHaveBeenCalled();
    expect(jwtMock.generateAccessToken).not.toHaveBeenCalled();
  });

  it("web client: calls signIn, returns only { user } (no tokens)", async () => {
    authMock.verifyCredentials.mockResolvedValue(validUser);
    const res = await loginHandler(
      jsonRequest({ email: "a@example.com", password: "correct" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(authMock.signIn).toHaveBeenCalledWith("credentials", {
      email: "a@example.com",
      password: "correct",
      redirect: false,
    });
    expect(body.data.user).toEqual(validUser);
    expect(body.data.accessToken).toBeUndefined();
    expect(body.data.refreshToken).toBeUndefined();
  });

  it("mobile client (x-client-type: flutter): returns tokens, never calls signIn", async () => {
    authMock.verifyCredentials.mockResolvedValue(validUser);
    const res = await loginHandler(
      jsonRequest(
        { email: "a@example.com", password: "correct" },
        { "x-client-type": "flutter" }
      )
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(authMock.signIn).not.toHaveBeenCalled();
    expect(body.data.accessToken).toBe("fake-access-token");
    expect(body.data.refreshToken).toBe("fake-refresh-token");
    expect(body.data.expiresIn).toBe(900);
  });

  it("returns 400 for a malformed body", async () => {
    const res = await loginHandler(jsonRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("web client: calls signOut, not revokeRefreshToken", async () => {
    const res = await logoutHandler(jsonRequest({}));
    expect(res.status).toBe(200);
    expect(authMock.signOut).toHaveBeenCalledOnce();
    expect(jwtMock.revokeRefreshToken).not.toHaveBeenCalled();
  });

  it("mobile client: revokes the given refresh token, not signOut", async () => {
    const res = await logoutHandler(
      jsonRequest({ refreshToken: "rt-1" }, { "x-client-type": "flutter" })
    );
    expect(res.status).toBe(200);
    expect(jwtMock.revokeRefreshToken).toHaveBeenCalledWith("rt-1");
    expect(authMock.signOut).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid body shape instead of a generic 500", async () => {
    const res = await logoutHandler(jsonRequest({ refreshToken: 12345 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/auth/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for an invalid/expired refresh token", async () => {
    jwtMock.rotateRefreshToken.mockResolvedValue(null);
    const res = await refreshHandler(jsonRequest({ refreshToken: "bad" }));
    expect(res.status).toBe(401);
  });

  it("returns a new access token + rotated refresh token on success", async () => {
    jwtMock.rotateRefreshToken.mockResolvedValue({ userId: "user-1", refreshToken: "new-rt" });
    const res = await refreshHandler(jsonRequest({ refreshToken: "old-rt" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.accessToken).toBe("fake-access-token");
    expect(body.data.refreshToken).toBe("new-rt");
    expect(body.data.expiresIn).toBe(900);
  });

  it("returns 400 when refreshToken is missing", async () => {
    const res = await refreshHandler(jsonRequest({}));
    expect(res.status).toBe(400);
  });
});
