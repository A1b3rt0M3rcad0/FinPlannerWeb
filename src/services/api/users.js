import api from "../../config/api";

const usersAPI = {
  // Listar todos os usuários (admin) com paginação
  getAll: async (page = 1, pageSize = 10) => {
    const response = await api.get("/users", {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  // Buscar usuário por ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Criar usuário
  create: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Atualizar usuário
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Deletar usuário
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default usersAPI;

