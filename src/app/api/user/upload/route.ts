import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// For this implementation, we'll store image URLs in the database
// In production, you'd use a service like S3, Cloudinary, or similar

// PUT — Update profile picture or banner
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "profile" or "banner"

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to base64 for storage (in production, use cloud storage)
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user with image data
    const updateData: any = {};
    if (type === "profile") {
      updateData.profilePicture = dataUrl;
    } else if (type === "banner") {
      updateData.bannerImage = dataUrl;
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'profile' or 'banner'" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Image uploaded successfully",
      imageUrl: type === "profile" ? updatedUser.profilePicture : updatedUser.bannerImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement de l'image" },
      { status: 500 }
    );
  }
}
