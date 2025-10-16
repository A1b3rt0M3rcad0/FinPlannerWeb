import { useState, useEffect } from "react";
import { X, CreditCard, Calendar, DollarSign } from "lucide-react";
import subscriptionPlansAPI from "../../services/api/subscriptionPlans";
import subscriptionsAPI from "../../services/api/subscriptions";
import Swal from "sweetalert2";

export default function CreateSubscriptionModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    subscription_plan_id: "",
    payment_method: "manual",
  });

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setFormData({
        subscription_plan_id: "",
        payment_method: "manual",
      });
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const response = await subscriptionPlansAPI.getAll();
      setPlans(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar planos de assinatura",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subscription_plan_id) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Selecione um plano de assinatura",
      });
      return;
    }

    setLoading(true);

    try {
      await subscriptionsAPI.create({
        user_id: user.id,
        subscription_plan_id: parseInt(formData.subscription_plan_id),
        payment_method: formData.payment_method,
      });

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Assinatura criada com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao criar assinatura",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedPlan = plans.find(
    (p) => p.id === parseInt(formData.subscription_plan_id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Criar Assinatura
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Para:{" "}
              <span className="font-semibold">
                {user?.first_name} {user?.last_name}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CreditCard size={16} />
              Plano de Assinatura *
            </label>
            <select
              name="subscription_plan_id"
              value={formData.subscription_plan_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Selecione um plano</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - R$ {plan.price} / {plan.billing_cycle_days} dias
                </option>
              ))}
            </select>
          </div>

          {/* Informações do Plano Selecionado */}
          {selectedPlan && (
            <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-primary-600" />
                Detalhes do Plano
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Valor:</span> R${" "}
                  {selectedPlan.price}
                </p>
                <p className="text-gray-700 flex items-center gap-1">
                  <Calendar size={14} />
                  <span className="font-medium">Ciclo:</span>{" "}
                  {selectedPlan.billing_cycle_days} dias
                </p>
                {selectedPlan.description && (
                  <p className="text-gray-600 mt-2">
                    {selectedPlan.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Método de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pagamento
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="manual">Manual / Transferência</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              * Assinatura criada manualmente pelo administrador
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando..." : "Criar Assinatura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
