import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET — Fetch user preferences from database
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user by email to get the ID safely
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = currentUser.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        qcmReminders: true,
        shareStatistics: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des préférences" },
      { status: 500 }
    );
  }
}

// PUT — Update user preferences in database
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user by email to get the ID safely
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = currentUser.id;
    const body = await request.json();

    const { emailNotifications, qcmReminders, shareStatistics } = body;

    // Update only the preferences that are provided
    const updateData: {
      emailNotifications?: boolean;
      qcmReminders?: boolean;
      shareStatistics?: boolean;
    } = {};
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (qcmReminders !== undefined) updateData.qcmReminders = qcmReminders;
    if (shareStatistics !== undefined) updateData.shareStatistics = shareStatistics;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        emailNotifications: true,
        qcmReminders: true,
        shareStatistics: true,
      },
    });

    return NextResponse.json({
      message: "Préférences mises à jour avec succès",
      preferences: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des préférences" },
      { status: 500 }
    );
  }
}
