import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";

/**
 * Guard para proteger rotas de usuário comum
 * Apenas usuários autenticados que NÃO são admin podem acessar
 */
export default function UserAuthGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log("🛡️ UserAuthGuard:", {
    path: location.pathname,
    isAuthenticated,
    loading,
    hasUser: !!user,
    userType: user?.user_type,
    role: user?.role,
  });

  if (loading) {
    console.log("⏳ UserAuthGuard - Carregando autenticação...");
    return <LoadingSpinner message="Carregando seu dashboard..." />;
  }

  // Se não está autenticado, redireciona para login de usuário
  if (!isAuthenticated) {
    console.log(
      "❌ UserAuthGuard - Não autenticado - redirecionando para login"
    );
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Verifica se é admin (se for, redireciona para dashboard admin)
  const isAdmin =
    user?.user_type === "admin" ||
    user?.role === "admin" ||
    user?.is_super_admin;

  if (isAdmin) {
    console.log(
      "⚠️ UserAuthGuard - Usuário é admin - redirecionando para dashboard admin"
    );
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  console.log("✅ UserAuthGuard aprovado - renderizando página de usuário");
  return children;
}
