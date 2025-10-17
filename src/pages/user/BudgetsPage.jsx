import { useState, useEffect } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  Calendar,
  DollarSign,
  Tag,
  PieChart,
} from "lucide-react";
import Swal from "sweetalert2";
import budgetsAPI from "../../services/api/budgets";
import { usePlanner } from "../../contexts/PlannerContext";

export default function BudgetsPage() {
  const { selectedPlanner } = usePlanner();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    limit: "",
    period: "month", // month, year
    color: "#3B82F6",
    alert_percentage: "80",
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    if (!selectedPlanner) {
      console.warn("Nenhum planner selecionado");
      return;
    }

    setLoading(true);
    try {
      const response = await budgetsAPI.getAll(selectedPlanner.id);
      const budgetsData = response.data || [];

      // Garante que valores são números
      const enrichedBudgets = budgetsData.map((budget) => ({
        ...budget,
        limit: parseFloat(
          budget.planned_amount || budget.limit || budget.amount || 0
        ),
        amount: parseFloat(budget.planned_amount || budget.amount || 0),
        spent: parseFloat(budget.spent || 0),
        transactions_count: parseInt(budget.transactions_count || 0),
      }));

      setBudgets(enrichedBudgets);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar orçamentos",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPercentage = (spent, limit) => {
    return (spent / limit) * 100;
  };

  const getStatusIcon = (percentage, alertPercentage) => {
    if (percentage >= 100) {
      return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" };
    }
    if (percentage >= alertPercentage) {
      return {
        icon: AlertTriangle,
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    }
    return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" };
  };

  const getProgressColor = (percentage, alertPercentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= alertPercentage) return "bg-orange-500";
    return "bg-green-500";
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.limit, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((sum, b) => sum + b.spent, 0);
  };

  const getTotalRemaining = () => {
    return getTotalBudget() - getTotalSpent();
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        name: budget.name,
        category: budget.category,
        limit: budget.limit.toString(),
        period: budget.period,
        color: budget.color,
        alert_percentage: budget.alert_percentage.toString(),
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: "",
        category: "",
        limit: "",
        period: "month",
        color: "#3B82F6",
        alert_percentage: "80",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlanner) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Nenhum planner selecionado",
      });
      return;
    }

    try {
      const now = new Date();

      const budgetData = {
        category_id: parseInt(formData.category),
        planned_amount: parseFloat(formData.limit),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        planner_id: selectedPlanner.id,
        notes: formData.name || null,
      };

      if (editingBudget) {
        const response = await budgetsAPI.update(editingBudget.id, budgetData);
        const updatedBudget = response.data;

        setBudgets((prev) =>
          prev.map((b) =>
            b.id === editingBudget.id
              ? {
                  ...updatedBudget,
                  spent: b.spent,
                  transactions_count: b.transactions_count,
                }
              : b
          )
        );

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Orçamento atualizado",
          timer: 2000,
        });
      } else {
        const response = await budgetsAPI.create(budgetData);
        const newBudget = response.data;

        setBudgets((prev) => [
          ...prev,
          {
            ...newBudget,
            limit: parseFloat(newBudget.planned_amount || newBudget.limit || 0),
            amount: parseFloat(
              newBudget.planned_amount || newBudget.amount || 0
            ),
            spent: parseFloat(newBudget.spent || 0),
            transactions_count: parseInt(newBudget.transactions_count || 0),
          },
        ]);

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Orçamento criado",
          timer: 2000,
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirmar exclusão?",
      text: "Esta ação não poderá ser desfeita",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await budgetsAPI.delete(id);

        setBudgets((prev) => prev.filter((b) => b.id !== id));

        Swal.fire({
          icon: "success",
          title: "Excluído!",
          text: "Orçamento excluído com sucesso",
          timer: 2000,
        });
      } catch (error) {
        console.error("Erro ao excluir orçamento:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error.response?.data?.error || error.message,
        });
      }
    }
  };

  const colorOptions = [
    { value: "#3B82F6", label: "Azul" },
    { value: "#8B5CF6", label: "Roxo" },
    { value: "#10B981", label: "Verde" },
    { value: "#F59E0B", label: "Laranja" },
    { value: "#EF4444", label: "Vermelho" },
    { value: "#EC4899", label: "Rosa" },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Orçamentos
            </h1>
            <p className="text-gray-600 mt-1">
              Controle seus gastos por categoria
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Novo Orçamento
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Orçamento Total
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(getTotalBudget())}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Total Gasto
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(getTotalSpent())}
            </p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <span>
                {((getTotalSpent() / getTotalBudget()) * 100).toFixed(1)}% do
                orçamento
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Disponível</p>
            <p
              className={`text-2xl font-bold ${
                getTotalRemaining() >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(getTotalRemaining())}
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setSelectedPeriod("year")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Anual
          </button>
        </div>

        {/* Budgets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Target size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum orçamento cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie orçamentos para controlar melhor seus gastos por categoria
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Criar Primeiro Orçamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {budgets
              .filter((b) => b.period === selectedPeriod)
              .map((budget) => {
                const percentage = getPercentage(budget.spent, budget.limit);
                const status = getStatusIcon(
                  percentage,
                  budget.alert_percentage
                );
                const StatusIcon = status.icon;
                const remaining = budget.limit - budget.spent;

                return (
                  <div
                    key={budget.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${budget.color}20` }}
                        >
                          <Target size={24} style={{ color: budget.color }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {budget.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Tag size={14} />
                            <span>{budget.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(budget)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 ${status.bg}`}
                    >
                      <StatusIcon size={16} className={status.color} />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {percentage >= 100
                          ? "Orçamento excedido"
                          : percentage >= budget.alert_percentage
                          ? "Próximo do limite"
                          : "Dentro do orçamento"}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progresso</span>
                        <span className="text-sm font-bold text-gray-800">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getProgressColor(
                            percentage,
                            budget.alert_percentage
                          )}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Values */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Gasto</p>
                        <p className="text-lg font-bold text-gray-800">
                          {formatCurrency(budget.spent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Limite</p>
                        <p className="text-lg font-bold text-gray-800">
                          {formatCurrency(budget.limit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {remaining >= 0 ? "Disponível" : "Excedido"}
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            remaining >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(Math.abs(remaining))}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          {budget.period === "month" ? "Mensal" : "Anual"}
                        </span>
                      </div>
                      <span>{budget.transactions_count} transações</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Overview Chart Section */}
        {budgets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PieChart size={20} />
              Visão Geral dos Orçamentos
            </h3>

            <div className="space-y-3">
              {budgets
                .filter((b) => b.period === selectedPeriod)
                .sort((a, b) => b.spent - a.spent)
                .map((budget) => {
                  const percentage = getPercentage(budget.spent, budget.limit);
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: budget.color }}
                          ></div>
                          <span className="font-medium text-gray-800">
                            {budget.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(budget.spent)} de{" "}
                          {formatCurrency(budget.limit)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 ml-6">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: budget.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Orçamento
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Alimentação"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Ex: Alimentação"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Limite (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, limit: e.target.value }))
                  }
                  placeholder="2000.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select
                  value={formData.period}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, period: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="month">Mensal</option>
                  <option value="year">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alerta ao atingir (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.alert_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      alert_percentage: e.target.value,
                    }))
                  }
                  placeholder="80"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você será alertado quando atingir essa porcentagem do limite
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color: color.value }))
                      }
                      className={`h-12 rounded-lg transition-all ${
                        formData.color === color.value
                          ? "ring-4 ring-offset-2 ring-blue-500 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingBudget ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
