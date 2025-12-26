import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const { id } = params;
  const { score, completed, timeSpentMin } = await req.json();

  // Replace with authenticated user's ID in production
  const userId = 1;

  // Check if the user already has an attempt for this QCM
  const existingAttempt = await prisma.qcmHistory.findFirst({
    where: { qcmId: Number(id), userId },
    orderBy: { score: 'desc' }, // In case multiple attempts exist
  });

  if (existingAttempt) {
    // Update only if new score is higher or equal
    if (score >= existingAttempt.score) {
      await prisma.qcmHistory.update({
        where: { id: existingAttempt.id },
        data: {
          score,
          completed,
          timeSpentMin,
        },
      });
    }
  } else {
    // Create new attempt if none exists
    await prisma.qcmHistory.create({
      data: {
        qcmId: Number(id),
        userId,
        score,
        completed,
        timeSpentMin,
      },
    });
  }

  return NextResponse.json({ success: true });
}
