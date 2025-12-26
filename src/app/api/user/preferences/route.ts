import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET — Fetch user preferences from session/local storage
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Preferences are typically stored in local storage on the client side
    // This endpoint can be used to fetch default preferences or from a database
    const defaultPreferences = {
      language: "fr",
      theme: "light",
      emailNotifications: true,
      qcmReminders: true,
      shareStatistics: false,
    };

    return NextResponse.json(defaultPreferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des préférences" },
      { status: 500 }
    );
  }
}

// PUT — Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { language, theme, emailNotifications, qcmReminders, shareStatistics } = body;

    // Validate input
    if (!language || !theme) {
      return NextResponse.json(
        { error: "Language and theme are required" },
        { status: 400 }
      );
    }

    // In a real application, you would save these to a database
    // For now, we'll just return success and let the client handle storage
    const preferences = {
      language,
      theme,
      emailNotifications: emailNotifications ?? true,
      qcmReminders: qcmReminders ?? true,
      shareStatistics: shareStatistics ?? false,
    };

    return NextResponse.json({
      message: "Préférences mises à jour avec succès",
      preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des préférences" },
      { status: 500 }
    );
  }
}
