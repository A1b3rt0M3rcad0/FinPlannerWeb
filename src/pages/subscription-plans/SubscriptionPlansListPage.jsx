import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Wallet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES, BILLING_INTERVALS } from "../../config/constants";
import subscriptionPlansAPI from "../../services/api/subscriptionPlans";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import Swal from "sweetalert2";

export default function SubscriptionPlansListPage() {
  const [plans, setPlans] = useState([]);
  const [groupedPlans, setGroupedPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPlans = useCallback(async () => {
    try {
      const response = await subscriptionPlansAPI.getAll();
      const plansList = response.data || [];
      setPlans(plansList);

      // Agrupar planos por base_plan_name
      const grouped = plansList.reduce((acc, plan) => {
        const baseName = plan.base_plan_name || plan.name;
        if (!acc[baseName]) {
          acc[baseName] = [];
        }
        acc[baseName].push(plan);
        return acc;
      }, {});

      setGroupedPlans(grouped);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar planos de assinatura",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook customizado para ações com confirmação
  const { confirmDelete } = useConfirmAction(loadPlans);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const getBillingIntervalLabel = (days) => {
    const interval = BILLING_INTERVALS.find((i) => i.value === days);
    return interval ? interval.label : `${days} dias`;
  };

  const handleDelete = (id, name) => {
    confirmDelete({
      action: () => subscriptionPlansAPI.delete(id),
      itemName: name,
      itemType: "o plano",
      successMessage: "Plano excluído com sucesso",
      errorMessage:
        "Erro ao excluir plano. Pode haver assinaturas ativas vinculadas.",
    });
  };

  if (loading) {
    return <LoadingSpinner message="Carregando planos..." />;
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Gerenciar Planos
            </h2>
            <p className="text-gray-600">
              {plans.length} plano(s) cadastrado(s)
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

        {/* Lista de planos agrupados */}
        {plans.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedPlans).map(
              ([basePlanName, planVariations]) => (
                <div key={basePlanName} className="space-y-4">
                  {/* Título do grupo */}
                  <h3 className="text-xl font-bold text-gray-800 border-b-2 border-primary-500 pb-2">
                    {basePlanName}
                  </h3>

                  {/* Variações do plano */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {planVariations.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
                      >
                        {/* Header do card */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm">
                              <Wallet className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {plan.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {getBillingIntervalLabel(
                                  plan.billing_cycle_days
                                )}
                              </p>
                            </div>
                          </div>
                          {plan.is_active ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Preço */}
                        <div className="mb-4">
                          <p className="text-3xl font-bold text-gray-800">
                            R$ {parseFloat(plan.price).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            /
                            {plan.billing_cycle_days === 30
                              ? "mês"
                              : `${plan.billing_cycle_days} dias`}
                          </p>
                        </div>

                        {/* Descrição */}
                        {plan.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {plan.description}
                          </p>
                        )}

                        {/* Features */}
                        <div className="mb-4 text-sm text-gray-600 space-y-1">
                          {plan.max_users && (
                            <p>• Até {plan.max_users} usuário(s)</p>
                          )}
                          {plan.max_planners && (
                            <p>• {plan.max_planners} planner(s)</p>
                          )}
                          {plan.max_transactions_per_month && (
                            <p>
                              • {plan.max_transactions_per_month} transações/mês
                            </p>
                          )}
                        </div>

                        {/* Integração Mercado Pago */}
                        {plan.mercadopago_plan_id && (
                          <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs text-green-700 font-medium">
                              ✓ Integrado com Mercado Pago
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                ROUTES.SUBSCRIPTION_PLANS.VIEW.replace(
                                  ":id",
                                  plan.id
                                )
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                          >
                            <Eye size={16} />
                            Ver
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                ROUTES.SUBSCRIPTION_PLANS.EDIT.replace(
                                  ":id",
                                  plan.id
                                )
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id, plan.name)}
                            className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Nenhum plano cadastrado</p>
            <button
              onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS.CREATE)}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
            >
              Criar Primeiro Plano
            </button>
          </div>
        )}
      </div>
    </PageContent>
  );
}
