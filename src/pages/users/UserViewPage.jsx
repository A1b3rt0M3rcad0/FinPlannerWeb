import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
  Edit,
  CreditCard,
  History,
  Star,
  DollarSign,
  Clock,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";
import { useAuth } from "../../hooks/useAuth";
import usersAPI from "../../services/api/users";
import subscriptionsAPI from "../../services/api/subscriptions";
import Swal from "sweetalert2";

export default function UserViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userResponse = await usersAPI.getById(id);
      const userData = userResponse.data || null;
      setUser(userData);

      // Se não for admin, busca as assinaturas
      if (userData && !userData.is_admin) {
        try {
          const subsResponse = await subscriptionsAPI.getByUserId(id);
          const subs = subsResponse.data || [];
          setSubscriptions(subs);

          // Encontra a assinatura ativa
          const active = subs.find((sub) => {
            if (sub.status !== "active") return false;
            if (!sub.expires_at) return true;
            return new Date(sub.expires_at) > new Date();
          });

          console.log("🔍 DEBUG - Assinatura ativa:", active);
          if (active?.plan) {
            console.log("📋 Plano:", {
              name: active.plan.name,
              base_plan_name: active.plan.base_plan_name,
              role_a_usar: active.plan.base_plan_name || active.plan.name,
            });
          }

          setActiveSubscription(active || null);
        } catch (error) {
          console.error("Erro ao carregar assinaturas:", error);
          // Não bloqueia se falhar ao carregar assinaturas
        }
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao carregar usuário",
      });
      navigate(ROUTES.USERS.LIST);
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

  const getRoleInfo = (user) => {
    if (user.is_super_admin) {
      return {
        label: "Super Admin",
        icon: Crown,
        color: "from-yellow-500 to-amber-500",
        bgColor: "bg-gradient-to-r from-yellow-100 to-amber-100",
        textColor: "text-yellow-800",
      };
    }
    if (user.is_admin) {
      return {
        label: "Administrador",
        icon: Shield,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
      };
    }

    // Se tem assinatura ativa, usa o nome do plano como role
    if (activeSubscription && activeSubscription.plan) {
      const planName =
        activeSubscription.plan.base_plan_name || activeSubscription.plan.name;
      return {
        label: planName,
        icon: Star,
        color: "from-primary-500 to-primary-600",
        bgColor: "bg-gradient-to-r from-primary-100 to-primary-200",
        textColor: "text-primary-800",
      };
    }

    return {
      label: "Usuário",
      icon: User,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: {
        label: "Ativa",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      canceled: {
        label: "Cancelada",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      paused: {
        label: "Pausada",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      expired: {
        label: "Expirada",
        color: "bg-gray-100 text-gray-800",
        icon: XCircle,
      },
    };

    const statusInfo = statusMap[status] || statusMap.active;
    const StatusIcon = statusInfo.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        <StatusIcon size={14} />
        {statusInfo.label}
      </span>
    );
  };

  const isCurrentUser = () => {
    return currentUser && currentUser.user_id === parseInt(id);
  };

  if (loading) {
    return <LoadingSpinner message="Carregando usuário..." />;
  }

  if (!user) {
    return (
      <PageContent>
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Usuário não encontrado
          </h3>
          <button
            onClick={() => navigate(ROUTES.USERS.LIST)}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Voltar para lista
          </button>
        </div>
      </PageContent>
    );
  }

  const roleInfo = getRoleInfo(user);
  const RoleIcon = roleInfo.icon;

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.USERS.LIST)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <button
            onClick={() => navigate(ROUTES.USERS.EDIT.replace(":id", user.id))}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
          >
            <Edit size={20} />
            Editar Usuário
          </button>
        </div>

        {/* Card principal do usuário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header do card */}
          <div className={`bg-gradient-to-r ${roleInfo.color} p-6`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <RoleIcon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white">
                    {user.first_name} {user.last_name}
                  </h1>
                  {isCurrentUser() && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                      <Star size={16} />
                      Você
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-lg">{roleInfo.label}</p>
              </div>
            </div>
          </div>

          {/* Conteúdo do card */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações Básicas
                </h3>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nome Completo</p>
                    <p className="text-gray-800 font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Cadastrado em</p>
                    <p className="text-gray-800 font-medium">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                {user.updated_at && user.updated_at !== user.created_at && (
                  <div className="flex items-start gap-3">
                    <History className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Última atualização
                      </p>
                      <p className="text-gray-800 font-medium">
                        {formatDate(user.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Permissões e status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Permissões e Status
                </h3>

                <div className="space-y-3">
                  {/* Role Badge */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Nível de Acesso
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.textColor} border border-current/20`}
                    >
                      <RoleIcon size={14} />
                      {roleInfo.label}
                    </span>
                  </div>

                  {/* Super Admin */}
                  {user.is_admin && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Super Administrador
                      </span>
                      {user.is_super_admin ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* User ID */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      ID do Usuário
                    </span>
                    <span className="text-sm font-mono text-gray-600">
                      #{user.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de assinatura */}
            {!user.is_admin && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  Assinaturas
                </h3>

                {subscriptions.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">
                      Este usuário não possui assinaturas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((subscription) => {
                      const isActive =
                        subscription.status === "active" &&
                        (!subscription.expires_at ||
                          new Date(subscription.expires_at) > new Date());

                      return (
                        <div
                          key={subscription.id}
                          className={`border rounded-lg p-4 ${
                            isActive
                              ? "border-primary-300 bg-primary-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                {subscription.plan?.name ||
                                  "Plano Desconhecido"}
                                {isActive && (
                                  <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                                    ATIVA
                                  </span>
                                )}
                              </h4>
                              {subscription.plan?.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {subscription.plan.description}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(subscription.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign size={16} className="text-gray-400" />
                              <span className="text-gray-600">
                                R$ {subscription.plan?.price || "0.00"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-gray-400" />
                              <span className="text-gray-600">
                                {subscription.plan?.billing_cycle_days || 0}{" "}
                                dias
                              </span>
                            </div>

                            {subscription.starts_at && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="text-gray-600">
                                  Início:{" "}
                                  {new Date(
                                    subscription.starts_at
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            )}

                            {subscription.expires_at && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="text-gray-600">
                                  Expira:{" "}
                                  {new Date(
                                    subscription.expires_at
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            )}
                          </div>

                          {subscription.payment_method && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Método:{" "}
                                <span className="font-medium">
                                  {subscription.payment_method}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() =>
                  navigate(ROUTES.USERS.EDIT.replace(":id", user.id))
                }
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
              >
                <Edit size={20} />
                Editar Usuário
              </button>

              {!isCurrentUser() && (
                <button
                  onClick={() => {
                    Swal.fire({
                      title: "Funcionalidade em desenvolvimento",
                      text: "A exclusão de usuários será implementada em breve",
                      icon: "info",
                    });
                  }}
                  className="px-6 py-3 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  Excluir Usuário
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
