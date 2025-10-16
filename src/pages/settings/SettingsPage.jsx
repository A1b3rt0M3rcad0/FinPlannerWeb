import { useState, useEffect, useCallback } from "react";
import {
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  Save,
  Camera,
  Mail,
  Calendar,
  CreditCard,
  TrendingUp,
  Target,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ChangePasswordModal from "../../components/ui/ChangePasswordModal";
import { useAuth } from "../../hooks/useAuth";
import userSettingsAPI from "../../services/api/userSettings";
import authAPI from "../../services/api/auth";
import Swal from "sweetalert2";

export default function SettingsPage() {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [metricsData, setMetricsData] = useState({
    monthly_income_goal: "",
    monthly_expense_limit: "",
    savings_goal: "",
    emergency_fund_goal: "",
  });

  const [preferencesData, setPreferencesData] = useState({
    language: "pt-BR",
    currency: "BRL",
    date_format: "DD/MM/YYYY",
    theme: "light",
  });

  const loadSettings = useCallback(async () => {
    try {
      const response = await userSettingsAPI.getMySettings();
      const settings = response.data;

      if (settings) {
        setMetricsData({
          monthly_income_goal: settings.monthly_income_goal || "",
          monthly_expense_limit: settings.monthly_expense_limit || "",
          savings_goal: settings.savings_goal || "",
          emergency_fund_goal: settings.emergency_fund_goal || "",
        });

        setPreferencesData({
          language: settings.language || "pt-BR",
          currency: settings.currency || "BRL",
          date_format: settings.date_format || "DD/MM/YYYY",
          theme: settings.theme || "light",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
      loadSettings();
    }
  }, [user, loadSettings]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMetricsChange = (e) => {
    const { name, value } = e.target;
    setMetricsData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(profileData);

      // Se recebeu novos tokens, atualiza no localStorage e contexto
      if (response.access_token) {
        localStorage.setItem("finplanner_access_token", response.access_token);
        localStorage.setItem("finplanner_refresh_token", response.refresh_token);
        
        // Atualiza informações do usuário usando o contexto
        const updatedUserInfo = {
          ...user,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
        };
        updateUserInfo(updatedUserInfo);
        
        // Atualiza também o estado local
        setProfileData((prev) => ({
          ...prev,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
        }));
      }

      Swal.fire({
        icon: "success",
        title: "Perfil atualizado!",
        text: "Suas informações foram atualizadas com sucesso. Seu token foi renovado.",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao atualizar perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMetrics = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userSettingsAPI.updateFinancialGoals(metricsData);

      Swal.fire({
        icon: "success",
        title: "Metas salvas!",
        text: "Suas metas financeiras foram salvas com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      loadSettings();
    } catch (error) {
      console.error("Erro ao salvar metas:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao salvar metas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPreferencesData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userSettingsAPI.updatePreferences(preferencesData);

      Swal.fire({
        icon: "success",
        title: "Preferências salvas!",
        text: "Suas preferências foram atualizadas com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      loadSettings();
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao salvar preferências",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );

      Swal.fire({
        icon: "success",
        title: "Senha alterada!",
        text: "Sua senha foi alterada com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowPasswordModal(false);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text:
          error.response?.data?.error ||
          "Erro ao alterar senha. Verifique sua senha atual.",
      });
      throw error;
    }
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "metrics", label: "Metas Financeiras", icon: Target },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "preferences", label: "Preferências", icon: Palette },
  ];

  if (!user) {
    return <LoadingSpinner message="Carregando configurações..." />;
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
          <p className="text-gray-600">
            Gerencie seu perfil e preferências do sistema
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-secondary-900">
                        {profileData.first_name?.[0] || "U"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-primary-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Camera size={14} className="text-primary-600" />
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primeiro Nome *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sobrenome *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      title="O email não pode ser alterado"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg disabled:opacity-50"
                    >
                      <Save size={20} />
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Metrics Tab */}
          {activeTab === "metrics" && (
            <form onSubmit={handleSaveMetrics} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  Defina suas Metas Financeiras
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure suas metas mensais para melhor controle financeiro
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta de Receita Mensal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <TrendingUp size={16} className="text-green-600" />
                      Meta de Receita Mensal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <input
                        type="number"
                        name="monthly_income_goal"
                        value={metricsData.monthly_income_goal}
                        onChange={handleMetricsChange}
                        step="0.01"
                        min="0"
                        placeholder="5000.00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Quanto você planeja receber por mês
                    </p>
                  </div>

                  {/* Limite de Despesas Mensais */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CreditCard size={16} className="text-red-600" />
                      Limite de Despesas Mensais
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <input
                        type="number"
                        name="monthly_expense_limit"
                        value={metricsData.monthly_expense_limit}
                        onChange={handleMetricsChange}
                        step="0.01"
                        min="0"
                        placeholder="4000.00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo que você planeja gastar por mês
                    </p>
                  </div>

                  {/* Meta de Economia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Target size={16} className="text-blue-600" />
                      Meta de Economia Mensal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <input
                        type="number"
                        name="savings_goal"
                        value={metricsData.savings_goal}
                        onChange={handleMetricsChange}
                        step="0.01"
                        min="0"
                        placeholder="1000.00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Quanto você deseja economizar por mês
                    </p>
                  </div>

                  {/* Fundo de Emergência */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Shield size={16} className="text-purple-600" />
                      Meta de Fundo de Emergência
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <input
                        type="number"
                        name="emergency_fund_goal"
                        value={metricsData.emergency_fund_goal}
                        onChange={handleMetricsChange}
                        step="0.01"
                        min="0"
                        placeholder="10000.00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Valor total do fundo de emergência desejado
                    </p>
                  </div>
                </div>

                {/* Info sobre metas */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Suas metas serão usadas nos
                    gráficos e relatórios para mostrar seu progresso ao longo do
                    tempo.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? "Salvando..." : "Salvar Metas"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-600" />
                  Segurança da Conta
                </h3>
              </div>

              {/* Alterar Senha */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Alterar Senha
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Atualize sua senha regularmente para manter sua conta segura
                </p>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Alterar Senha
                </button>
              </div>

              {/* Autenticação de Dois Fatores */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Autenticação de Dois Fatores
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione uma camada extra de segurança à sua conta
                </p>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled
                >
                  Em breve
                </button>
              </div>

              {/* Sessões Ativas */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Sessões Ativas
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Gerencie os dispositivos onde você está logado
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Sessão Atual
                      </p>
                      <p className="text-xs text-gray-500">
                        Último acesso: Agora
                      </p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-600" />
                  Notificações
                </h3>
              </div>

              {/* Em breve */}
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Em Breve
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  O sistema de notificações personalizadas estará disponível em
                  breve. Você poderá configurar alertas de orçamento,
                  vencimentos e muito mais.
                </p>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary-600" />
                  Preferências do Sistema
                </h3>
              </div>

              <div className="space-y-4">
                {/* Idioma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe size={16} />
                    Idioma
                  </label>
                  <select
                    name="language"
                    value={preferencesData.language}
                    onChange={handlePreferencesChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                {/* Moeda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda Padrão
                  </label>
                  <select
                    name="currency"
                    value={preferencesData.currency}
                    onChange={handlePreferencesChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                {/* Tema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <select
                    name="theme"
                    value={preferencesData.theme}
                    onChange={handlePreferencesChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                {/* Formato de Data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Formato de Data
                  </label>
                  <select
                    name="date_format"
                    value={preferencesData.date_format}
                    onChange={handlePreferencesChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg disabled:opacity-50"
                >
                  <Save size={20} />
                  {loading ? "Salvando..." : "Salvar Preferências"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal de Alteração de Senha */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
      />
    </PageContent>
  );
}
