import api from "../../config/api";

const creditCardsAPI = {
  // Listar todos os cartões de crédito
  getAll: async (plannerId) => {
    const response = await api.get("/credit-cards", {
      params: { planner_id: plannerId },
    });
    return response.data;
  },

  // Buscar cartão por ID
  getById: async (cardId) => {
    const response = await api.get(`/credit-cards/${cardId}`);
    return response.data;
  },

  // Criar novo cartão
  create: async (cardData) => {
    const response = await api.post("/credit-cards", cardData);
    return response.data;
  },

  // Atualizar cartão (se endpoint existir)
  update: async (cardId, cardData) => {
    const response = await api.put(`/credit-cards/${cardId}`, cardData);
    return response.data;
  },

  // Deletar cartão (se endpoint existir)
  delete: async (cardId) => {
    const response = await api.delete(`/credit-cards/${cardId}`);
    return response.data;
  },

  // Buscar faturas do cartão (se endpoint existir)
  getInvoices: async (cardId) => {
    const response = await api.get(`/credit-cards/${cardId}/invoices`);
    return response.data;
  },
};

export default creditCardsAPI;

