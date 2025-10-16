import axios from "axios";
import { API_CONFIG, AUTH_CONFIG } from "./constants";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    // Atualizar token se vier na resposta
    const newToken = response.data?.access_token;
    if (newToken) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
    }
    return response;
  },
  (error) => {
    // Em caso de 401, limpar tokens mas não redirecionar
    // O AuthGuard vai cuidar do redirecionamento
    if (error.response?.status === 401) {
      console.warn("⚠️ Erro 401 - Token inválido ou expirado");
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_INFO_KEY);

      // Dispara evento customizado para o AuthContext detectar
      window.dispatchEvent(new Event("auth-error"));
    }
    return Promise.reject(error);
  }
);

export default api;
