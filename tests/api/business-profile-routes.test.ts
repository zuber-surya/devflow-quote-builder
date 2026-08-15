import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const dbMock = vi.hoisted(() => ({
  prisma: {
    businessProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("@/lib/db", () => dbMock);

const sessionMock = vi.hoisted(() => {
  class UnauthorizedError extends Error {}
  return {
    requireUser: vi.fn(),
    UnauthorizedError,
  };
});
vi.mock("@/lib/session", () => sessionMock);

const fsMock = vi.hoisted(() => ({
  mkdir: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve()),
}));
vi.mock("fs/promises", () => fsMock);

import { GET, PUT } from "@/app/api/v1/business-profile/route";
import { POST as uploadLogoHandler } from "@/app/api/v1/business-profile/upload-logo/route";

const validProfileBody = {
  businessName: "Acme Co",
  ownerName: "Alice",
  email: "alice@acme.com",
  phone: "1234567890",
  website: "https://acme.com",
  address: "123 Main St",
  city: "Metropolis",
  state: "State",
  country: "Country",
  postalCode: "12345",
};

function getRequest(): NextRequest {
  return new NextRequest("http://localhost/api/v1/business-profile");
}

function putRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/v1/business-profile", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/v1/business-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    sessionMock.requireUser.mockRejectedValue(new sessionMock.UnauthorizedError());
    const res = await GET(getRequest());
    expect(res.status).toBe(401);
  });

  it("returns 404 when the profile hasn't been created yet", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue(null);
    const res = await GET(getRequest());
    expect(res.status).toBe(404);
  });

  it("returns the profile, scoped to the authenticated user", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({
      userId: "user-1",
      businessName: "Acme Co",
    });

    const res = await GET(getRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.businessName).toBe("Acme Co");
    expect(dbMock.prisma.businessProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });
});

