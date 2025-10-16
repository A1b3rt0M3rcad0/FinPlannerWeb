import api from "../../config/api";

const paymentsAPI = {
  // Listar pagamentos com paginação
  getAll: async (page = 1, pageSize = 10) => {
    const response = await api.get("/payments", {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  // Buscar pagamento por ID
  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Criar pagamento PIX
  createPixPayment: async (paymentData) => {
    const response = await api.post("/payments/pix", paymentData);
    return response.data;
  },

  // Buscar pagamentos por assinatura
  getBySubscription: async (subscriptionId) => {
    const response = await api.get(`/payments`, {
      params: { subscription_id: subscriptionId },
    });
    return response.data;
  },
};

export default paymentsAPI;
