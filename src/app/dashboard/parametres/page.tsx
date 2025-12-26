"use client";

import { useEffect, useState } from "react";
import { Settings, Lock, Bell, Eye, EyeOff, Save, AlertCircle, CheckCircle, Globe, Shield, Trash2 } from "lucide-react";
import DashboardLayout from "@/src/app/components/layouts/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserSettings {
  email: string;
  firstname: string;
  lastname: string;
  city: string;
  academicyear: string;
  emailNotifications: boolean;
  qcmReminders: boolean;
  shareStatistics: boolean;
}

export default function ParametresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [profileRes, prefsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/preferences"),
      ]);

      if (!profileRes.ok || !prefsRes.ok) throw new Error("Failed to fetch settings");

      const profile = await profileRes.json();
      const prefs = await prefsRes.json();

      setSettings({
        ...profile,
        ...prefs,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement des paramètres" });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setMessage(null);

      // Update profile
      const profileRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: settings.firstname,
          lastname: settings.lastname,
          city: settings.city,
          academicyear: settings.academicyear,
        }),
      });

      // Update preferences
      const prefsRes = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          qcmReminders: settings.qcmReminders,
          shareStatistics: settings.shareStatistics,
        }),
      });

      if (!profileRes.ok || !prefsRes.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage({ type: "success", text: "Paramètres mis à jour avec succès" });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde des paramètres" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères" });
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordMessage(null);

      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      setPasswordMessage({ type: "success", text: "Mot de passe modifié avec succès" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showCurrent: false,
        showNew: false,
        showConfirm: false,
      });
    } catch (error: any) {
      setPasswordMessage({ type: "error", text: error.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading || !settings) {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Paramètres</h1>
          <p className="text-gray-600 mt-1">Gérez vos préférences et votre sécurité</p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            Informations du compte
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input
                type="text"
                value={settings.firstname}
                onChange={(e) => handleSettingChange("firstname", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={settings.lastname}
                onChange={(e) => handleSettingChange("lastname", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => handleSettingChange("city", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Année académique</label>
              <input
                type="text"
                value={settings.academicyear}
                onChange={(e) => handleSettingChange("academicyear", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>

        {/* Notifications & Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notifications et préférences
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Recevoir les notifications par email</p>
                <p className="text-sm text-gray-600">Soyez informé des mises à jour importantes</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={settings.qcmReminders}
                onChange={(e) => handleSettingChange("qcmReminders", e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Recevoir les rappels de QCM</p>
                <p className="text-sm text-gray-600">Recevez des rappels pour continuer vos études</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={settings.shareStatistics}
                onChange={(e) => handleSettingChange("shareStatistics", e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Partager mes statistiques</p>
                <p className="text-sm text-gray-600">Permettre aux autres utilisateurs de voir vos performances</p>
              </div>
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? "Enregistrement..." : "Enregistrer les préférences"}
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Sécurité
          </h2>

          {passwordMessage && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${
                passwordMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={passwordForm.showCurrent ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({ ...passwordForm, showCurrent: !passwordForm.showCurrent })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {passwordForm.showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={passwordForm.showNew ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({ ...passwordForm, showNew: !passwordForm.showNew })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {passwordForm.showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={passwordForm.showConfirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({ ...passwordForm, showConfirm: !passwordForm.showConfirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {passwordForm.showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              {passwordLoading ? "Modification en cours..." : "Modifier le mot de passe"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Zone de danger
          </h2>
          <p className="text-red-700 text-sm mb-4">
            Ces actions sont irréversibles. Veuillez être prudent.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
            <Trash2 className="w-5 h-5" />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
