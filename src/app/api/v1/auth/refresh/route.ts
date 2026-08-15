import { NextRequest, NextResponse } from "next/server";
import { RefreshTokenRequest, RefreshTokenResponse, ApiResponse } from "@/types/api";
import { z } from "zod";
import { ACCESS_TOKEN_TTL_SECONDS, generateAccessToken, rotateRefreshToken } from "@/lib/jwt";

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RefreshTokenRequest;

    const validation = refreshSchema.safeParse(body);
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

    const rotated = await rotateRefreshToken(validation.data.refreshToken);
    if (!rotated) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token",
          error: { code: "INVALID_REFRESH_TOKEN" },
        } as ApiResponse,
        { status: 401 }
      );
    }

    const responseData: RefreshTokenResponse = {
      accessToken: generateAccessToken(rotated.userId),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshToken: rotated.refreshToken,
    };

    return NextResponse.json(
      { success: true, message: "Token refreshed", data: responseData } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Token refresh failed",
        error: { code: "INTERNAL_ERROR" },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
