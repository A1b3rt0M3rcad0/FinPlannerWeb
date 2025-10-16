import api from "../../config/api";

const subscriptionPlansAPI = {
  // Listar todos os planos
  getAll: async () => {
    const response = await api.get("/subscription-plans");
    return response.data;
  },

  // Buscar plano por ID
  getById: async (id) => {
    const response = await api.get(`/subscription-plans/${id}`);
    return response;
  },

  // Criar plano SEM integração Mercado Pago
  create: async (planData) => {
    const response = await api.post("/subscription-plans", planData);
    return response.data;
  },

  // Criar plano COM integração Mercado Pago
  createWithPayment: async (planData) => {
    const response = await api.post("/subscription-plans/with-payment", {
      ...planData,
      create_in_gateway: true,
    });
    return response.data;
  },

  // Atualizar plano
  update: async (id, planData) => {
    const response = await api.put(`/subscription-plans/${id}`, planData);
    return response.data;
  },

  // Deletar plano
  delete: async (id) => {
    const response = await api.delete(`/subscription-plans/${id}`);
    return response.data;
  },
};

export default subscriptionPlansAPI;
