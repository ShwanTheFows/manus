import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET — Fetch user statistics
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

    // Fetch all QCM attempts for the user
    const allQcmAttempts = await prisma.qcmHistory.findMany({
      where: { userId },
      orderBy: { attemptedAt: "desc" },
      include: { qcm: true },
    });

    // Calculate statistics
    const totalQcmsCompleted = allQcmAttempts.filter((q) => q.completed).length;
    
    const avgScore = totalQcmsCompleted
      ? Math.round(
          allQcmAttempts
            .filter((q) => q.completed)
            .reduce((sum, q) => sum + (q.score || 0), 0) / totalQcmsCompleted
        )
      : 0;

    const totalTimeSpent = allQcmAttempts
      .filter((q) => q.completed)
      .reduce((sum, q) => sum + (q.timeSpentMin || 0), 0);

    const bestScore = allQcmAttempts.length > 0
      ? Math.max(...allQcmAttempts.map((q) => q.score || 0))
      : 0;

    // Get recent week stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekAttempts = allQcmAttempts.filter(
      (q) => new Date(q.attemptedAt) >= oneWeekAgo
    ).length;

    // Get previous week average for comparison
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const prevWeekAttempts = allQcmAttempts.filter(
      (q) => new Date(q.attemptedAt) >= twoWeeksAgo && new Date(q.attemptedAt) < oneWeekAgo
    );
    
    const prevWeekAvgScore = prevWeekAttempts.length > 0
      ? Math.round(
          prevWeekAttempts.reduce((sum, q) => sum + (q.score || 0), 0) / prevWeekAttempts.length
        )
      : 0;

    const scoreImprovement = prevWeekAvgScore > 0 ? avgScore - prevWeekAvgScore : 0;

    return NextResponse.json({
      totalQcmsCompleted,
      avgScore,
      bestScore,
      totalTimeSpent,
      thisWeekAttempts,
      scoreImprovement,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}
