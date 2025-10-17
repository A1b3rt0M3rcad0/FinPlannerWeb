import api from "../../config/api";

const analyticsAPI = {
  // Buscar estatísticas do dashboard (Admin)
  getDashboardStats: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },

  // Buscar resumo financeiro
  getFinancialSummary: async (plannerId, startDate = null, endDate = null) => {
    const response = await api.get("/analytics/financial-summary", {
      params: {
        planner_id: plannerId,
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  // Buscar despesas por categoria
  getExpensesByCategory: async (
    plannerId,
    startDate = null,
    endDate = null
  ) => {
    const response = await api.get("/analytics/expenses-by-category", {
      params: {
        planner_id: plannerId,
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  // Buscar tendência mensal
  getMonthlyTrend: async (plannerId, months = 12) => {
    const response = await api.get("/analytics/monthly-trend", {
      params: {
        planner_id: plannerId,
        months,
      },
    });
    return response.data;
  },

  // Buscar maiores despesas
  getTopExpenses: async (plannerId, limit = 10) => {
    const response = await api.get("/analytics/top-expenses", {
      params: {
        planner_id: plannerId,
        limit,
      },
    });
    return response.data;
  },

  // Buscar performance de orçamento
  getBudgetPerformance: async (budgetId) => {
    const response = await api.get("/analytics/budget-performance", {
      params: {
        budget_id: budgetId,
      },
    });
    return response.data;
  },

  // Buscar dados consolidados do dashboard do usuário (NOVO - endpoint único)
  getUserDashboard: async (plannerId) => {
    const response = await api.get("/analytics/user-dashboard", {
      params: {
        planner_id: plannerId,
      },
    });
    return response.data;
  },
};

export default analyticsAPI;
