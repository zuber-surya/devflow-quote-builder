import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateResetToken, sendPasswordResetEmail } from "@/lib/password-reset";

const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Always the same response, whether or not the email matched a real
// account - a different response for "unknown email" is an account
// enumeration vector.
const GENERIC_SUCCESS: ApiResponse = {
  success: true,
  message: "If an account exists for that email, a reset link has been sent.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = requestSchema.safeParse(body);
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

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = await generateResetToken(user.id);
      // Deliberately not awaited: the "user not found" branch below does no
      // network call, so awaiting an email API here would make this branch
      // measurably slower and leak account existence via response timing
      // even though the response body is identical either way. Delivery
      // failure is logged but never surfaces to the caller for the same
      // reason. Caveat: on a serverless runtime this background promise can
      // be killed once the response is sent unless the platform's
      // keep-alive mechanism is used (e.g. Vercel's waitUntil) - not yet
      // wired up since the deployment platform isn't finalized (see M9).
      sendPasswordResetEmail(user.email, rawToken).catch((emailError) => {
        console.error("Password reset email failed to send:", emailError);
      });
    }

    return NextResponse.json(GENERIC_SUCCESS, { status: 200 });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Password reset request failed",
        error: { code: "INTERNAL_ERROR" },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
