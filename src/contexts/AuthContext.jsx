import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_CONFIG } from "../config/constants";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verifica se o token é válido (decodifica JWT sem verificar assinatura)
  const isTokenValid = useCallback((token) => {
    if (!token) return false;

    try {
      // Decodifica o payload do JWT (parte central do token)
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));

      // Verifica se o token expirou
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          console.warn("Token expirado");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return false;
    }
  }, []);

  // Verifica autenticação ao carregar o app
  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_CONFIG.USER_INFO_KEY);

      console.log("🔍 Verificando autenticação...");
      console.log("Token existe:", !!token);
      console.log("User existe:", !!storedUser);

      // Se não tem token, não está autenticado
      if (!token) {
        console.log("❌ Sem token - não autenticado");
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Valida o token
      if (!isTokenValid(token)) {
        console.log("❌ Token inválido ou expirado");
        logout();
        return;
      }

      // Se tem token válido, tenta recuperar usuário
      if (storedUser) {
        try {
          const userParsed = JSON.parse(storedUser);
          console.log("✅ Usuário autenticado:", userParsed.email);
          setUser(userParsed);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Erro ao parsear usuário:", error);
          logout();
          return;
        }
      } else {
        // Tem token mas não tem user info - ainda considera autenticado
        console.log("⚠️ Token válido mas sem informações do usuário");
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erro na verificação de autenticação:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [isTokenValid]);

  // Faz login do usuário
  const login = useCallback((token, refreshToken, userInfo) => {
    console.log("🔐 Fazendo login...");
    console.log("Token:", token ? "✓" : "✗");
    console.log("Refresh Token:", refreshToken ? "✓" : "✗");
    console.log("User Info:", userInfo ? "✓" : "✗");

    // Salva no localStorage
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);

    if (refreshToken) {
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    }

    if (userInfo) {
      localStorage.setItem(AUTH_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo));
      setUser(userInfo);
    }

    setIsAuthenticated(true);
    console.log("✅ Login realizado com sucesso");
  }, []);

  // Faz logout do usuário
  const logout = useCallback(() => {
    console.log("🚪 Fazendo logout...");

    // Verifica se é admin para redirecionar ao login correto
    const storedUser = localStorage.getItem(AUTH_CONFIG.USER_INFO_KEY);
    let isAdmin = false;

    if (storedUser) {
      try {
        const userParsed = JSON.parse(storedUser);
        // Verifica se tem role admin ou is_super_admin
        isAdmin =
          userParsed.role === "admin" ||
          userParsed.is_super_admin ||
          userParsed.user_type === "admin";
      } catch (error) {
        console.error("Erro ao parsear usuário no logout:", error);
      }
    }

    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_INFO_KEY);
    setIsAuthenticated(false);
    setUser(null);

    // Redireciona para login admin se for admin, senão para home
    const redirectPath = isAdmin ? "/admin/login" : "/";
    navigate(redirectPath, { replace: true });
    console.log(`✅ Logout realizado - redirecionando para ${redirectPath}`);
  }, [navigate]);

  // Atualiza o token (para refresh)
  const updateToken = useCallback((newToken) => {
    console.log("🔄 Atualizando token...");
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
  }, []);

  // Atualiza informações do usuário
  const updateUserInfo = useCallback((userInfo) => {
    console.log("👤 Atualizando informações do usuário...");
    localStorage.setItem(AUTH_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
  }, []);

  // Verifica auth quando o componente monta
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Escuta eventos de erro de autenticação (ex: 401 da API)
  useEffect(() => {
    const handleAuthError = () => {
      console.log("🚨 Evento de erro de autenticação detectado");
      logout();
    };

    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, [logout]);

  // Debug: Log do estado quando muda
  useEffect(() => {
    console.log("📊 Estado de autenticação:", {
      isAuthenticated,
      hasUser: !!user,
      loading,
    });
  }, [isAuthenticated, user, loading]);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    updateToken,
    updateUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
