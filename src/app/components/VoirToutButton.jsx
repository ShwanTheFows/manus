"use client";

import { useRouter } from "next/navigation";

export default function VoirToutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/dashboard/qcm")}
      className="text-teal-600 hover:text-teal-700 text-sm font-medium cursor-pointer"
    >
      Voir tout →
    </button>
  );
}
