import api from "../../config/api";

const transactionsAPI = {
  // Listar todas as transações
  getAll: async (plannerId) => {
    const response = await api.get("/transactions/all", {
      params: { planner_id: plannerId },
    });
    return response.data;
  },

  // Buscar transações paginadas
  getPaginated: async (plannerId, page = 1, pageSize = 10, filters = {}) => {
    const response = await api.get("/transactions", {
      params: {
        planner_id: plannerId,
        page,
        page_size: pageSize,
        ...filters,
      },
    });
    return response.data;
  },

  // Buscar transação por ID
  getById: async (transactionId) => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },

  // Criar nova transação
  create: async (transactionData) => {
    const response = await api.post("/transactions", transactionData);
    return response.data;
  },

  // Atualizar transação
  update: async (transactionId, transactionData) => {
    const response = await api.put(
      `/transactions/${transactionId}`,
      transactionData
    );
    return response.data;
  },

  // Deletar transação
  delete: async (transactionId) => {
    const response = await api.delete(`/transactions/${transactionId}`);
    return response.data;
  },

  // Importar transações
  import: async (fileData) => {
    const formData = new FormData();
    formData.append("file", fileData);

    const response = await api.post("/import-transactions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default transactionsAPI;

