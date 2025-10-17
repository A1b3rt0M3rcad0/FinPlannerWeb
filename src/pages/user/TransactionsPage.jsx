import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/layout/UserLayout";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  X,
  Edit2,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import Swal from "sweetalert2";
import transactionsAPI from "../../services/api/transactions";
import categoriesAPI from "../../services/api/categories";
import accountsAPI from "../../services/api/accounts";
import { usePlanner } from "../../contexts/PlannerContext";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { selectedPlanner } = usePlanner();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [filters, setFilters] = useState({
    type: "all", // all, income, expense
    category: "all",
    period: "month", // week, month, year, custom
    search: "",
  });

  const [formData, setFormData] = useState({
    type: "expense",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    account: "",
    notes: "",
  });

  useEffect(() => {
    loadTransactions();
    loadCategoriesAndAccounts();
  }, [selectedPlanner]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const loadTransactions = async () => {
    if (!selectedPlanner) {
      console.warn("Nenhum planner selecionado");
      return;
    }

    setLoading(true);
    try {
      const response = await transactionsAPI.getAll(selectedPlanner.id);
      const transactionsData = response.data || [];

      // Enriquecer transações com nomes de categoria e conta
      const enrichedTransactions = transactionsData.map((t) => {
        const category = categories.find((c) => c.id === t.category_id);
        const account = accounts.find((a) => a.id === t.account_id);

        return {
          ...t,
          type: t.transaction_type || t.type,
          category: category?.name || "Sem categoria",
          account: account?.name || "Sem conta",
        };
      });

      setTransactions(enrichedTransactions);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar transações",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndAccounts = async () => {
    if (!selectedPlanner) return;

    try {
      const [categoriesRes, accountsRes] = await Promise.all([
        categoriesAPI.getAll(selectedPlanner.id),
        accountsAPI.getAll(selectedPlanner.id),
      ]);

      setCategories(categoriesRes.data || []);
      setAccounts(accountsRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias e contas:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filtro por busca
    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type || transaction.transaction_type,
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.date,
        category: transaction.category_id?.toString() || "",
        account: transaction.account_id?.toString() || "",
        notes: transaction.notes || "",
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: "expense",
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        account: "",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
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
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        transaction_type: formData.type,
        date: formData.date,
        category_id: parseInt(formData.category),
        account_id: parseInt(formData.account),
        planner_id: selectedPlanner.id,
        notes: formData.notes || null,
      };

      if (editingTransaction) {
        const response = await transactionsAPI.update(
          editingTransaction.id,
          transactionData
        );

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Transação atualizada",
          timer: 2000,
        });

        // Recarregar transações
        loadTransactions();
      } else {
        const response = await transactionsAPI.create(transactionData);

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Transação criada",
          timer: 2000,
        });

        // Recarregar transações
        loadTransactions();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
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
        await transactionsAPI.delete(id);

        setTransactions((prev) => prev.filter((t) => t.id !== id));

        Swal.fire({
          icon: "success",
          title: "Excluído!",
          text: "Transação excluída com sucesso",
          timer: 2000,
        });
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error.response?.data?.error || error.message,
        });
      }
    }
  };

  const getTypeColor = (type) => {
    return type === "income"
      ? "text-green-600 bg-green-50"
      : "text-red-600 bg-red-50";
  };

  const getTotalIncome = () => {
    return filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = () => {
    return filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Transações
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas receitas e despesas
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/app/transactions/import")}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Nova Transação</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Total de Receitas
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalIncome())}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Total de Despesas
            </p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(getTotalExpense())}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Saldo</p>
            <p
              className={`text-2xl font-bold ${
                getTotalIncome() - getTotalExpense() >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(getTotalIncome() - getTotalExpense())}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar transações..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} />
              Filtros
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${getTypeColor(
                          transaction.type
                        )}`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <ArrowDownLeft size={20} />
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Tag size={14} />
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <Calendar size={14} />
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(transaction)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTransaction ? "Editar Transação" : "Nova Transação"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "expense" }))
                  }
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.type === "expense"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "income" }))
                  }
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.type === "income"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Receita
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories
                    .filter(
                      (c) => c.type === formData.type || c.type === "both"
                    )
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conta
                </label>
                <select
                  value={formData.account}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      account: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.bank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Notas adicionais sobre esta transação..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Submit */}
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
                  {editingTransaction ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
