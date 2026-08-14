import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LoginResponse, ApiResponse } from "@/types/api";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
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

    // TODO: Generate session token or JWT based on client type
    // Check x-client-type header:
    // - "flutter" → return JWT access token + refresh token
    // - default/web → set session cookie

    const clientType = request.headers.get("x-client-type") || "web";

    const responseData: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    if (clientType === "flutter") {
      // TODO: Generate JWT tokens
      // responseData.accessToken = generateJWT(user.id);
      // responseData.refreshToken = generateRefreshToken(user.id);
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
