import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { ApiResponse, BusinessProfile } from "@/types/api";
import { prisma } from "@/lib/db";
import { requireUser, UnauthorizedError } from "@/lib/session";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Real file-content signatures ("magic bytes"), not the client-supplied
// Content-Type - a request can claim image/png while uploading anything
// (e.g. an .html/.svg payload), and since this file gets served statically
// from /public, trusting the declared MIME type is a stored-content-type
// spoofing hole. The stored extension is derived from *this* check, never
// from the client's filename.
const SIGNATURES: Array<{ ext: string; bytes: number[] }> = [
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
];

function detectImageExtension(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) return sig.ext;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const existing = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Create your business profile before uploading a logo",
          error: { code: "NOT_FOUND" },
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Cheap, honest-client pre-check before buffering the body. Doesn't
    // stop a client that lies about Content-Length, but a hard platform-
    // level body size limit (reverse proxy / hosting config) is still
    // needed for that - not yet set since the deployment platform isn't
    // finalized (see M9 in decisions.md).
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_SIZE_BYTES * 2) {
      return NextResponse.json(
        { success: false, message: "Logo must be 5MB or smaller", error: { code: "VALIDATION_ERROR" } } as ApiResponse,
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("logo");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No logo file provided", error: { code: "VALIDATION_ERROR" } } as ApiResponse,
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Logo must be 5MB or smaller", error: { code: "VALIDATION_ERROR" } } as ApiResponse,
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedExt = detectImageExtension(buffer);
    if (!detectedExt) {
      return NextResponse.json(
        {
          success: false,
          message: "Logo must be a valid JPEG or PNG image",
          error: { code: "VALIDATION_ERROR" },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Filename is entirely server-generated - timestamp plus the extension
    // we verified from magic bytes, never anything derived from client
    // input, so there's no spoofed-extension or path-traversal surface.
    const filename = `${Date.now()}.${detectedExt}`;
    const userDir = path.join(process.cwd(), "public", "business-logos", user.id);
    await mkdir(userDir, { recursive: true });
    await writeFile(path.join(userDir, filename), buffer);

    const logoUrl = `/business-logos/${user.id}/${filename}`;
    const profile = await prisma.businessProfile.update({
      where: { userId: user.id },
      data: { logoUrl, logoUploadedAt: new Date() },
    });

    return NextResponse.json(
      { success: true, message: "Logo uploaded", data: profile } as ApiResponse<BusinessProfile>,
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, message: "Authentication required", error: { code: "UNAUTHORIZED" } } as ApiResponse,
        { status: 401 }
      );
    }
    console.error("Upload logo error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload logo", error: { code: "INTERNAL_ERROR" } } as ApiResponse,
      { status: 500 }
    );
  }
}
