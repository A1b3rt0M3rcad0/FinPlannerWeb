import { useState, useEffect } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  User,
  Mail,
  Lock,
  Save,
  DollarSign,
  Target,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import authAPI from "../../services/api/auth";
import Swal from "sweetalert2";

export default function UserSettingsPage() {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [financialGoals, setFinancialGoals] = useState({
    monthly_income_goal: "",
    monthly_expense_limit: "",
    savings_goal: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      });

      if (response.data?.access_token) {
        updateUserInfo(
          response.data.access_token,
          response.data.refresh_token,
          response.data.user
        );

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Perfil atualizado com sucesso",
          timer: 2000,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao atualizar perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "As senhas não coincidem",
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "A senha deve ter no mínimo 6 caracteres",
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Senha alterada com sucesso",
        timer: 2000,
      });

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao alterar senha",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialGoalsSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Integrar com API de user settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Metas financeiras salvas",
        timer: 2000,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao salvar metas financeiras",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "financial", label: "Metas Financeiras", icon: Target },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Configurações
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas preferências e informações pessoais
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Tab: Perfil */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.first_name?.[0]}
                    {profileData.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {profileData.first_name} {profileData.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{profileData.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    O email não pode ser alterado
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Segurança */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <Lock size={16} className="inline mr-2" />
                    Escolha uma senha forte com letras, números e símbolos
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        current_password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirm_password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Lock size={20} />
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Metas Financeiras */}
            {activeTab === "financial" && (
              <form onSubmit={handleFinancialGoalsSave} className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <Target size={16} className="inline mr-2" />
                    Defina suas metas para acompanhar melhor seu progresso
                    financeiro
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta de Renda Mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={financialGoals.monthly_income_goal}
                    onChange={(e) =>
                      setFinancialGoals((prev) => ({
                        ...prev,
                        monthly_income_goal: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="5000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de Despesas Mensais (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={financialGoals.monthly_expense_limit}
                    onChange={(e) =>
                      setFinancialGoals((prev) => ({
                        ...prev,
                        monthly_expense_limit: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="3000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta de Economia (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={financialGoals.savings_goal}
                    onChange={(e) =>
                      setFinancialGoals((prev) => ({
                        ...prev,
                        savings_goal: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="10000.00"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? "Salvando..." : "Salvar Metas"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
