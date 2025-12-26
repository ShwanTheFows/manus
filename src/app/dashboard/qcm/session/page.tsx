"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

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

type QcmSession = {
  qcms: Qcm[];
  currentQcmIndex: number;
  answers: Record<number, Record<number, number>>;
  submitted: Record<number, boolean>;
  scores: Record<number, number | null>;
  startTimes: Record<number, number>;
};

export default function QcmSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<QcmSession | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize session with multiple QCMs
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const idsParam = searchParams.get("ids");
        if (!idsParam) {
          router.push("/dashboard/qcm");
          return;
        }

        const ids = idsParam.split(",").map(Number);
        const qcms: Qcm[] = [];

        // Fetch all QCMs
        for (const id of ids) {
          const res = await fetch(`/api/qcms/${id}`);
          const data: { qcm: Qcm } = await res.json();
          qcms.push(data.qcm);
        }

        // Initialize session state
        const sessionData: QcmSession = {
          qcms,
          currentQcmIndex: 0,
          answers: {},
          submitted: {},
          scores: {},
          startTimes: {},
        };

        qcms.forEach((qcm) => {
          sessionData.answers[qcm.id] = {};
          sessionData.submitted[qcm.id] = false;
          sessionData.scores[qcm.id] = null;
          sessionData.startTimes[qcm.id] = Date.now();
        });

        setSession(sessionData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading QCMs:", error);
        setLoading(false);
      }
    };

    initializeSession();
  }, [searchParams, router]);

  // Update timer for current QCM
  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      const currentQcmId = session.qcms[session.currentQcmIndex].id;
      const startTime = session.startTimes[currentQcmId];
      setTimeSpent(Math.round((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des QCMs...</p>
        </div>
      </div>
    );
  }

  const currentQcm = session.qcms[session.currentQcmIndex];
  const currentAnswers = session.answers[currentQcm.id] || {};
  const isCurrentSubmitted = session.submitted[currentQcm.id] || false;
  const currentScore = session.scores[currentQcm.id];
  const question = currentQcm.questions[currentQuestion];
  const answeredCount = Object.keys(currentAnswers).length;
  const progressPercent = (answeredCount / currentQcm.questions.length) * 100;

  const handleAnswer = (questionId: number, optionId: number) => {
    if (isCurrentSubmitted) return;
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQcm.id]: {
            ...prev.answers[currentQcm.id],
            [questionId]: optionId,
          },
        },
      };
    });
  };

  const handleSubmitQcm = async () => {
    const unanswered = currentQcm.questions.filter((q) => !(q.id in currentAnswers));
    if (unanswered.length > 0) {
      alert("Vous devez répondre à toutes les questions avant de terminer le QCM.");
      return;
    }

    let correct = 0;
    currentQcm.questions.forEach((q) => {
      const chosen = currentAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (correctOption?.id === chosen) correct++;
    });

    const calculatedScore = Math.round((correct / currentQcm.questions.length) * 100);
    const timeSpentMin = Math.round((Date.now() - session.startTimes[currentQcm.id]) / 1000 / 60);

    await fetch(`/api/qcms/${currentQcm.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: calculatedScore,
        completed: true,
        timeSpentMin,
      }),
    });

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        submitted: { ...prev.submitted, [currentQcm.id]: true },
        scores: { ...prev.scores, [currentQcm.id]: calculatedScore },
      };
    });
  };

  const handleNextQcm = () => {
    if (session.currentQcmIndex < session.qcms.length - 1) {
      setCurrentQuestion(0);
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentQcmIndex: prev.currentQcmIndex + 1,
        };
      });
    } else {
      // All QCMs completed
      router.push("/dashboard/qcm");
    }
  };

  const handlePreviousQcm = () => {
    if (session.currentQcmIndex > 0) {
      setCurrentQuestion(0);
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentQcmIndex: prev.currentQcmIndex - 1,
        };
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const completedCount = Object.values(session.submitted).filter(Boolean).length;
  const sessionProgressPercent = (completedCount / session.qcms.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Session Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Session QCMs
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                QCM {session.currentQcmIndex + 1} sur {session.qcms.length} • Question {currentQuestion + 1} sur {currentQcm.questions.length}
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

          {/* Session Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression de la session
              </span>
              <span className="text-sm font-medium text-gray-700">
                {completedCount}/{session.qcms.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${sessionProgressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* QCM Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression du QCM actuel
              </span>
              <span className="text-sm font-medium text-gray-700">
                {answeredCount}/{currentQcm.questions.length}
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

        {!isCurrentSubmitted ? (
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
                  const selected = currentAnswers[question.id] === option.id;

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

              {currentQuestion < currentQcm.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={handleSubmitQcm}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Terminer ce QCM
                </button>
              )}
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Aperçu des questions
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {currentQcm.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`
                      w-full aspect-square rounded-lg font-semibold transition-all
                      flex items-center justify-center
                      ${
                        idx === currentQuestion
                          ? "bg-teal-600 text-white shadow-md"
                          : currentAnswers[q.id]
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
          /* Results Screen for Current QCM */
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
            <div className="mb-8">
              {currentScore !== null && currentScore >= 70 ? (
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
                {currentScore}%
              </div>
              <p className="text-gray-600 text-lg">
                {currentScore !== null && currentScore >= 70
                  ? "Excellent travail ! 🎉"
                  : "Continuez vos efforts ! 💪"}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-teal-50 rounded-lg p-4">
                <BarChart3 className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-teal-600">{currentScore}%</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Temps</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((Date.now() - session.startTimes[currentQcm.id]) / 1000 / 60)}m
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentQcm.questions.length}
                </p>
              </div>
            </div>

            {/* Multi-QCM Navigation */}
            <div className="flex gap-4">
              <button
                onClick={handlePreviousQcm}
                disabled={session.currentQcmIndex === 0}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium transition-all
                  flex items-center justify-center gap-2
                  ${
                    session.currentQcmIndex === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <ChevronLeft className="w-5 h-5" />
                QCM Précédent
              </button>

              {session.currentQcmIndex < session.qcms.length - 1 ? (
                <button
                  onClick={handleNextQcm}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  QCM Suivant
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => router.push("/dashboard/qcm")}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Retour aux QCMs
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
