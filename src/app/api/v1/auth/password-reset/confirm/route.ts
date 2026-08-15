import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { consumePasswordReset } from "@/lib/password-reset";
import { revokeAllRefreshTokensForUser } from "@/lib/jwt";

const confirmSchema = z.object({
  token: z.string().min(1, "token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = confirmSchema.safeParse(body);
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

    const { token, newPassword } = validation.data;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Validates, single-use-claims, and applies the new password all in
    // one transaction - see consumePasswordReset's docstring for why this
    // can't safely be three separate calls.
    const result = await consumePasswordReset(token, hashedPassword);
    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset token",
          error: { code: "INVALID_RESET_TOKEN" },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // A password reset likely means the old password was compromised -
    // invalidate every existing mobile session too, not just this token.
    await revokeAllRefreshTokensForUser(result.userId);

    return NextResponse.json(
      { success: true, message: "Password reset successful" } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset confirm error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Password reset failed",
        error: { code: "INTERNAL_ERROR" },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
