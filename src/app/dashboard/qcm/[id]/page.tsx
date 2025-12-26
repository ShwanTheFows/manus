"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, BarChart3 } from "lucide-react";

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
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!qcm)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du QCM...</p>
        </div>
      </div>
    );

  const question = qcm.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / qcm.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {qcm.title}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Question {currentQuestion + 1} sur {qcm.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-teal-600" />
                <span className="font-mono font-semibold text-teal-600">
                  {formatTime(timeSpent)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression
              </span>
              <span className="text-sm font-medium text-gray-700">
                {answeredCount}/{qcm.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {!submitted ? (
          <>
            {/* Question Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                  {question.text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(question.id, option.id)}
                      className={`
                        w-full text-left p-5 rounded-lg border-2 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
                        ${
                          selected
                            ? "border-teal-600 bg-teal-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50"
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`
                            flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1
                            flex items-center justify-center
                            ${
                              selected
                                ? "border-teal-600 bg-teal-600"
                                : "border-gray-300 bg-white"
                            }
                          `}
                        >
                          {selected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-800 font-medium leading-relaxed">
                          {option.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium transition-all
                  ${
                    currentQuestion === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                ← Précédent
              </button>

              {currentQuestion < qcm.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Terminer le QCM
                </button>
              )}
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Aperçu des questions
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {qcm.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`
                      w-full aspect-square rounded-lg font-semibold transition-all
                      flex items-center justify-center
                      ${
                        idx === currentQuestion
                          ? "bg-teal-600 text-white shadow-md"
                          : answers[q.id]
                          ? "bg-teal-100 text-teal-700 border-2 border-teal-300"
                          : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Results Screen */
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-8">
              {score !== null && score >= 70 ? (
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Résultats
            </h2>

            <div className="my-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {score}%
              </div>
              <p className="text-gray-600 text-lg">
                {score !== null && score >= 70
                  ? "Excellent travail ! 🎉"
                  : "Continuez vos efforts ! 💪"}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-teal-50 rounded-lg p-4">
                <BarChart3 className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-teal-600">{score}%</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Temps</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((Date.now() - startTime) / 1000 / 60)}m
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {qcm.questions.length}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/qcm")}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-medium"
            >
              Retour aux QCMs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
