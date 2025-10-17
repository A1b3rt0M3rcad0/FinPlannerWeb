import api from "../../config/api";

const accountsAPI = {
  // Listar todas as contas
  getAll: async (plannerId) => {
    const response = await api.get("/accounts/all", {
      params: { planner_id: plannerId },
    });
    return response.data;
  },

  // Buscar contas paginadas
  getPaginated: async (plannerId, page = 1, pageSize = 10) => {
    const response = await api.get("/accounts", {
      params: { planner_id: plannerId, page, page_size: pageSize },
    });
    return response.data;
  },

  // Buscar conta por ID
  getById: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}`);
    return response.data;
  },

  // Buscar distribuição de contas
  getDistribution: async (plannerId) => {
    const response = await api.get("/accounts/distribution", {
      params: { planner_id: plannerId },
    });
    return response.data;
  },

  // Criar nova conta
  create: async (accountData) => {
    const response = await api.post("/accounts", accountData);
    return response.data;
  },

  // Atualizar conta
  update: async (accountId, accountData) => {
    const response = await api.put(`/accounts/${accountId}`, accountData);
    return response.data;
  },

  // Deletar conta
  delete: async (accountId) => {
    const response = await api.delete(`/accounts/${accountId}`);
    return response.data;
  },
};

export default accountsAPI;

