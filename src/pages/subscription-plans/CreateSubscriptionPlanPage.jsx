import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Wallet, AlertCircle } from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import { ROUTES, BILLING_INTERVALS } from "../../config/constants";
import subscriptionPlansAPI from "../../services/api/subscriptionPlans";
import Swal from "sweetalert2";

export default function CreateSubscriptionPlanPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    create_in_gateway: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar dados
      const dataToSend = {
        ...formData,
        base_plan_name: formData.base_plan_name || null,
        price: parseFloat(formData.price),
        billing_cycle_days: parseInt(formData.billing_cycle_days),
        max_users: formData.max_users ? parseInt(formData.max_users) : null,
        max_transactions_per_month: formData.max_transactions_per_month
          ? parseInt(formData.max_transactions_per_month)
          : null,
        max_bank_accounts: formData.max_bank_accounts
          ? parseInt(formData.max_bank_accounts)
          : null,
        max_credit_cards: formData.max_credit_cards
          ? parseInt(formData.max_credit_cards)
          : null,
        max_budgets: formData.max_budgets
          ? parseInt(formData.max_budgets)
          : null,
        max_planners: formData.max_planners
          ? parseInt(formData.max_planners)
          : null,
      };

      // Criar plano com integração Mercado Pago
      const response = await subscriptionPlansAPI.createWithPayment(dataToSend);

      Swal.fire({
        icon: "success",
        title: "Plano criado!",
        text: "Plano criado com sucesso no sistema e Mercado Pago",
        confirmButtonColor: "#0ea5e9",
      });

      navigate(ROUTES.SUBSCRIPTION_PLANS.LIST);
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao criar plano",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContent title="Novo Plano de Assinatura">
      <div className="max-w-4xl mx-auto">
        {/* Botão voltar */}
        <button
          onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS.LIST)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar para lista
        </button>

        {/* Card do formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Info sobre integração */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Integração com Mercado Pago</p>
              <p>
                Este plano será criado simultaneamente no sistema e no Mercado
                Pago, permitindo pagamentos recorrentes automáticos.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações básicas */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Informações do Plano
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ex: Plano Premium Mensal"
                    required
                  />
                </div>

                {/* Nome do Plano Base */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Plano Base (para agrupar variações)
                  </label>
                  <input
                    type="text"
                    name="base_plan_name"
                    value={formData.base_plan_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ex: Premium (deixe vazio se não houver variações)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use o mesmo nome base para agrupar planos com diferentes
                    ciclos de cobrança
                  </p>
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Descrição detalhada do plano"
                  />
                </div>

                {/* Preço */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="29.90"
                    required
                  />
                </div>

                {/* Ciclo de cobrança */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciclo de Cobrança *
                  </label>
                  <select
                    name="billing_cycle_days"
                    value={formData.billing_cycle_days}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
            </div>

            {/* Limites e recursos */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Limites de Recursos
              </h3>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Planners
                  </label>
                  <input
                    type="number"
                    name="max_planners"
                    value={formData.max_planners}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ilimitado"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ilimitado"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ilimitado"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ilimitado"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-700"
              >
                Plano ativo (disponível para assinatura)
              </label>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS.LIST)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-bold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? "Criando..." : "Criar Plano"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContent>
  );
}
