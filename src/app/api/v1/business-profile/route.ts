import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, BusinessProfile } from "@/types/api";
import { prisma } from "@/lib/db";
import { requireUser, UnauthorizedError } from "@/lib/session";

const businessProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(255),
  ownerName: z.string().min(1, "Owner name is required").max(150),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(1, "Phone is required").max(20),
  website: z.string().max(255),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  taxNumber: z.string().max(50).optional(),
  currency: z.string().max(3).default("INR"),
  primaryAccentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex color, e.g. #334537")
    .optional(),
  defaultFooterNote: z.string().optional(),
  defaultTermsNote: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Business profile not set up yet",
          error: { code: "NOT_FOUND" },
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "OK", data: profile } as ApiResponse<BusinessProfile>,
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, message: "Authentication required", error: { code: "UNAUTHORIZED" } } as ApiResponse,
        { status: 401 }
      );
    }
    console.error("Get business profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch business profile", error: { code: "INTERNAL_ERROR" } } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();

    const validation = businessProfileSchema.safeParse(body);
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

    const data = validation.data;

    // Singleton per user - PUT is create-or-replace, not a partial patch.
    const profile = await prisma.businessProfile.upsert({
      where: { userId: user.id },
      create: { ...data, userId: user.id },
      update: data,
    });

    return NextResponse.json(
      { success: true, message: "Business profile saved", data: profile } as ApiResponse<BusinessProfile>,
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, message: "Authentication required", error: { code: "UNAUTHORIZED" } } as ApiResponse,
        { status: 401 }
      );
    }
    console.error("Update business profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save business profile", error: { code: "INTERNAL_ERROR" } } as ApiResponse,
      { status: 500 }
    );
  }
}
