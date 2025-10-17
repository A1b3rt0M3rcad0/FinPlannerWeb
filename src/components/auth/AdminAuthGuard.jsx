import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";

/**
 * Guard para proteger rotas administrativas
 * Apenas usuários com role 'admin' ou is_super_admin podem acessar
 */
export default function AdminAuthGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log("🛡️ AdminAuthGuard:", {
    path: location.pathname,
    isAuthenticated,
    loading,
    hasUser: !!user,
    userType: user?.user_type,
    role: user?.role,
    isSuperAdmin: user?.is_super_admin,
  });

  if (loading) {
    console.log("⏳ AdminAuthGuard - Carregando autenticação...");
    return (
      <LoadingSpinner message="Verificando permissões de administrador..." />
    );
  }

  // Se não está autenticado, redireciona para login admin
  if (!isAuthenticated) {
    console.log(
      "❌ AdminAuthGuard - Não autenticado - redirecionando para login admin"
    );
    return (
      <Navigate to={ROUTES.ADMIN_LOGIN} replace state={{ from: location }} />
    );
  }

  // Verifica se é admin
  const isAdmin =
    user?.user_type === "admin" ||
    user?.role === "admin" ||
    user?.is_super_admin;

  if (!isAdmin) {
    console.log(
      "❌ AdminAuthGuard - Usuário não é admin - redirecionando para dashboard de usuário"
    );
    return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
  }

  console.log("✅ AdminAuthGuard aprovado - renderizando página admin");
  return children;
}
