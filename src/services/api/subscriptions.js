import api from "../../config/api";

const subscriptionsAPI = {
  // Listar todas as assinaturas (admin) com paginação
  getAll: async (page = 1, pageSize = 10) => {
    const response = await api.get("/user-subscriptions", {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  // Buscar assinatura por ID
  getById: async (id) => {
    const response = await api.get(`/user-subscriptions/${id}`);
    return response.data;
  },

  // Buscar assinatura do usuário autenticado
  getMySubscription: async () => {
    const response = await api.get("/user-subscriptions/me");
    return response.data;
  },

  // Buscar assinaturas de um usuário específico (admin only)
  getByUserId: async (userId) => {
    const response = await api.get(`/user-subscriptions/user/${userId}`);
    return response.data;
  },

  // Criar assinatura SEM integração Mercado Pago
  create: async (subscriptionData) => {
    const response = await api.post("/user-subscriptions", subscriptionData);
    return response.data;
  },

  // Criar assinatura COM integração Mercado Pago (pagamento recorrente)
  subscribe: async (subscriptionData) => {
    const response = await api.post(
      "/user-subscriptions/subscribe",
      subscriptionData
    );
    return response.data;
  },

  // Cancelar assinatura
  cancel: async (id) => {
    const response = await api.put(`/user-subscriptions/${id}/cancel`);
    return response.data;
  },

  // Pausar assinatura
  pause: async (id) => {
    const response = await api.put(`/user-subscriptions/${id}/pause`);
    return response.data;
  },

  // Retomar assinatura
  resume: async (id) => {
    const response = await api.put(`/user-subscriptions/${id}/resume`);
    return response.data;
  },
};

export default subscriptionsAPI;
