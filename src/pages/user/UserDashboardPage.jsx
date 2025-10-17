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

export default function UserDashboardPage() {
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
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Integrar com APIs do backend
      // Simulação de dados
      setTimeout(() => {
        setDashboardData({
          balance: {
            total: 15420.5,
            income: 8500.0,
            expenses: 4230.0,
            savings: 4270.5,
          },
          recentTransactions: [
            {
              id: 1,
              type: "expense",
              description: "Supermercado",
              amount: 234.5,
              date: "2025-10-15",
              category: "Alimentação",
            },
            {
              id: 2,
              type: "income",
              description: "Salário",
              amount: 5000.0,
              date: "2025-10-14",
              category: "Salário",
            },
            {
              id: 3,
              type: "expense",
              description: "Netflix",
              amount: 39.9,
              date: "2025-10-13",
              category: "Entretenimento",
            },
          ],
          budgets: [
            {
              id: 1,
              name: "Alimentação",
              spent: 1234.5,
              limit: 2000.0,
              percentage: 61.7,
            },
            {
              id: 2,
              name: "Transporte",
              spent: 450.0,
              limit: 600.0,
              percentage: 75.0,
            },
          ],
          upcomingBills: [
            {
              id: 1,
              name: "Aluguel",
              amount: 1500.0,
              dueDate: "2025-10-25",
              status: "pending",
            },
            {
              id: 2,
              name: "Energia",
              amount: 180.0,
              dueDate: "2025-10-20",
              status: "upcoming",
            },
          ],
          cards: [
            {
              id: 1,
              name: "Visa Gold",
              limit: 5000.0,
              used: 1200.0,
              percentage: 24.0,
            },
          ],
          memberExpenses: [
            {
              member_id: 1,
              member_name: "Você",
              member_email: "nicole@gmail.com",
              total_expenses: 2450.0,
              transaction_count: 15,
              percentage: 58.0,
              color: "#3B82F6",
            },
            {
              member_id: 2,
              member_name: "Maria Silva",
              member_email: "maria@example.com",
              total_expenses: 1200.0,
              transaction_count: 8,
              percentage: 28.5,
              color: "#8B5CF6",
            },
            {
              member_id: 3,
              member_name: "João Silva",
              member_email: "joao@example.com",
              total_expenses: 580.0,
              transaction_count: 5,
              percentage: 13.5,
              color: "#10B981",
            },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
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
