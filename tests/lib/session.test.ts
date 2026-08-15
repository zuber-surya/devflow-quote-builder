import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@/lib/auth", () => authMock);

const jwtMock = vi.hoisted(() => ({ verifyAccessToken: vi.fn() }));
vi.mock("@/lib/jwt", () => jwtMock);

import { getCurrentUser, requireUser, UnauthorizedError } from "@/lib/session";
import { NextRequest } from "next/server";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/v1/whatever", { headers });
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers the Auth.js session when present", async () => {
    authMock.auth.mockResolvedValue({ user: { id: "user-1" } });
    const user = await getCurrentUser(makeRequest());
    expect(user).toEqual({ id: "user-1" });
    expect(jwtMock.verifyAccessToken).not.toHaveBeenCalled();
  });

  it("falls back to a Bearer JWT when there is no session", async () => {
    authMock.auth.mockResolvedValue(null);
    jwtMock.verifyAccessToken.mockReturnValue({ sub: "user-2" });
    const user = await getCurrentUser(makeRequest({ authorization: "Bearer sometoken" }));
    expect(user).toEqual({ id: "user-2" });
  });

  it("returns null when neither session nor a valid JWT is present", async () => {
    authMock.auth.mockResolvedValue(null);
    const user = await getCurrentUser(makeRequest());
    expect(user).toBeNull();
  });

  it("returns null for a malformed Authorization header", async () => {
    authMock.auth.mockResolvedValue(null);
    const user = await getCurrentUser(makeRequest({ authorization: "NotBearer xyz" }));
    expect(user).toBeNull();
    expect(jwtMock.verifyAccessToken).not.toHaveBeenCalled();
  });

  it("returns null for an invalid/expired JWT", async () => {
    authMock.auth.mockResolvedValue(null);
    jwtMock.verifyAccessToken.mockReturnValue(null);
    const user = await getCurrentUser(makeRequest({ authorization: "Bearer badtoken" }));
    expect(user).toBeNull();
  });
});

describe("requireUser", () => {
  it("throws UnauthorizedError when there is no current user", async () => {
    authMock.auth.mockResolvedValue(null);
    await expect(requireUser(makeRequest())).rejects.toThrow(UnauthorizedError);
  });

  it("returns the user when authenticated", async () => {
    authMock.auth.mockResolvedValue({ user: { id: "user-1" } });
    await expect(requireUser(makeRequest())).resolves.toEqual({ id: "user-1" });
  });
});
