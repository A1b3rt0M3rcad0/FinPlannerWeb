import api from "../../config/api";

const adminsAPI = {
  // Listar todos os administradores
  getAll: async () => {
    const response = await api.get("/admins");
    return response.data;
  },

  // Listar todos (sem paginação)
  getAllNoPagination: async () => {
    const response = await api.get("/admins/all");
    return response.data;
  },

  // Buscar admin por ID
  getById: async (id) => {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  },

  // Criar novo administrador
  create: async (adminData) => {
    const response = await api.post("/admins", adminData);
    return response.data;
  },

  // Atualizar administrador
  update: async (id, adminData) => {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  // Deletar administrador
  delete: async (id) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  },

  // Buscar administradores
  search: async (searchTerm) => {
    const response = await api.get(`/admins/search`, {
      params: { q: searchTerm },
    });
    return response.data;
  },
};

export default adminsAPI;
