"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type QcmOption = {
  id: number;
  text: string;
  isCorrect: boolean;
};

type QcmQuestion = {
  id: number;
  text: string;
  options: QcmOption[];
};

type Qcm = {
  id: number;
  title: string;
  questions: QcmQuestion[];
  completed?: boolean;
  score?: number | null;
  timeSpentMin?: number;
};

export default function QcmAttemptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [qcm, setQcm] = useState<Qcm | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [startTime] = useState<number>(Date.now()); // Record start time

  useEffect(() => {
    const fetchQcm = async () => {
      const res = await fetch(`/api/qcms/${id}`);
      const data: { qcm: Qcm } = await res.json();
      setQcm(data.qcm);
    };
    fetchQcm();
  }, [id]);

  const handleAnswer = (questionId: number, optionId: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!qcm) return;

    const unanswered = qcm.questions.filter((q) => !(q.id in answers));
    if (unanswered.length > 0) {
      alert(
        "Vous devez répondre à toutes les questions avant de terminer le QCM."
      );
      return;
    }

    setSubmitted(true);

    let correct = 0;
    qcm.questions.forEach((q) => {
      const chosen = answers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (correctOption?.id === chosen) correct++;
    });

    const calculatedScore = Math.round((correct / qcm.questions.length) * 100);
    setScore(calculatedScore);

    const timeSpentMin = Math.round((Date.now() - startTime) / 1000 / 60);

    await fetch(`/api/qcms/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: calculatedScore,
        completed: true,
        timeSpentMin,
      }),
    });
  };

  if (!qcm)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Chargement du QCM...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        {qcm.title}
      </h1>

      {qcm.questions.map((question, index) => (
        <div key={question.id} className="mb-8">
          <p className="font-semibold text-gray-800 mb-4 text-lg md:text-xl">
            {index + 1}. {question.text}
          </p>
          <div className="space-y-3">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              const isCorrect = submitted && option.isCorrect && selected;
              const isWrong = submitted && selected && !option.isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(question.id, option.id)}
                  className={`
                    w-full text-gray-800 text-center p-4 rounded-lg border transition-all
                    shadow-sm hover:shadow-md transform hover:-translate-y-0.5
                    focus:outline-none focus:ring-2 focus:ring-teal-400
                    ${selected ? "border-teal-600 bg-teal-50" : "border-gray-300 hover:bg-gray-50"}
                    ${isCorrect ? "bg-green-100 border-green-600" : ""}
                    ${isWrong ? "bg-red-100 border-red-600" : ""}
                  `}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-8 w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all transform hover:scale-105 font-medium shadow-md"
        >
          Terminer le QCM
        </button>
      ) : (
        <div className="mt-8 text-center space-y-4">
          <div className="text-3xl font-bold text-gray-800 animate-pulse">
            Votre score : {score}%
          </div>
          <button
            onClick={() => {
              router.push("/dashboard/qcm");
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md"
          >
            Retour
          </button>
        </div>
      )}
    </div>
  );
}
