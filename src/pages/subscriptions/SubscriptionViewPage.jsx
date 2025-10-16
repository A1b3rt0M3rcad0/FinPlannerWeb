import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Wallet,
  Calendar,
  DollarSign,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Mail,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";
import subscriptionsAPI from "../../services/api/subscriptions";
import usersAPI from "../../services/api/users";
import Swal from "sweetalert2";

export default function SubscriptionViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, [id]);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionsAPI.getById(id);
      const subData = response.data;
      setSubscription(subData);

      // Carregar dados do usuário
      if (subData.user_id) {
        try {
          const userResponse = await usersAPI.getById(subData.user_id);
          setUser(userResponse.data);
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar assinatura:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao carregar assinatura",
      });
      navigate(ROUTES.SUBSCRIPTIONS.LIST);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: {
        label: "Ativa",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
      },
      canceled: {
        label: "Cancelada",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
      },
      cancelled: {
        label: "Cancelada",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
      },
      paused: {
        label: "Pausada",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
      },
      expired: {
        label: "Expirada",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: XCircle,
      },
      pending: {
        label: "Pendente",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: AlertCircle,
      },
    };

    const statusInfo = statusMap[status] || statusMap.active;
    const StatusIcon = statusInfo.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}
      >
        <StatusIcon size={16} />
        {statusInfo.label}
      </span>
    );
  };

  const isActive = () => {
    if (!subscription) return false;
    if (subscription.status !== "active") return false;
    if (!subscription.expires_at) return true;
    return new Date(subscription.expires_at) > new Date();
  };

  if (loading) {
    return <LoadingSpinner message="Carregando assinatura..." />;
  }

  if (!subscription) {
    return (
      <PageContent>
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Assinatura não encontrada
          </h3>
          <button
            onClick={() => navigate(ROUTES.SUBSCRIPTIONS.LIST)}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Voltar para lista
          </button>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.SUBSCRIPTIONS.LIST)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="flex items-center gap-2">
            {isActive() && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <Star size={14} />
                Assinatura Ativa
              </span>
            )}
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header do Card */}
          <div
            className={`p-6 ${
              isActive()
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-gradient-to-r from-gray-500 to-gray-600"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  Assinatura #{subscription.id}
                </h1>
                <p className="text-white/90">
                  {subscription.plan?.name || "Plano não especificado"}
                </p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações do Usuário */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Informações do Usuário
                </h3>

                {user ? (
                  <>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Nome</p>
                        <p className="text-gray-800 font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800 font-medium">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          ROUTES.USERS.VIEW.replace(":id", subscription.user_id)
                        )
                      }
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center gap-1"
                    >
                      Ver perfil do usuário →
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Informações do usuário não disponíveis
                  </p>
                )}
              </div>

              {/* Informações do Plano */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary-600" />
                  Informações do Plano
                </h3>

                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Plano</p>
                    <p className="text-gray-800 font-medium">
                      {subscription.plan?.name || "-"}
                    </p>
                    {subscription.plan?.base_plan_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Base: {subscription.plan.base_plan_name}
                      </p>
                    )}
                  </div>
                </div>

                {subscription.plan?.description && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Descrição</p>
                      <p className="text-gray-800">
                        {subscription.plan.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Valor Pago</p>
                    <p className="text-gray-800 font-medium text-lg">
                      R$ {subscription.price_paid || subscription.plan?.price || "0.00"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Ciclo de Cobrança</p>
                    <p className="text-gray-800 font-medium">
                      {subscription.billing_cycle_days || subscription.plan?.billing_cycle_days || 0} dias
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Período da Assinatura
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-600">
                      Início
                    </p>
                  </div>
                  <p className="text-gray-800 font-semibold">
                    {formatDateShort(subscription.started_at || subscription.created_at)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-600">
                      Expiração
                    </p>
                  </div>
                  <p className="text-gray-800 font-semibold">
                    {formatDateShort(subscription.expires_at)}
                  </p>
                </div>

                {subscription.cancelled_at && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm font-medium text-red-600">
                        Cancelamento
                      </p>
                    </div>
                    <p className="text-red-800 font-semibold">
                      {formatDateShort(subscription.cancelled_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                Informações Adicionais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Método de Pagamento
                  </span>
                  <span className="text-sm text-gray-600 font-mono">
                    {subscription.payment_method || "Não especificado"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Renovação Automática
                  </span>
                  {subscription.auto_renew ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {subscription.external_subscription_id && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      ID Externo
                    </span>
                    <span className="text-sm text-gray-600 font-mono">
                      {subscription.external_subscription_id}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Criada em
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDateShort(subscription.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
}

