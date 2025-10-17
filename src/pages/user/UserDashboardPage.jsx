import { useState, useEffect } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import { usePlanner } from "../../contexts/PlannerContext";
import analyticsAPI from "../../services/api/analytics";
import transactionsAPI from "../../services/api/transactions";
import budgetsAPI from "../../services/api/budgets";
import creditCardsAPI from "../../services/api/creditCards";
import Swal from "sweetalert2";

export default function UserDashboardPage() {
  const { selectedPlanner } = usePlanner();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    balance: {
      total: 0,
      income: 0,
      expenses: 0,
      savings: 0,
    },
    recentTransactions: [],
    budgets: [],
    upcomingBills: [],
    cards: [],
    memberExpenses: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedPlanner]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedPlanner) {
        loadDashboardData();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [selectedPlanner]);

  const loadDashboardData = async () => {
    if (!selectedPlanner) {
      console.warn("Nenhum planner selecionado");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Usar o novo endpoint consolidado que traz tudo de uma vez
      const response = await analyticsAPI.getUserDashboard(selectedPlanner.id);
      const dashboardResponse = response.data || {};

      const {
        balance = {},
        recent_transactions = [],
        budgets = [],
        credit_cards = [],
      } = dashboardResponse;

      // Processar orçamentos com percentuais
      const processedBudgets = budgets.map((budget) => ({
        ...budget,
        spent: budget.spent || 0,
        percentage: budget.limit
          ? ((budget.spent || 0) / budget.limit) * 100
          : 0,
      }));

      // Processar cartões com percentuais de uso
      const processedCards = credit_cards.map((card) => ({
        ...card,
        used: card.used || 0,
        percentage: card.limit ? ((card.used || 0) / card.limit) * 100 : 0,
      }));

      // Filtrar transações futuras/recorrentes para "contas a pagar"
      const upcomingBills = recent_transactions
        .filter((t) => {
          const transactionDate = new Date(t.date);
          const today = new Date();
          return t.type === "expense" && transactionDate > today;
        })
        .slice(0, 3)
        .map((t) => ({
          id: t.id,
          name: t.description,
          amount: t.amount,
          dueDate: t.date,
          status: "pending",
        }));

      // Buscar despesas por membro (opcional, se disponível)
      let memberExpenses = [];
      try {
        const expensesByCategoryRes = await analyticsAPI.getExpensesByCategory(
          selectedPlanner.id
        );
        const expensesData = expensesByCategoryRes.data || [];

        if (expensesData.length > 0 && expensesData[0].member_name) {
          memberExpenses = expensesData;
        }
      } catch (error) {
        console.warn("Não foi possível carregar gastos por membro:", error);
      }

      setDashboardData({
        balance: {
          total: balance.total || 0,
          income: balance.income || 0,
          expenses: balance.expenses || 0,
          savings: balance.savings || 0,
        },
        recentTransactions: recent_transactions.slice(0, 3),
        budgets: processedBudgets,
        upcomingBills: upcomingBills,
        cards: processedCards,
        memberExpenses: memberExpenses,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar dashboard",
        text: error.response?.data?.error || error.message,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Visão Geral Financeira
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe suas finanças em tempo real
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Saldo Total */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">
                  Saldo Total
                </p>
                <h2 className="text-3xl font-bold">
                  {formatCurrency(dashboardData.balance.total)}
                </h2>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Wallet size={24} />
              </div>
            </div>
          </div>

          {/* Receitas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Receitas
                </p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.balance.income)}
                </h2>
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <TrendingUp size={16} />
                  <span>+12%</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <ArrowUpRight size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Despesas
                </p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.balance.expenses)}
                </h2>
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <TrendingDown size={16} />
                  <span>+5%</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <ArrowDownLeft size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* Economia */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Economia
                </p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.balance.savings)}
                </h2>
                <div className="flex items-center gap-1 mt-2 text-blue-600 text-sm">
                  <TrendingUp size={16} />
                  <span>+25%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Target size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transações Recentes */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                Transações Recentes
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todas
              </button>
            </div>

            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        transaction.type === "income"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight size={20} className="text-green-600" />
                      ) : (
                        <ArrowDownLeft size={20} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contas a Pagar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Contas a Pagar
            </h3>

            <div className="space-y-4">
              {dashboardData.upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{bill.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Vence em {formatDate(bill.dueDate)}
                      </p>
                    </div>
                    <Clock size={16} className="text-orange-600" />
                  </div>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(bill.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orçamentos e Cartões */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orçamentos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Orçamentos do Mês
            </h3>

            <div className="space-y-4">
              {dashboardData.budgets.map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">
                      {budget.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(budget.spent)} /{" "}
                      {formatCurrency(budget.limit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        budget.percentage > 80
                          ? "bg-red-500"
                          : budget.percentage > 60
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${budget.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {budget.percentage.toFixed(1)}% utilizado
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cartões de Crédito */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Cartões de Crédito
            </h3>

            <div className="space-y-4">
              {dashboardData.cards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl text-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">{card.name}</span>
                    <CreditCard size={24} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Utilizado</span>
                      <span className="font-medium">
                        {formatCurrency(card.used)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${card.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Limite</span>
                      <span className="font-medium">
                        {formatCurrency(card.limit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gastos por Membros */}
        {dashboardData.memberExpenses &&
          dashboardData.memberExpenses.length > 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Users size={20} />
                  Gastos por Membro
                </h3>
                <span className="text-sm text-gray-600">
                  {dashboardData.memberExpenses.length} membros
                </span>
              </div>

              <div className="space-y-4">
                {dashboardData.memberExpenses
                  .sort((a, b) => b.total_expenses - a.total_expenses)
                  .map((member) => (
                    <div key={member.member_id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.member_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {member.member_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.transaction_count} transações
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            {formatCurrency(member.total_expenses)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.percentage.toFixed(1)}% do total
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${member.percentage}%`,
                            backgroundColor: member.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Total Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Total Geral</span>
                  <span className="text-xl font-bold text-gray-800">
                    {formatCurrency(
                      dashboardData.memberExpenses.reduce(
                        (sum, m) => sum + m.total_expenses,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>
    </UserLayout>
  );
}
