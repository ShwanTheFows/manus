"use client";

import { useRouter } from "next/navigation";

export default function StartQcmButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard/qcm");
  };

  return (
    <button
      onClick={handleClick}
      className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300 text-sm font-medium"
    >
      Commencer un QCM →
    </button>
  );
}
