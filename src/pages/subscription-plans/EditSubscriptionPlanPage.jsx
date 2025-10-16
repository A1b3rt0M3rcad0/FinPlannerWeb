import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Wallet, AlertCircle } from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES, BILLING_INTERVALS } from "../../config/constants";
import subscriptionPlansAPI from "../../services/api/subscriptionPlans";
import Swal from "sweetalert2";

export default function EditSubscriptionPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    base_plan_name: "",
    description: "",
    price: "",
    billing_cycle_days: 30,
    max_users: "",
    max_transactions_per_month: "",
    max_bank_accounts: "",
    max_credit_cards: "",
    max_budgets: "",
    max_planners: "",
    is_active: true,
    mercadopago_plan_id: "",
  });

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    try {
      const response = await subscriptionPlansAPI.getById(id);
      const plan = response.data.data;

      setFormData({
        name: plan.name || "",
        base_plan_name: plan.base_plan_name || "",
        description: plan.description || "",
        price: plan.price || "",
        billing_cycle_days: plan.billing_cycle_days || 30,
        max_users: plan.max_users || "",
        max_transactions_per_month: plan.max_transactions_per_month || "",
        max_bank_accounts: plan.max_bank_accounts || "",
        max_credit_cards: plan.max_credit_cards || "",
        max_budgets: plan.max_budgets || "",
        max_planners: plan.max_planners || "",
        is_active: plan.is_active ?? true,
        mercadopago_plan_id: plan.mercadopago_plan_id || "",
      });
    } catch (error) {
      console.error("Erro ao carregar plano:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar dados do plano",
      });
      navigate(ROUTES.SUBSCRIPTION_PLANS.LIST);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await subscriptionPlansAPI.update(id, formData);

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Plano atualizado com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(ROUTES.SUBSCRIPTION_PLANS.LIST);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao atualizar plano",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando plano..." />;
  }

  return (
    <PageContent title={`Editar Plano: ${formData.name}`}>
      <div className="max-w-4xl mx-auto">
        {/* Botão voltar */}
        <button
          onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS.LIST)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar para lista
        </button>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Editar Plano de Assinatura
              </h3>
              <p className="text-sm text-gray-600">
                Atualize as informações do plano
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Plano *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Plano Base (para agrupar variações)
                </label>
                <input
                  type="text"
                  name="base_plan_name"
                  value={formData.base_plan_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ex: Premium (deixe vazio se não houver variações)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use o mesmo nome base para agrupar planos com diferentes
                  ciclos de cobrança
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciclo de Cobrança *
                </label>
                <select
                  name="billing_cycle_days"
                  value={formData.billing_cycle_days}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                >
                  {BILLING_INTERVALS.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Limites */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Limites do Plano
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Usuários
                  </label>
                  <input
                    type="number"
                    name="max_users"
                    value={formData.max_users}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transações/Mês
                  </label>
                  <input
                    type="number"
                    name="max_transactions_per_month"
                    value={formData.max_transactions_per_month}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contas Bancárias
                  </label>
                  <input
                    type="number"
                    name="max_bank_accounts"
                    value={formData.max_bank_accounts}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cartões de Crédito
                  </label>
                  <input
                    type="number"
                    name="max_credit_cards"
                    value={formData.max_credit_cards}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamentos
                  </label>
                  <input
                    type="number"
                    name="max_budgets"
                    value={formData.max_budgets}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planejadores
                  </label>
                  <input
                    type="number"
                    name="max_planners"
                    value={formData.max_planners}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-700"
              >
                Plano ativo
              </label>
            </div>

            {/* ID Mercado Pago (somente leitura) */}
            {formData.mercadopago_plan_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Mercado Pago
                </label>
                <input
                  type="text"
                  value={formData.mercadopago_plan_id}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este campo não pode ser editado após integração com Mercado
                  Pago
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS.LIST)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContent>
  );
}
