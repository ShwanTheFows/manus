"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, Calendar, BookOpen, Award, Clock, Edit2, Camera, Zap, TrendingUp, Upload } from "lucide-react";
import DashboardLayout from "@/src/app/components/layouts/DashboardLayout";
import { ProfileEditModal } from "@/src/app/components/ProfileEditModal";
import { PasswordChangeModal } from "@/src/app/components/PasswordChangeModal";
import { DeleteAccountModal } from "@/src/app/components/DeleteAccountModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/src/app/components/ThemeProvider";

interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  city: string;
  academicyear: string;
  profilePicture?: string;
  bannerImage?: string;
}

interface UserStats {
  totalQcmsCompleted: number;
  avgScore: number;
  bestScore: number;
  totalTimeSpent: number;
  thisWeekAttempts: number;
  scoreImprovement: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark } = useTheme();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [preferences, setPreferences] = useState({
    language: "fr",
    theme: "light",
    emailNotifications: true,
    qcmReminders: true,
    shareStatistics: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
      fetchUserStats();
      loadPreferences();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const stats = await response.json();
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = () => {
    const saved = localStorage.getItem("userPreferences");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const result = await response.json();
      setUserData(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handlePasswordChange = async (data: any) => {
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleImageUpload = async (file: File, type: "profile" | "banner") => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/user/upload", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const result = await response.json();
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              [type === "profile" ? "profilePicture" : "bannerImage"]:
                result.imageUrl,
            }
          : null
      );
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePreferencesChange = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem("userPreferences", JSON.stringify(updated));
  };

  if (loading || !userData || !userStats) {
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
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-sm border border-teal-100 dark:border-gray-700 overflow-hidden">
          {/* Banner Image */}
          <div className="relative h-32 bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-600 dark:to-blue-600 group">
            {userData.bannerImage && (
              <img
                src={userData.bannerImage}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "banner");
                }}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2 text-white">
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Changer la bannière</span>
              </div>
            </label>
          </div>

          <div className="px-6 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 relative z-10">
              {/* Profile Avatar and Info */}
              <div className="flex items-end gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center overflow-hidden">
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-white">
                        {userData.firstname?.charAt(0)?.toUpperCase() || "U"}
                        {userData.lastname?.charAt(0)?.toUpperCase() || "S"}
                      </span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "profile");
                      }}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Camera className="w-6 h-6" />
                      <span className="text-xs font-medium">Changer</span>
                    </div>
                  </label>
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {userData.firstname} {userData.lastname}
                  </h1>
                  <p className="text-teal-600 dark:text-teal-400 font-medium text-lg">
                    {userData.academicyear || "Année Avancée"}
                  </p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-gray-700 transition-all shadow-sm border border-teal-100 dark:border-gray-700"
              >
                <Edit2 className="w-5 h-5" />
                Modifier le profil
              </button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Localisation</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{userData.city || "Non spécifiée"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Membre depuis</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">Décembre 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total QCMs Completed */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full">
                +{userStats.thisWeekAttempts} cette semaine
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{userStats.totalQcmsCompleted}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">QCM complétés</p>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                userStats.scoreImprovement >= 0
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
              }`}>
                {userStats.scoreImprovement >= 0 ? "+" : ""}{userStats.scoreImprovement}% vs semaine dernière
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{userStats.avgScore}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Taux de réussite moyen</p>
          </div>

          {/* Best Score */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                Meilleur score
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{userStats.bestScore}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Meilleure performance</p>
          </div>

          {/* Total Time Spent */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{userStats.totalTimeSpent}h</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Temps d'étude total</p>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Informations personnelles
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">Prénom</label>
                <p className="text-gray-800 dark:text-white font-medium mt-1">{userData.firstname || "Non spécifié"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">Nom</label>
                <p className="text-gray-800 dark:text-white font-medium mt-1">{userData.lastname || "Non spécifié"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email</label>
                <p className="text-gray-800 dark:text-white font-medium mt-1">{userData.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">Année académique</label>
                <p className="text-gray-800 dark:text-white font-medium mt-1">{userData.academicyear || "Non spécifiée"}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full mt-6 px-4 py-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all border border-teal-200 dark:border-teal-700"
              >
                Modifier les informations
              </button>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Sécurité & Confidentialité
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Mot de passe</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dernière modification il y a 3 mois</p>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                >
                  Changer
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Authentification à deux facteurs</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Non activée</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all cursor-not-allowed opacity-50">
                  Activer
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Sessions actives</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">1 appareil connecté</p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all cursor-not-allowed opacity-50">
                  Gérer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Préférences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Langue</label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferencesChange("language", e.target.value)}
                className="w-full mt-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:border-teal-500 dark:focus:border-teal-400"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Thème</label>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferencesChange("theme", e.target.value)}
                className="w-full mt-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:border-teal-500 dark:focus:border-teal-400"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferencesChange("emailNotifications", e.target.checked)}
                className="w-5 h-5 text-teal-600 dark:text-teal-400 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Recevoir les notifications par email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.qcmReminders}
                onChange={(e) => handlePreferencesChange("qcmReminders", e.target.checked)}
                className="w-5 h-5 text-teal-600 dark:text-teal-400 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Recevoir les rappels de QCM</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.shareStatistics}
                onChange={(e) => handlePreferencesChange("shareStatistics", e.target.checked)}
                className="w-5 h-5 text-teal-600 dark:text-teal-400 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Partager mes statistiques avec les autres</span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">Zone de danger</h2>
          <p className="text-red-700 dark:text-red-300 text-sm mb-4">
            Ces actions sont irréversibles. Veuillez être prudent.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-all"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modals */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        onSave={handleProfileUpdate}
      />

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handlePasswordChange}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </DashboardLayout>
  );
}
