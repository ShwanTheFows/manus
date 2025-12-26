"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, Target, Zap, Award, Clock, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import DashboardLayout from "@/src/app/components/layouts/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressionData {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number;
  successRate: number;
  thisWeekAttempts: number;
  thisMonthAttempts: number;
  scoresBySubject: Array<{ subject: string; score: number; attempts: number }>;
  scoreHistory: Array<{ date: string; score: number; attempts: number }>;
  difficultyStats: Array<{ difficulty: string; attempts: number; avgScore: number }>;
}

export default function ProgressionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProgressionData();
    }
  }, [status]);

  const fetchProgressionData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/progression");
      if (!response.ok) throw new Error("Failed to fetch progression data");
      const progressionData = await response.json();
      setData(progressionData);
    } catch (error) {
      console.error("Error fetching progression data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Votre Progression</h1>
            <p className="text-gray-600 mt-1">Suivez vos performances et améliorez-vous</p>
          </div>
          <div className="flex gap-2">
            {(["week", "month", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-teal-600"
                }`}
              >
                {range === "week" ? "Semaine" : range === "month" ? "Mois" : "Tout"}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Attempts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{data.totalAttempts}</p>
            <p className="text-sm text-gray-500 mt-1">Tentatives totales</p>
          </div>

          {/* Average Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Moyenne
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{data.averageScore}%</p>
            <p className="text-sm text-gray-500 mt-1">Score moyen</p>
          </div>

          {/* Best Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Meilleur
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{data.bestScore}%</p>
            <p className="text-sm text-gray-500 mt-1">Meilleur score</p>
          </div>

          {/* Success Rate */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Taux
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{data.successRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Taux de réussite</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score History Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-teal-600" />
              Historique des scores
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#14b8a6" 
                    strokeWidth={2}
                    dot={{ fill: "#14b8a6", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Score (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Performance par difficulté
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.difficultyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="difficulty" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#14b8a6" name="Score moyen (%)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="attempts" fill="#06b6d4" name="Tentatives" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Performance par matière
          </h2>
          <div className="space-y-4">
            {data.scoresBySubject.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{subject.subject}</p>
                  <p className="text-sm text-gray-500">{subject.attempts} tentatives</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-800 w-12 text-right">{subject.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Temps total</h3>
            </div>
            <p className="text-3xl font-bold text-teal-600">{data.totalTimeSpent}h</p>
            <p className="text-sm text-gray-600 mt-2">Temps d&apos;étude cumulé</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Cette semaine</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{data.thisWeekAttempts}</p>
            <p className="text-sm text-gray-600 mt-2">Tentatives cette semaine</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Ce mois</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{data.thisMonthAttempts}</p>
            <p className="text-sm text-gray-600 mt-2">Tentatives ce mois</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
