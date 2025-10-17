import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function AuthGuard({ children, requireAuth = true }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Debug
  console.log("🛡️ AuthGuard:", {
    path: location.pathname,
    requireAuth,
    isAuthenticated,
    loading,
    hasUser: !!user,
  });

  if (loading) {
    console.log("⏳ Carregando autenticação...");
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // Se requer autenticação e não está autenticado, redireciona para login
  if (requireAuth && !isAuthenticated) {
    console.log("❌ Não autenticado - redirecionando para login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se não requer autenticação (página de login) e está autenticado, redireciona para dashboard correto
  if (!requireAuth && isAuthenticated) {
    console.log("✅ Já autenticado - redirecionando para dashboard");
    // Redireciona para o dashboard correto baseado no tipo de usuário
    const isAdmin = user?.user_type === 'admin' || user?.role === 'admin' || user?.is_super_admin;
    const redirectTo = isAdmin ? "/dashboard" : "/app";
    console.log(`🔀 Redirecionando ${isAdmin ? 'admin' : 'user'} para ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  console.log("✅ AuthGuard aprovado - renderizando página");
  return children;
}
