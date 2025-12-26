import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const qcmId = Number(id);

  // Replace with authenticated user's ID in production
  const userId = 1;

  await prisma.qcmHistory.updateMany({
    where: {
      qcmId,
      userId,
    },
    data: {
      completed: false,
    },
  });

  return NextResponse.json({ success: true });
}
