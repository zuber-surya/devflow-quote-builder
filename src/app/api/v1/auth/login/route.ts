import { NextRequest, NextResponse } from "next/server";
import { LoginResponse, ApiResponse } from "@/types/api";
import { z } from "zod";
import { verifyCredentials, signIn } from "@/lib/auth";
import { ACCESS_TOKEN_TTL_SECONDS, generateAccessToken, generateRefreshToken } from "@/lib/jwt";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: {
            code: "VALIDATION_ERROR",
            details: validation.error.errors,
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const user = await verifyCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          error: {
            code: "INVALID_CREDENTIALS",
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    const clientType = request.headers.get("x-client-type") || "web";
    const isMobile = clientType === "flutter" || clientType === "mobile";

    const responseData: LoginResponse = { user };

    if (isMobile) {
      responseData.accessToken = generateAccessToken(user.id);
      responseData.expiresIn = ACCESS_TOKEN_TTL_SECONDS;
      responseData.refreshToken = await generateRefreshToken(user.id);
    } else {
      // Establishes the Auth.js session cookie for the web client.
      // Credentials are re-verified inside signIn's authorize() callback -
      // cheap (single bcrypt compare) and keeps cookie-setting inside
      // Auth.js's own request/response lifecycle rather than hand-rolling it.
      await signIn("credentials", { email, password, redirect: false });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: responseData,
      } as ApiResponse<LoginResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: {
          code: "INTERNAL_ERROR",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
