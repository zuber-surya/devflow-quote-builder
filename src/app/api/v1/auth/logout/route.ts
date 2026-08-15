import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";
import { z } from "zod";
import { signOut } from "@/lib/auth";
import { revokeRefreshToken } from "@/lib/jwt";

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validation = logoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: { code: "VALIDATION_ERROR", details: validation.error.errors },
        } as ApiResponse,
        { status: 400 }
      );
    }
    const { refreshToken } = validation.data;

    const clientType = request.headers.get("x-client-type") || "web";
    const isMobile = clientType === "flutter" || clientType === "mobile";

    if (isMobile) {
      if (refreshToken) await revokeRefreshToken(refreshToken);
    } else {
      await signOut({ redirect: false });
    }

    return NextResponse.json(
      { success: true, message: "Logout successful" } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
        error: { code: "INTERNAL_ERROR" },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
