import api from "../../config/api";

const analyticsAPI = {
  // Buscar estatísticas do dashboard
  getDashboardStats: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },
};

export default analyticsAPI;

