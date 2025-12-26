"use client";
import {
  ChevronDown,
  Book,
  Filter,
  Star,
  Search,
  X,
  //ArrowRight,
  BarChart2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/src/app/components/layouts/DashboardLayout";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useRouter, usePathname } from "next/navigation";


type Difficulty = "Facile" | "Moyen" | "Difficile";
type QCM = {
  id: number;
  title: string;
  duration: string;
  difficulty: Difficulty;
  completed: boolean;
  score?: number | null;
  totalQuestions: number;
  lastAttempt?: string | null;
  subject?: string;
  year?: number;
  timeSpentMin?: number;
};
type Module = {
  id: string;
  name: string;
  completion: number;
  avgScore: number;
  qcms: QCM[];
};

const difficultyColors: Record<Difficulty, string> = {
  Facile: "bg-green-100 text-green-800",
  Moyen: "bg-yellow-100 text-yellow-800",
  Difficile: "bg-red-100 text-red-800",
};

const difficultyOrder: Record<Difficulty, number> = {
  Facile: 1,
  Moyen: 2,
  Difficile: 3,
};

export default function QcmPreparationPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();


  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    let mounted = true;

    const fetchModules = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/qcms");
        if (!res.ok) throw new Error("Failed to fetch qcms");
        const data = await res.json();
        if (!mounted) return;

        setModules(Array.isArray(data.modules) ? data.modules : []);
        if (data.modules.length > 0) setExpandedModule(data.modules[0].id);
      } catch (err) {
        console.error("Error fetching modules:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Refetch only when on this page
    if (pathname === "/dashboard/qcm") {
      fetchModules();
    }

    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Keep the same filtering/sorting logic you had
  const filteredModules = useMemo(() => {
    return modules
      .map((module) => ({
        ...module,
        qcms: module.qcms
          .filter(
            (qcm) =>
              qcm.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
              (selectedDifficulty === "all" ||
                qcm.difficulty === selectedDifficulty) &&
              (selectedYear === "all" || qcm.year === selectedYear)
          )
          .sort(
            (a, b) =>
              difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
          ),
      }))
      .filter((module) => module.qcms.length > 0)
      .sort((a, b) => b.completion - a.completion);
  }, [modules, searchTerm, selectedDifficulty, selectedYear]);

  const progressData = modules.map((module) => ({
    name: module.name,
    completion: module.completion,
    score: module.avgScore,
  }));

  const overallStats = useMemo(() => {
    const allQcms = modules.flatMap((module) => module.qcms);
    const completedQcms = allQcms.filter((qcm) => qcm.completed);

    return {
      totalQcms: allQcms.length,
      completedQcms: completedQcms.length,
      overallCompletion: allQcms.length
        ? Math.round((completedQcms.length / allQcms.length) * 100)
        : 0,
      avgScore:
        completedQcms.length > 0
          ? Math.round(
              completedQcms.reduce((sum, qcm) => sum + (qcm.score || 0), 0) /
                completedQcms.length
            )
          : 0,
    };
  }, [modules]);

  const averageTime = useMemo(() => {
    const allQcms = modules.flatMap((module) => module.qcms);
    const completedQcms = allQcms.filter((qcm) => qcm.completed);

    if (completedQcms.length === 0) return 0;

    const totalTime = completedQcms.reduce(
      (sum, qcm) => sum + (qcm.timeSpentMin || 0),
      0
    );

    return Math.round(totalTime / completedQcms.length);
  }, [modules]);


  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedDifficulty("all");
    setSearchTerm("");
  };

  if (loading) {
    return (
      <DashboardLayout key={Date.now()}>
        <div className="flex justify-center items-center h-screen text-gray-600">
          Chargement des QCMs...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout key={Date.now()}>
      <div className="flex flex-col pt-6 md:flex-row bg-gray-50 min-h-screen">
        {sidebarOpen && (
          <aside className="w-full md:w-72 bg-white border-r border-gray-200 p-4 md:block shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800 text-lg">Filtres</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un QCM..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année d&apos;étude
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-800 p-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                >
                  <option value="all">Toutes les années</option>
                  <option value="1">1ère année</option>
                  <option value="2">2ème année</option>
                  <option value="3">3ème année</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulté
                </label>
                <div className="flex flex-col space-y-2">
                  {(["all", "Facile", "Moyen", "Difficile"] as const).map(
                    (difficulty) => (
                      <label
                        key={difficulty}
                        className="flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-2"
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                          checked={selectedDifficulty === difficulty}
                          onChange={() => setSelectedDifficulty(difficulty)}
                        />
                        <span
                          className={`text-sm ${
                            selectedDifficulty === difficulty
                              ? "text-teal-600 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {difficulty === "all"
                            ? "Toutes les difficultés"
                            : difficulty}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 px-3 py-2 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                  onClick={resetFilters}
                >
                  <X size={16} />
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Préparation aux QCMs
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredModules.flatMap((m) => m.qcms).length} QCMs
                  disponibles
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un QCM..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter size={18} className="text-gray-600" />
                  <span className="hidden md:inline text-sm font-medium">
                    Filtres
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-medium text-gray-700">Complétion</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {overallStats.overallCompletion}%
                  </span>
                  <span className="text-sm text-gray-500 mb-1">
                    {overallStats.completedQcms}/{overallStats.totalQcms} QCMs
                  </span>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${overallStats.overallCompletion}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Star className="w-5 h-5 text-blue-600" fill="#3b82f6" />
                  </div>
                  <h3 className="font-medium text-gray-700">Score moyen</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {overallStats.avgScore}%
                  </span>
                  <span className="text-sm text-gray-500 mb-1">
                    sur {overallStats.completedQcms} QCMs
                  </span>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${overallStats.avgScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-700">Temps moyen</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {averageTime}min
                  </span>
                  <span className="text-sm text-gray-500 mb-1">par QCM</span>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Estimation basée sur vos derniers essais
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Progression par matière
              </h2>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        color: "black",
                        borderRadius: "0.5rem",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        fontSize: "14px",
                      }}
                      formatter={(value) => [
                        `${value}%`,
                        value === "completion" ? "Complétion" : "Score moyen",
                      ]}
                    />
                    <Bar
                      dataKey="completion"
                      name="Complétion (%)"
                      radius={[4, 4, 0, 0]}
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#0d9488" />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="score"
                      name="Score moyen (%)"
                      radius={[4, 4, 0, 0]}
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-teal-500 transition-colors overflow-hidden"
                  >
                    <button
                      className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpandedModule(
                          expandedModule === module.id ? null : module.id
                        )
                      }
                      aria-expanded={expandedModule === module.id}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            module.completion >= 75
                              ? "bg-teal-100 text-teal-600"
                              : module.completion >= 50
                              ? "bg-blue-100 text-blue-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          <Book className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800">
                            {module.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {module.qcms.length} QCM
                              {module.qcms.length > 1 ? "s" : ""}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="font-medium">Complétion:</span>
                              <span>{module.completion}%</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="font-medium">Score moyen:</span>
                              <span>{module.avgScore}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const qcmIds = module.qcms.map(q => q.id).join(',');
                            router.push(`/dashboard/qcm/session?ids=${qcmIds}`);
                          }}
                          className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                        >
                          <BarChart2 className="w-4 h-4" />
                          Tout commencer
                        </button>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedModule === module.id ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {expandedModule === module.id && (
                      <div className="border-t border-gray-200 divide-y divide-gray-200">
                        {module.qcms.map((qcm) => (
                          <div
                            key={qcm.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3"
                          >
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                {qcm.completed ? (
                                  <div className="mt-1 p-1 bg-green-100 rounded-full">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </div>
                                ) : (
                                  <div className="mt-1 p-1 bg-gray-200 rounded-full">
                                    <Book className="w-4 h-4 text-gray-600" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-medium text-gray-800">
                                    {qcm.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {qcm.duration}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                      {qcm.totalQuestions} questions
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        difficultyColors[qcm.difficulty as Difficulty]
                                      }`}
                                    >
                                      {qcm.difficulty}
                                    </span>
                                    {qcm.year && (
                                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        Année {qcm.year}
                                      </span>
                                    )}
                                    {qcm.completed && qcm.lastAttempt && (
                                      <span className="text-xs text-gray-500">
                                        Dernier essai:{" "}
                                        {new Date(qcm.lastAttempt).toLocaleDateString(
                                          "fr-FR"
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              {qcm.completed ? (
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                      <Star
                                        className="w-4 h-4 text-yellow-500"
                                        fill="#eab308"
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        {qcm.score}%
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Score
                                    </div>
                                  </div>
                                  <button className="text-sm px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    onClick={async () => {
                                      try {
                                        await fetch(`/api/qcms/${qcm.id}/retry`, { method: "POST" });
                                        router.push(`/dashboard/qcm/${qcm.id}`);
                                      } catch (err) {
                                        console.error("Erreur lors de la réinitialisation du QCM:", err);
                                      }
                                    }}>
                                    <BarChart2 className="w-4 h-4" />
                                    Réessayer
                                  </button>
                                </div>
                              ) : (
                                <button className="text-sm px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                                  onClick={() => router.push(`/dashboard/qcm/${qcm.id}`)}>
                                  <BarChart2 className="w-4 h-4" />
                                  Commencer
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    Aucun QCM trouvé
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <button
                    className="mt-4 text-sm px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
