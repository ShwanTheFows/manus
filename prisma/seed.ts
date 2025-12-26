// prisma/seed.ts
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

type Difficulty = "Facile" | "Moyen" | "Difficile";

type QcmSeed = {
  title: string;
  subject: string; // e.g. "Anatomie"
  difficulty: string; // "Facile" | "Moyen" | "Difficile"
  academicYear?: string;
  year?: number | string;
  durationMin?: number;
  duration?: number;
  questions: Array<{
    text: string;
    options: Array<string | { text: string; isCorrect?: boolean }>;
    correctAnswer?: number; // optional now
  }>;
};

function normalizeDifficulty(d: string): Difficulty {
  const s = d.trim().toLowerCase();
  if (s.startsWith("fac")) return "Facile";
  if (s.startsWith("moy")) return "Moyen";
  if (s.startsWith("dif")) return "Difficile";
  throw new Error(
    `Unknown difficulty "${d}". Expected Facile/Moyen/Difficile.`
  );
}

async function main() {
  // 1) Seed a default admin user
  const password = await hash("password", 12);
  await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      password,
      firstname: "Test",
      lastname: "User",
      city: "Fes",
      academicyear: "Année 2",
      isadmin: true,
    },
  });

  // 2) Load QCMs JSON
  const file = path.join(__dirname, "qcms.json");
  const raw = fs.readFileSync(file, "utf-8");
  const qcms: QcmSeed[] = JSON.parse(raw);

  // 3) Insert Subjects/QCMs/Questions/Options
  for (const item of qcms) {
    const subject = await prisma.subject.upsert({
      where: { name: item.subject },
      update: {},
      create: { name: item.subject },
    });

    const difficulty = normalizeDifficulty(item.difficulty);
    const academicYear =
      item.academicYear ??
      (item.year !== undefined ? `Année ${item.year}` : "Année 1");
    const durationMin = item.durationMin ?? item.duration ?? 30;

    await prisma.qcm.create({
      data: {
        title: item.title,
        difficulty,
        academicYear,
        durationMin,
        subjectId: subject.id,
        questions: {
          create: item.questions.map((q) => ({
            text: q.text,
            options: {
              create: q.options.map((opt, idx) => {
                if (typeof opt === "string") {
                  const correct = idx === q.correctAnswer;
                  return { text: opt, isCorrect: correct };
                } else {
                  const correct = opt.isCorrect ?? idx === q.correctAnswer;
                  return { text: opt.text, isCorrect: correct };
                }
              }),
            },
          })),
        },
      },
    });
  }
}

main()
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