describe("PUT /api/v1/business-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    sessionMock.requireUser.mockRejectedValue(new sessionMock.UnauthorizedError());
    const res = await PUT(putRequest(validProfileBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 when a required field is missing", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    const { businessName: _drop, ...incomplete } = validProfileBody;
    const res = await PUT(putRequest(incomplete));
    expect(res.status).toBe(400);
  });

  it("upserts scoped to the authenticated user, defaulting currency to INR", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.upsert.mockResolvedValue({ ...validProfileBody, userId: "user-1" });

    const res = await PUT(putRequest(validProfileBody));
    expect(res.status).toBe(200);

    const call = dbMock.prisma.businessProfile.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ userId: "user-1" });
    expect(call.create.userId).toBe("user-1");
    expect(call.create.currency).toBe("INR");
    expect(call.update.currency).toBe("INR");
  });

  it("respects an explicitly provided currency", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.upsert.mockResolvedValue({});

    await PUT(putRequest({ ...validProfileBody, currency: "USD" }));

    const call = dbMock.prisma.businessProfile.upsert.mock.calls[0][0];
    expect(call.create.currency).toBe("USD");
  });

  it("rejects an email over the column's 255-char width instead of failing at the DB layer", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    const tooLongEmail = "a".repeat(250) + "@x.com"; // valid shape, over 255 chars
    const res = await PUT(putRequest({ ...validProfileBody, email: tooLongEmail }));
    expect(res.status).toBe(400);
  });

  it("rejects a malformed primaryAccentColor instead of persisting garbage as a hex color", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    const res = await PUT(putRequest({ ...validProfileBody, primaryAccentColor: "not-a-color" }));
    expect(res.status).toBe(400);
  });

  it("accepts a well-formed hex color", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.upsert.mockResolvedValue({});
    const res = await PUT(putRequest({ ...validProfileBody, primaryAccentColor: "#334537" }));
    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/business-profile/upload-logo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function uploadRequest(file: File | null, headers: Record<string, string> = {}): NextRequest {
    const formData = new FormData();
    if (file) formData.set("logo", file);
    return new NextRequest("http://localhost/api/v1/business-profile/upload-logo", {
      method: "POST",
      headers,
      body: formData,
    });
  }

  // Real magic bytes, since the route verifies file content, not the
  // client-declared Content-Type.
  const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]);
  const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0, 0, 0]);

  it("returns 401 when not authenticated", async () => {
    sessionMock.requireUser.mockRejectedValue(new sessionMock.UnauthorizedError());
    const res = await uploadLogoHandler(uploadRequest(null));
    expect(res.status).toBe(401);
  });

  it("returns 404 if the business profile doesn't exist yet", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue(null);
    const file = new File([PNG_BYTES], "logo.png", { type: "image/png" });
    const res = await uploadLogoHandler(uploadRequest(file));
    expect(res.status).toBe(404);
  });

  it("returns 400 when no file is provided", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({ userId: "user-1" });
    const res = await uploadLogoHandler(uploadRequest(null));
    expect(res.status).toBe(400);
  });

  it("rejects a file whose content isn't actually a PNG/JPEG, even if Content-Type claims otherwise", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({ userId: "user-1" });
    // Content-Type says image/png, but the bytes are plain text - this is
    // exactly the spoofing case the magic-byte check exists to catch.
    const file = new File(["<script>alert(1)</script>"], "logo.png", { type: "image/png" });
    const res = await uploadLogoHandler(uploadRequest(file));
    expect(res.status).toBe(400);
  });

  it("rejects a file over 5MB", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({ userId: "user-1" });
    const bigContent = new Uint8Array(5 * 1024 * 1024 + 1);
    bigContent.set(PNG_BYTES);
    const file = new File([bigContent], "logo.png", { type: "image/png" });
    const res = await uploadLogoHandler(uploadRequest(file));
    expect(res.status).toBe(400);
  });

  it("rejects an oversized request early via Content-Length, before parsing the body", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({ userId: "user-1" });
    const file = new File([PNG_BYTES], "logo.png", { type: "image/png" });
    const res = await uploadLogoHandler(
      uploadRequest(file, { "content-length": String(50 * 1024 * 1024) })
    );
    expect(res.status).toBe(400);
  });

  it("accepts a real JPEG (not just PNG)", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({ userId: "user-1" });
    dbMock.prisma.businessProfile.update.mockResolvedValue({});

    const file = new File([JPEG_BYTES], "logo.jpg", { type: "image/jpeg" });
    const res = await uploadLogoHandler(uploadRequest(file));

    expect(res.status).toBe(200);
    const updateCall = dbMock.prisma.businessProfile.update.mock.calls[0][0];
    expect(updateCall.data.logoUrl).toMatch(/\.jpg$/);
  });

  it("on success: writes the file under the user's own directory and updates logoUrl", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({ userId: "user-1" });
    dbMock.prisma.businessProfile.update.mockResolvedValue({ userId: "user-1", logoUrl: "x" });

    const file = new File([PNG_BYTES], "logo.png", { type: "image/png" });
    const res = await uploadLogoHandler(uploadRequest(file));

    expect(res.status).toBe(200);
    expect(fsMock.mkdir).toHaveBeenCalledWith(
      expect.stringContaining("user-1"),
      { recursive: true }
    );
    const updateCall = dbMock.prisma.businessProfile.update.mock.calls[0][0];
    expect(updateCall.where).toEqual({ userId: "user-1" });
    expect(updateCall.data.logoUrl).toContain("/business-logos/user-1/");
    expect(updateCall.data.logoUrl).toMatch(/\.png$/);
  });

  it("ignores the client-supplied filename entirely - a path-traversal name has zero effect", async () => {
    sessionMock.requireUser.mockResolvedValue({ id: "user-1" });
    dbMock.prisma.businessProfile.findUnique.mockResolvedValue({ userId: "user-1" });
    dbMock.prisma.businessProfile.update.mockResolvedValue({});

    const file = new File([PNG_BYTES], "../../etc/passwd", { type: "image/png" });
    const res = await uploadLogoHandler(uploadRequest(file));

    expect(res.status).toBe(200);
    const updateCall = dbMock.prisma.businessProfile.update.mock.calls[0][0];
    // The stored name is fully server-generated (timestamp + verified
    // extension) - the original filename never reaches the filesystem path
    // at all, so there's nothing for a malicious name to traverse with.
    expect(updateCall.data.logoUrl).toMatch(/^\/business-logos\/user-1\/\d+\.png$/);
  });
});
