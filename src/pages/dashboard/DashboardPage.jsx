import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  Receipt,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import StatCard from "../../components/ui/StatCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";
import analyticsAPI from "../../services/api/analytics";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    newSubscriptions: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Buscar estatísticas reais do dashboard
      const response = await analyticsAPI.getDashboardStats();
      const data = response.data || {};

      setStats({
        totalPlans: data.total_plans || 0,
        activeSubscriptions: data.active_subscriptions || 0,
        totalRevenue: data.total_revenue ? data.total_revenue.toFixed(2) : "0.00",
        newSubscriptions: data.new_subscriptions || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      // Define valores padrão em caso de erro
      setStats({
        totalPlans: 0,
        activeSubscriptions: 0,
        totalRevenue: "0.00",
        newSubscriptions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando dashboard..." />;
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header com ações rápidas */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
            <p className="text-gray-600">
              Acompanhe as principais métricas do sistema
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS.CREATE)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30"
          >
            <Plus size={20} />
            Novo Plano
          </button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Wallet}
            title="Planos Ativos"
            value={stats.totalPlans}
            subtitle="planos disponíveis"
            color="gold"
          />
          <StatCard
            icon={Users}
            title="Assinaturas Ativas"
            value={stats.activeSubscriptions}
            subtitle="usuários assinantes"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Receita Mensal"
            value={`R$ ${stats.totalRevenue}`}
            subtitle="receita recorrente"
            color="gold"
          />
          <StatCard
            icon={CreditCard}
            title="Novas Assinaturas"
            value={stats.newSubscriptions}
            subtitle="este mês"
            color="blue"
          />
        </div>

        {/* Ações rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS.CREATE)}
              className="flex items-center gap-3 p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
              <div className="w-12 h-12 bg-primary-100 group-hover:bg-gradient-to-br group-hover:from-primary-500 group-hover:to-primary-600 rounded-lg flex items-center justify-center transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-primary-500/30">
                <Wallet className="w-6 h-6 text-primary-600 group-hover:text-secondary-900 transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Criar Plano</p>
                <p className="text-sm text-gray-600">Com integração MP</p>
              </div>
            </button>

            <button
              onClick={() => navigate(ROUTES.SUBSCRIPTIONS.LIST)}
              className="flex items-center gap-3 p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                <CreditCard className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Ver Assinaturas</p>
                <p className="text-sm text-gray-600">Gerenciar usuários</p>
              </div>
            </button>

            <button
              onClick={() => navigate(ROUTES.PAYMENTS.LIST)}
              className="flex items-center gap-3 p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
              <div className="w-12 h-12 bg-primary-100 group-hover:bg-gradient-to-br group-hover:from-primary-500 group-hover:to-primary-600 rounded-lg flex items-center justify-center transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-primary-500/30">
                <Receipt className="w-6 h-6 text-primary-600 group-hover:text-secondary-900 transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Pagamentos</p>
                <p className="text-sm text-gray-600">Histórico completo</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
