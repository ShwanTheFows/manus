import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define types
type QcmHistory = {
  userId: number;
  score: number | null;
  attemptedAt: Date;
  timeSpentMin: number | null; // <-- nullable
};

type QcmQuestion = {
  id: number;
};

type Qcm = {
  id: number;
  title: string;
  difficulty: string;
  durationMin: number;
  academicYear: string;
  subject?: {
    name: string;
  };
  histories: QcmHistory[];
  questions: QcmQuestion[];
};

// Type for response QCM
type ModuleQcm = {
  id: number;
  title: string;
  difficulty: string;
  completed: boolean;
  score: number | null;
  totalQuestions: number;
  lastAttempt: string | null;
  year: string;
  duration: string;
  timeSpentMin: number; // Keep as non-nullable in response
};

type Module = {
  id: string;
  name: string;
  completion: number;
  avgScore: number;
  qcms: ModuleQcm[];
};

// GET — Fetch all QCMs grouped by subject with user scores
export async function GET() {
  try {
    const userId = 1; // TODO: Replace with actual session user

    const qcms: Qcm[] = await prisma.qcm.findMany({
      include: {
        subject: true,
        histories: true,
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const modulesMap: Record<string, Module> = {};

    qcms.forEach((qcm) => {
      const subjectName = qcm.subject?.name || "Autres";

      if (!modulesMap[subjectName]) {
        modulesMap[subjectName] = {
          id: subjectName.toLowerCase(),
          name: subjectName,
          completion: 0,
          avgScore: 0,
          qcms: [],
        };
      }

      const userHistories = qcm.histories.filter((h) => h.userId === userId);
      const lastAttempt = userHistories
        .sort((a, b) => b.attemptedAt.getTime() - a.attemptedAt.getTime())[0]
        ?.attemptedAt.toISOString() || null;

      modulesMap[subjectName].qcms.push({
        id: qcm.id,
        title: qcm.title,
        difficulty: qcm.difficulty,
        completed: userHistories.length > 0,
        score: userHistories[0]?.score ?? null,
        totalQuestions: qcm.questions?.length || 10,
        lastAttempt,
        year: qcm.academicYear,
        duration: `${qcm.durationMin} min`,
        timeSpentMin: userHistories[0]?.timeSpentMin ?? 0, // default to 0 if null
      });
    });

    const modules: Module[] = Object.values(modulesMap);
    modules.forEach((mod) => {
      const completedQcms = mod.qcms.filter((q) => q.completed);
      mod.completion = mod.qcms.length
        ? Math.round((completedQcms.length / mod.qcms.length) * 100)
        : 0;
      mod.avgScore = completedQcms.length
        ? Math.round(
            completedQcms.reduce((sum, q) => sum + (q.score || 0), 0) /
              completedQcms.length
          )
        : 0;
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Error fetching QCMs:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des QCMs" },
      { status: 500 }
    );
  }
}
