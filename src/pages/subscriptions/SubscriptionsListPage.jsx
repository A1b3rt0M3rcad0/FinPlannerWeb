import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
  Ban,
  RefreshCw,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";
import subscriptionsAPI from "../../services/api/subscriptions";
import Swal from "sweetalert2";

export default function SubscriptionsListPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [searchTerm, statusFilter, subscriptions]);

  const loadSubscriptions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getAll(
        page,
        pagination.page_size
      );
      setSubscriptions(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error("Erro ao carregar assinaturas:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao carregar assinaturas",
      });
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    // Filtro por busca (usuário, email ou plano)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.user_email?.toLowerCase().includes(term) ||
          sub.user_name?.toLowerCase().includes(term) ||
          sub.plan_name?.toLowerCase().includes(term)
      );
    }

    setFilteredSubscriptions(filtered);
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        label: "Ativa",
        color: "green",
        icon: CheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      },
      pending: {
        label: "Pendente",
        color: "yellow",
        icon: Clock,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
      },
      expired: {
        label: "Expirada",
        color: "red",
        icon: XCircle,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      },
      cancelled: {
        label: "Cancelada",
        color: "gray",
        icon: Ban,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
      },
      suspended: {
        label: "Suspensa",
        color: "orange",
        icon: XCircle,
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
      },
    };
    return configs[status] || configs.pending;
  };

  const handleCancelSubscription = async (id, userName) => {
    const result = await Swal.fire({
      title: "Cancelar Assinatura",
      text: `Deseja realmente cancelar a assinatura de ${userName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Não",
    });

    if (result.isConfirmed) {
      try {
        await subscriptionsAPI.cancel(id);
        Swal.fire("Cancelada!", "Assinatura cancelada com sucesso.", "success");
        loadSubscriptions();
      } catch (error) {
        Swal.fire("Erro!", "Erro ao cancelar assinatura.", "error");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return <LoadingSpinner message="Carregando assinaturas..." />;
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Gerenciar Assinaturas
            </h2>
            <p className="text-gray-600">
              {filteredSubscriptions.length} assinatura(s) encontrada(s)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por usuário, email ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Filtro por Status */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none bg-white"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="pending">Pendentes</option>
                <option value="expired">Expiradas</option>
                <option value="cancelled">Canceladas</option>
                <option value="suspended">Suspensas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Assinaturas */}
        {filteredSubscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {subscriptions.length === 0
                ? "Nenhuma assinatura encontrada"
                : "Nenhuma assinatura corresponde aos filtros"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Início
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expira
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscriptions.map((subscription) => {
                    const statusConfig = getStatusConfig(subscription.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={subscription.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.user_name || "Usuário"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscription.user_email || "email@exemplo.com"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {subscription.plan_name || "Plano"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
                          >
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(subscription.price_paid || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.started_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.expires_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  ROUTES.SUBSCRIPTIONS.VIEW.replace(
                                    ":id",
                                    subscription.id
                                  )
                                )
                              }
                              className="text-primary-600 hover:text-primary-800 transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            {subscription.status === "active" && (
                              <button
                                onClick={() =>
                                  handleCancelSubscription(
                                    subscription.id,
                                    subscription.user_name
                                  )
                                }
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Cancelar"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">
                    {(pagination.current_page - 1) * pagination.page_size + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.current_page * pagination.page_size,
                      pagination.total_items
                    )}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium">{pagination.total_items}</span>{" "}
                  resultados
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      loadSubscriptions(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <span className="text-sm text-gray-700">
                    Página {pagination.current_page} de {pagination.total_pages}
                  </span>

                  <button
                    onClick={() =>
                      loadSubscriptions(pagination.current_page + 1)
                    }
                    disabled={
                      pagination.current_page === pagination.total_pages
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContent>
  );
}
