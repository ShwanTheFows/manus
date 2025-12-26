import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fetch a single QCM by ID (with questions and options)
export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Fetch the QCM with its related questions and options
    const qcm = await prisma.qcm.findUnique({
      where: { id: Number(id) },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!qcm) {
      return NextResponse.json({ error: "QCM introuvable" }, { status: 404 });
    }

    return NextResponse.json({ qcm });
  } catch (error) {
    console.error("Erreur lors du chargement du QCM :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
