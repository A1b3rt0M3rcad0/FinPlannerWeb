import { useState, useEffect } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  X,
  DollarSign,
  Building2,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AccountsPage() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [balancesVisible, setBalancesVisible] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    type: "checking", // checking, savings, investment
    bank: "",
    balance: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // TODO: Integrar com API
      setTimeout(() => {
        const mockData = [
          {
            id: 1,
            name: "Conta Corrente",
            type: "checking",
            bank: "Nubank",
            balance: 5420.50,
            color: "#8B5CF6",
            icon: Building2,
            lastTransactions: [
              { type: "income", amount: 1500, date: "2025-10-15" },
              { type: "expense", amount: 234.50, date: "2025-10-14" },
            ],
          },
          {
            id: 2,
            name: "Conta Poupança",
            type: "savings",
            bank: "Banco do Brasil",
            balance: 15000.00,
            color: "#10B981",
            icon: Wallet,
            lastTransactions: [
              { type: "income", amount: 500, date: "2025-10-10" },
            ],
          },
          {
            id: 3,
            name: "Investimentos",
            type: "investment",
            bank: "XP Investimentos",
            balance: 25000.00,
            color: "#F59E0B",
            icon: TrendingUp,
            lastTransactions: [
              { type: "income", amount: 350, date: "2025-10-05" },
            ],
          },
        ];
        setAccounts(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!balancesVisible) return "R$ •••••";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const getAccountTypeLabel = (type) => {
    const types = {
      checking: "Conta Corrente",
      savings: "Poupança",
      investment: "Investimentos",
    };
    return types[type] || type;
  };

  const getAccountTypeIcon = (type) => {
    const icons = {
      checking: Building2,
      savings: Wallet,
      investment: TrendingUp,
    };
    return icons[type] || Building2;
  };

  const handleOpenModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        bank: account.bank,
        balance: account.balance.toString(),
        color: account.color,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: "",
        type: "checking",
        bank: "",
        balance: "",
        color: "#3B82F6",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance),
        id: editingAccount ? editingAccount.id : Date.now(),
        icon: getAccountTypeIcon(formData.type),
        lastTransactions: editingAccount ? editingAccount.lastTransactions : [],
      };

      if (editingAccount) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === editingAccount.id ? accountData : a))
        );
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Conta atualizada",
          timer: 2000,
        });
      } else {
        setAccounts((prev) => [...prev, accountData]);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Conta criada",
          timer: 2000,
        });
      }

      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirmar exclusão?",
      text: "Todas as transações associadas serão mantidas",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        Swal.fire({
          icon: "success",
          title: "Excluído!",
          text: "Conta excluída com sucesso",
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error.message,
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
    { value: "#06B6D4", label: "Ciano" },
    { value: "#6366F1", label: "Índigo" },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Contas Bancárias
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas contas e saldos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBalancesVisible(!balancesVisible)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {balancesVisible ? (
                <>
                  <EyeOff size={20} />
                  <span className="hidden sm:inline">Ocultar Saldos</span>
                </>
              ) : (
                <>
                  <Eye size={20} />
                  <span className="hidden sm:inline">Mostrar Saldos</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Nova Conta</span>
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">
                Saldo Total
              </p>
              <h2 className="text-4xl font-bold mb-2">
                {formatCurrency(getTotalBalance())}
              </h2>
              <p className="text-blue-100 text-sm">
                {accounts.length} conta{accounts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="hidden sm:block p-4 bg-white/20 rounded-2xl">
              <Wallet size={48} />
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Wallet size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhuma conta cadastrada
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione suas contas bancárias para começar a gerenciar suas finanças
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Adicionar Primeira Conta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const Icon = account.icon;
              return (
                <div
                  key={account.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header Card */}
                  <div
                    className="p-6"
                    style={{
                      background: `linear-gradient(135deg, ${account.color} 0%, ${account.color}dd 100%)`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(account)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="text-white">
                      <p className="text-sm opacity-90 mb-1">
                        {getAccountTypeLabel(account.type)}
                      </p>
                      <h3 className="text-xl font-bold mb-1">{account.name}</h3>
                      <p className="text-sm opacity-75">{account.bank}</p>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="p-6 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Saldo Atual</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>

                  {/* Recent Transactions */}
                  {account.lastTransactions &&
                    account.lastTransactions.length > 0 && (
                      <div className="px-6 pb-6">
                        <p className="text-xs text-gray-500 mb-3">
                          Últimas movimentações
                        </p>
                        <div className="space-y-2">
                          {account.lastTransactions.slice(0, 2).map((tx, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {tx.type === "income" ? (
                                  <ArrowUpRight
                                    size={16}
                                    className="text-green-600"
                                  />
                                ) : (
                                  <ArrowDownLeft
                                    size={16}
                                    className="text-red-600"
                                  />
                                )}
                                <span className="text-gray-600">
                                  {new Date(tx.date).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                              <span
                                className={`font-medium ${
                                  tx.type === "income"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {tx.type === "income" ? "+" : "-"}
                                {formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAccount ? "Editar Conta" : "Nova Conta"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Conta Corrente"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="investment">Investimentos</option>
                </select>
              </div>

              {/* Bank */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco/Instituição
                </label>
                <input
                  type="text"
                  value={formData.bank}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bank: e.target.value }))
                  }
                  placeholder="Ex: Nubank"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saldo Inicial
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, balance: e.target.value }))
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Card
                </label>
                <div className="grid grid-cols-4 gap-3">
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
                  {editingAccount ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}

