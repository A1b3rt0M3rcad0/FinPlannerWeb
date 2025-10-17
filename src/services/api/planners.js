import api from "../../config/api";

const plannersAPI = {
  // Listar todos os planners do usuário
  getAll: async () => {
    const response = await api.get("/planners/all");
    return response.data;
  },

  // Buscar planners paginados
  getPaginated: async (page = 1, pageSize = 10) => {
    const response = await api.get("/planners", {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  // Buscar planner por ID
  getById: async (plannerId) => {
    const response = await api.get(`/planners/${plannerId}`);
    return response.data;
  },

  // Criar novo planner
  create: async (plannerData) => {
    const response = await api.post("/planners", plannerData);
    return response.data;
  },

  // Atualizar planner
  update: async (plannerId, plannerData) => {
    const response = await api.put(`/planners/${plannerId}`, plannerData);
    return response.data;
  },

  // Deletar planner
  delete: async (plannerId) => {
    const response = await api.delete(`/planners/${plannerId}`);
    return response.data;
  },

  // Buscar planners por campo
  search: async (field, value) => {
    const response = await api.get("/planners/search", {
      params: { field, value },
    });
    return response.data;
  },

  // Buscar membros de um planner (se houver endpoint específico)
  getMembers: async (plannerId) => {
    const response = await api.get(`/planners/${plannerId}/members`);
    return response.data;
  },

  // Adicionar membro ao planner
  addMember: async (plannerId, memberData) => {
    const response = await api.post(
      `/planners/${plannerId}/members`,
      memberData
    );
    return response.data;
  },

  // Remover membro do planner
  removeMember: async (plannerId, memberId) => {
    const response = await api.delete(
      `/planners/${plannerId}/members/${memberId}`
    );
    return response.data;
  },
};

export default plannersAPI;

