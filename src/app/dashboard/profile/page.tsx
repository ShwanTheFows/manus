import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Mail, MapPin, Calendar, BookOpen, Award, Clock, Edit2, Camera, Zap, TrendingUp } from "lucide-react";
import DashboardLayout from "@/src/app/components/layouts/DashboardLayout";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  const userId = parseInt(session.user?.id, 10);

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Fetch user statistics
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

  const bestScore = allQcmAttempts.length > 0
    ? Math.max(...allQcmAttempts.map((q) => q.score || 0))
    : 0;

  const accountCreatedDate = user?.id
    ? new Date(user.id * 1000).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-teal-500 to-blue-500"></div>

          <div className="px-6 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 relative z-10">
              {/* Profile Avatar and Info */}
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {user?.firstname?.charAt(0)?.toUpperCase() || "U"}
                    {user?.lastname?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {user?.firstname} {user?.lastname}
                  </h1>
                  <p className="text-teal-600 font-medium text-lg">
                    {user?.academicyear || "Année Avancée"}
                  </p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-all shadow-sm border border-teal-100">
                <Edit2 className="w-5 h-5" />
                Modifier le profil
              </button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-500">Localisation</p>
                  <p className="font-medium text-sm">{user?.city || "Non spécifiée"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-500">Membre depuis</p>
                  <p className="font-medium text-sm">{accountCreatedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total QCMs Completed */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                +3 cette semaine
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalQcmsCompleted}</p>
            <p className="text-sm text-gray-500 mt-1">QCM complétés</p>
          </div>

          {/* Average Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                +2% vs mois dernier
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{avgScore}%</p>
            <p className="text-sm text-gray-500 mt-1">Taux de réussite moyen</p>
          </div>

          {/* Best Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Meilleur score
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{bestScore}%</p>
            <p className="text-sm text-gray-500 mt-1">Meilleure performance</p>
          </div>

          {/* Total Time Spent */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalTimeSpent}h</p>
            <p className="text-sm text-gray-500 mt-1">Temps d'étude total</p>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-600" />
              Informations personnelles
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-medium">Prénom</label>
                <p className="text-gray-800 font-medium mt-1">{user?.firstname || "Non spécifié"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Nom</label>
                <p className="text-gray-800 font-medium mt-1">{user?.lastname || "Non spécifié"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Email</label>
                <p className="text-gray-800 font-medium mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Année académique</label>
                <p className="text-gray-800 font-medium mt-1">{user?.academicyear || "Non spécifiée"}</p>
              </div>
              <button className="w-full mt-6 px-4 py-3 bg-teal-50 text-teal-600 rounded-lg font-semibold hover:bg-teal-100 transition-all border border-teal-200">
                Modifier les informations
              </button>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Sécurité & Confidentialité
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Mot de passe</p>
                  <p className="text-sm text-gray-500">Dernière modification il y a 3 mois</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  Changer
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Authentification à deux facteurs</p>
                  <p className="text-sm text-gray-500">Non activée</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  Activer
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Sessions actives</p>
                  <p className="text-sm text-gray-500">1 appareil connecté</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  Gérer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Préférences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 font-medium">Langue</label>
              <select className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-teal-500">
                <option>Français</option>
                <option>English</option>
                <option>العربية</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">Thème</label>
              <select className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-teal-500">
                <option>Clair</option>
                <option>Sombre</option>
                <option>Automatique</option>
              </select>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded" />
              <span className="text-gray-700">Recevoir les notifications par email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded" />
              <span className="text-gray-700">Recevoir les rappels de QCM</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" />
              <span className="text-gray-700">Partager mes statistiques avec les autres</span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Zone de danger</h2>
          <p className="text-red-700 text-sm mb-4">
            Ces actions sont irréversibles. Veuillez être prudent.
          </p>
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
