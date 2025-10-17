import { useState, useEffect } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  Plus,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  TrendingUp,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import creditCardsAPI from "../../services/api/creditCards";
import transactionsAPI from "../../services/api/transactions";
import { usePlanner } from "../../contexts/PlannerContext";

export default function CardsPage() {
  const { selectedPlanner } = usePlanner();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [numbersVisible, setNumbersVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    last_digits: "",
    brand: "visa", // visa, mastercard, elo, amex
    limit: "",
    closing_day: "",
    due_day: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    if (!selectedPlanner) {
      console.warn("Nenhum planner selecionado");
      return;
    }

    setLoading(true);
    try {
      const response = await creditCardsAPI.getAll(selectedPlanner.id);
      const cardsData = response.data || [];

      // Enriquecer cartões com cálculo de uso baseado em transações
      const enrichedCards = await Promise.all(
        cardsData.map(async (card) => {
          let used = 0;
          let invoices = [];

          try {
            // Buscar transações do cartão (se houver endpoint ou filtrar por credit_card_id)
            const transactionsRes = await transactionsAPI.getAll(
              selectedPlanner.id
            );
            const cardTransactions = (transactionsRes.data || []).filter(
              (t) => t.credit_card_id === card.id
            );

            // Calcular uso atual (mês corrente)
            const now = new Date();
            const currentMonthTransactions = cardTransactions.filter((t) => {
              const tDate = new Date(t.date);
              return (
                tDate.getMonth() === now.getMonth() &&
                tDate.getFullYear() === now.getFullYear()
              );
            });

            used = currentMonthTransactions.reduce(
              (sum, t) => sum + (t.amount || 0),
              0
            );

            // Criar fatura atual
            invoices = [
              {
                id: `${card.id}-current`,
                month: now.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                }),
                amount: used,
                due_date: `${now.getFullYear()}-${String(
                  now.getMonth() + 1
                ).padStart(2, "0")}-${String(card.due_day || 10).padStart(
                  2,
                  "0"
                )}`,
                status: "open",
              },
            ];
          } catch (error) {
            console.warn(`Erro ao calcular uso do cartão ${card.id}:`, error);
          }

          return {
            ...card,
            used,
            current_invoice: invoices[0],
            invoices,
          };
        })
      );

      setCards(enrichedCards);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar cartões",
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

  const formatCardNumber = (digits) => {
    if (!numbersVisible) return "•••• " + digits;
    return "**** **** **** " + digits;
  };

  const getUsagePercentage = (used, limit) => {
    return (used / limit) * 100;
  };

  const getUsageColor = (percentage) => {
    if (percentage > 80) return "bg-red-500";
    if (percentage > 60) return "bg-orange-500";
    return "bg-green-500";
  };

  const getBrandLogo = (brand) => {
    const logos = {
      visa: "VISA",
      mastercard: "MC",
      elo: "ELO",
      amex: "AMEX",
    };
    return logos[brand] || brand.toUpperCase();
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: "Em aberto", color: "bg-orange-100 text-orange-800" },
      paid: { label: "Paga", color: "bg-green-100 text-green-800" },
      overdue: { label: "Vencida", color: "bg-red-100 text-red-800" },
    };
    return badges[status] || badges.open;
  };

  const handleOpenModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setFormData({
        name: card.name,
        last_digits: card.last_digits,
        brand: card.brand,
        limit: card.limit.toString(),
        closing_day: card.closing_day.toString(),
        due_day: card.due_day.toString(),
        color: card.color,
      });
    } else {
      setEditingCard(null);
      setFormData({
        name: "",
        last_digits: "",
        brand: "visa",
        limit: "",
        closing_day: "",
        due_day: "",
        color: "#3B82F6",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCard(null);
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
      const cardData = {
        name: formData.name,
        last_digits: formData.last_digits,
        brand: formData.brand,
        limit: parseFloat(formData.limit),
        closing_day: parseInt(formData.closing_day),
        due_day: parseInt(formData.due_day),
        color: formData.color,
        planner_id: selectedPlanner.id,
      };

      if (editingCard) {
        const response = await creditCardsAPI.update(editingCard.id, cardData);

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Cartão atualizado",
          timer: 2000,
        });

        // Recarregar cartões
        loadCards();
      } else {
        const response = await creditCardsAPI.create(cardData);

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Cartão adicionado",
          timer: 2000,
        });

        // Recarregar cartões
        loadCards();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
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
      text: "O histórico de faturas será mantido",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await creditCardsAPI.delete(id);

        setCards((prev) => prev.filter((c) => c.id !== id));

        Swal.fire({
          icon: "success",
          title: "Excluído!",
          text: "Cartão excluído com sucesso",
          timer: 2000,
        });
      } catch (error) {
        console.error("Erro ao excluir cartão:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error.response?.data?.error || error.message,
        });
      }
    }
  };

  const handleViewInvoices = (card) => {
    setSelectedCard(card);
    setShowInvoiceModal(true);
  };

  const getTotalUsed = () => {
    return cards.reduce((sum, card) => sum + card.used, 0);
  };

  const getTotalLimit = () => {
    return cards.reduce((sum, card) => sum + card.limit, 0);
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
              Cartões de Crédito
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus cartões e faturas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNumbersVisible(!numbersVisible)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {numbersVisible ? (
                <>
                  <EyeOff size={20} />
                  <span className="hidden sm:inline">Ocultar</span>
                </>
              ) : (
                <>
                  <Eye size={20} />
                  <span className="hidden sm:inline">Mostrar</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Novo Cartão</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Limite Total
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(getTotalLimit())}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Total Utilizado
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(getTotalUsed())}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Limite Disponível
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalLimit() - getTotalUsed())}
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CreditCard size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione seus cartões de crédito para acompanhar suas faturas
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Adicionar Primeiro Cartão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => {
              const percentage = getUsagePercentage(card.used, card.limit);
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Card Visual */}
                  <div
                    className="p-6 text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                    }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="px-3 py-1 bg-white/20 rounded text-xs font-bold">
                          {getBrandLogo(card.brand)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(card)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-lg font-mono tracking-wider">
                          {formatCardNumber(card.last_digits)}
                        </p>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs opacity-75 mb-1">Titular</p>
                          <p className="text-sm font-medium">{card.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-75 mb-1">Vencimento</p>
                          <p className="text-sm font-medium">
                            Dia {card.due_day}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Utilizado</span>
                        <span className="font-bold text-gray-800">
                          {formatCurrency(card.used)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getUsageColor(
                            percentage
                          )}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{percentage.toFixed(1)}% do limite</span>
                        <span>Limite: {formatCurrency(card.limit)}</span>
                      </div>
                    </div>

                    {/* Current Invoice */}
                    {card.current_invoice && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-orange-800 font-medium">
                            Fatura Atual
                          </span>
                          <span className="text-xs text-orange-600">
                            Vence em{" "}
                            {new Date(
                              card.current_invoice.due_date
                            ).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-orange-900">
                          {formatCurrency(card.current_invoice.amount)}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleViewInvoices(card)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} />
                      Ver Faturas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Create/Edit Card */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCard ? "Editar Cartão" : "Novo Cartão"}
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
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Cartão Principal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Últimos 4 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength="4"
                    value={formData.last_digits}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        last_digits: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="1234"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bandeira
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="elo">Elo</option>
                    <option value="amex">American Express</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, limit: e.target.value }))
                  }
                  placeholder="5000.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia Fechamento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.closing_day}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        closing_day: e.target.value,
                      }))
                    }
                    placeholder="15"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_day}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        due_day: e.target.value,
                      }))
                    }
                    placeholder="25"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Cartão
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
                  {editingCard ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Invoices */}
      {showInvoiceModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Faturas - {selectedCard.name}
              </h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedCard.invoices.map((invoice) => {
                const status = getStatusBadge(invoice.status);
                return (
                  <div
                    key={invoice.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">
                        {invoice.month}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vencimento:{" "}
                          {new Date(invoice.due_date).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      {invoice.status === "open" && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Pagar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
