import api from "../../config/api";

const userSettingsAPI = {
  // Buscar configurações do usuário autenticado
  getMySettings: async () => {
    const response = await api.get("/user-settings/me");
    return response.data;
  },

  // Atualizar configurações do usuário
  updateMySettings: async (settingsData) => {
    const response = await api.put("/user-settings/me", settingsData);
    return response.data;
  },

  // Atualizar apenas metas financeiras
  updateFinancialGoals: async (goalsData) => {
    const response = await api.put(
      "/user-settings/me/financial-goals",
      goalsData
    );
    return response.data;
  },

  // Atualizar apenas preferências
  updatePreferences: async (preferencesData) => {
    const response = await api.put(
      "/user-settings/me/preferences",
      preferencesData
    );
    return response.data;
  },
};

export default userSettingsAPI;
