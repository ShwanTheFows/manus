import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookOpen, FileText, Users, BarChart2, Award, Clock, TrendingUp, Star, TrendingDown } from "lucide-react";
import DashboardLayout from "@/src/app/components/layouts/DashboardLayout";
import VoirToutButton from "@/src/app/components/VoirToutButton";
import StartQcmButton from "@/src/app/components/StartQcmButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  console.log(session.user)

  const userId = parseInt(session.user?.id, 10);

  // Fetch all QCM attempts for this user
  const allQcmAttempts = await prisma.qcmHistory.findMany({
    where: { userId },
    orderBy: { attemptedAt: "desc" },
    include: { qcm: true },
  });

  const totalQcmsCompleted = allQcmAttempts.filter((q) => q.completed).length;
  const avgScore = totalQcmsCompleted
    ? Math.round(
        allQcmAttempts
          .filter((q) => q.completed)
          .reduce((sum, q) => sum + (q.score || 0), 0) / totalQcmsCompleted
      )
    : 0;

  const totalTimeSpent = allQcmAttempts
    .filter((q) => q.completed)
    .reduce((sum, q) => sum + (q.timeSpentMin || 0), 0);

  const recentQcms = allQcmAttempts.slice(0, 3).map((q) => ({
    title: q.qcm?.title || "QCM",
    score: q.score || 0,
    date: q.attemptedAt.toLocaleDateString("fr-FR"),
    subject: q.qcm?.subject || "Général",
    difficulty: q.qcm?.difficulty || "Facile",
  }));

  const stats = [
    {
      value: totalQcmsCompleted,
      label: "QCM complétés",
      icon: <FileText className="text-teal-600 w-6 h-6" />,
      trend: "+3 cette semaine",
    },
    {
      value: `${avgScore}%`,
      label: "Taux de réussite",
      icon: <Award className="text-blue-600 w-6 h-6" />,
      trend: "+2% vs dernier mois",
    },
    {
      value: `${totalTimeSpent} min`,
      label: "Temps passé",
      icon: <Clock className="text-purple-600 w-6 h-6" />,
      trend: "1.5h aujourd'hui",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-teal-600">
              Tableau de Bord
            </h1>
            <p className="text-gray-500 mt-1">
              Suivez votre progression et améliorez vos performances
            </p>
          </div>
          <div className="flex items-center gap-4 bg-teal-50 p-3 rounded-xl w-full md:w-auto">
            <div className="w-12 h-12 rounded-full border-2 border-teal-200 bg-teal-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <span className="font-medium text-gray-800">
                Bonjour, {session.user?.name || "Étudiant"}!
              </span>
              <p className="text-sm text-teal-600">
                {session.user?.academicyear || "Niveau Avancé"} •{" "}
                {session.user?.city || "Ville"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> {stat.trend}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Reinserted Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <QuickActionCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Continuer mon apprentissage"
            description="Reprendre là où vous vous êtes arrêté"
            actionText="Continuer →"
            color="teal"
            badge="Recommandé"
          />
          <QuickActionCard
            icon={<FileText className="w-6 h-6" />}
            title="Nouveau QCM"
            description="Commencer un nouveau questionnaire"
            actionText="Commencer →"
            color="blue"
            badge="Populaire"
          />
          <QuickActionCard
            icon={<BarChart2 className="w-6 h-6" />}
            title="Voir ma progression"
            description="Analyser vos performances"
            actionText="Voir →"
            color="purple"
            badge="Nouveau"
          />
        </div>

        {/* Recent QCMs */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Vos derniers QCMs
              </h2>
              <p className="text-sm text-gray-500">
                Historique de vos 3 dernières sessions
              </p>
            </div>
            <VoirToutButton />
          </div>

          {recentQcms.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aucun QCM enregistré
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Vous n’avez encore participé à aucun QCM. Commencez dès maintenant pour
                évaluer vos connaissances et suivre votre progression !
              </p>
              <StartQcmButton />
            </div>
          ) : (
            <div className="space-y-4">
              {recentQcms.map((qcm, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200 border border-gray-100 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        qcm.subject === "Anatomie"
                          ? "bg-red-50"
                          : qcm.subject === "Physiologie"
                          ? "bg-blue-50"
                          : "bg-green-50"
                      }`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          qcm.subject === "Anatomie"
                            ? "text-red-600"
                            : qcm.subject === "Physiologie"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{qcm.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          Terminé le {qcm.date}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {qcm.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      qcm.score > 80
                        ? "bg-green-100 text-green-800"
                        : qcm.score > 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {qcm.score}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ✅ QuickActionCard Component */
function QuickActionCard({ icon, title, description, actionText, color, badge }) {
  const getColorClasses = (color) => {
    const classes = {
      teal: {
        icon: "bg-teal-50 text-teal-600",
        badge: "bg-teal-100 text-teal-600",
        button: "bg-teal-600 hover:bg-teal-700 text-white",
      },
      blue: {
        icon: "bg-blue-50 text-blue-600",
        badge: "bg-blue-100 text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700 text-white",
      },
      purple: {
        icon: "bg-purple-50 text-purple-600",
        badge: "bg-purple-100 text-purple-600",
        button: "bg-purple-600 hover:bg-purple-700 text-white",
      },
    };
    return classes[color];
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses.icon}`}
          >
            {icon}
          </div>
          {badge && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${colorClasses.badge}`}
            >
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6">{description}</p>
        <button
          className={`mt-auto px-6 py-3 rounded-xl transition-all duration-300 text-sm font-medium w-full flex items-center justify-center gap-2 ${colorClasses.button}`}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}
