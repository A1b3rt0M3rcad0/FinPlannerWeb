import api from "../../config/api";

const categoriesAPI = {
  // Listar todas as categorias
  getAll: async (plannerId) => {
    const response = await api.get("/categories/all", {
      params: { planner_id: plannerId },
    });
    return response.data;
  },

  // Buscar categorias paginadas
  getPaginated: async (plannerId, page = 1, pageSize = 10) => {
    const response = await api.get("/categories", {
      params: { planner_id: plannerId, page, page_size: pageSize },
    });
    return response.data;
  },

  // Buscar categoria por ID
  getById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  // Criar nova categoria
  create: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  // Atualizar categoria
  update: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Deletar categoria
  delete: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },
};

export default categoriesAPI;

