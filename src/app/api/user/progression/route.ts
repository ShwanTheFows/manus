import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

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

    // Fetch all QCM history for the user
    const history = await prisma.qcmHistory.findMany({
      where: { userId },
      include: {
        qcm: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { attemptedAt: "asc" },
    });

    if (history.length === 0) {
      return NextResponse.json({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalTimeSpent: 0,
        successRate: 0,
        thisWeekAttempts: 0,
        thisMonthAttempts: 0,
        scoresBySubject: [],
        scoreHistory: [],
        difficultyStats: [],
      });
    }

    // Calculate basic statistics
    const scores = history.map((h) => h.score);
    const totalAttempts = history.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const totalTimeSpent = Math.round(
      history.reduce((sum, h) => sum + (h.timeSpentMin || 0), 0) / 60
    );
    const successRate = Math.round(
      (history.filter((h) => h.score >= 70).length / totalAttempts) * 100
    );

    // Calculate this week and month attempts
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekAttempts = history.filter(
      (h) => new Date(h.attemptedAt) >= weekAgo
    ).length;
    const thisMonthAttempts = history.filter(
      (h) => new Date(h.attemptedAt) >= monthAgo
    ).length;

    // Group by subject
    const subjectMap = new Map<string, { scores: number[]; attempts: number }>();
    history.forEach((h) => {
      const subjectName = h.qcm.subject.name;
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, { scores: [], attempts: 0 });
      }
      const subject = subjectMap.get(subjectName)!;
      subject.scores.push(h.score);
      subject.attempts += 1;
    });

    const scoresBySubject = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      attempts: data.attempts,
    }));

    // Create score history (last 30 days)
    interface ScoreHistoryItem {
      date: string;
      score: number;
      attempts: number;
    }
    const scoreHistory = history
      .filter((h) => new Date(h.attemptedAt) >= monthAgo)
      .reduce((acc: ScoreHistoryItem[], h) => {
        const date = new Date(h.attemptedAt).toLocaleDateString("fr-FR");
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.score = (existing.score + h.score) / 2;
          existing.attempts += 1;
        } else {
          acc.push({ date, score: h.score, attempts: 1 });
        }
        return acc;
      }, []);

    // Group by difficulty
    const difficultyMap = new Map<string, { scores: number[]; attempts: number }>();
    history.forEach((h) => {
      const difficulty = h.qcm.difficulty;
      if (!difficultyMap.has(difficulty)) {
        difficultyMap.set(difficulty, { scores: [], attempts: 0 });
      }
      const diff = difficultyMap.get(difficulty)!;
      diff.scores.push(h.score);
      diff.attempts += 1;
    });

    const difficultyStats = Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      attempts: data.attempts,
    }));

    return NextResponse.json({
      totalAttempts,
      averageScore,
      bestScore,
      worstScore,
      totalTimeSpent,
      successRate,
      thisWeekAttempts,
      thisMonthAttempts,
      scoresBySubject,
      scoreHistory,
      difficultyStats,
    });
  } catch (error) {
    console.error("Error fetching progression data:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des données de progression" },
      { status: 500 }
    );
  }
}
