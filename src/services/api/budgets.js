import api from "../../config/api";

const budgetsAPI = {
  // Listar todos os orçamentos
  getAll: async (plannerId) => {
    const response = await api.get("/budgets/all", {
      params: { planner_id: plannerId },
    });
    return response.data;
  },

  // Buscar orçamentos paginados
  getPaginated: async (plannerId, page = 1, pageSize = 10) => {
    const response = await api.get("/budgets", {
      params: { planner_id: plannerId, page, page_size: pageSize },
    });
    return response.data;
  },

  // Buscar orçamento por ID
  getById: async (budgetId) => {
    const response = await api.get(`/budgets/${budgetId}`);
    return response.data;
  },

  // Buscar performance do orçamento
  getPerformance: async (budgetId) => {
    const response = await api.get(`/budgets/${budgetId}/performance`);
    return response.data;
  },

  // Criar novo orçamento
  create: async (budgetData) => {
    const response = await api.post("/budgets", budgetData);
    return response.data;
  },

  // Atualizar orçamento
  update: async (budgetId, budgetData) => {
    const response = await api.put(`/budgets/${budgetId}`, budgetData);
    return response.data;
  },

  // Deletar orçamento
  delete: async (budgetId) => {
    const response = await api.delete(`/budgets/${budgetId}`);
    return response.data;
  },
};

export default budgetsAPI;

