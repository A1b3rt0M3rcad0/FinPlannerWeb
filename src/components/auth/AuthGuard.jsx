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
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Se não requer autenticação (página de login) e está autenticado, redireciona para dashboard
  if (!requireAuth && isAuthenticated) {
    console.log("✅ Já autenticado - redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ AuthGuard aprovado - renderizando página");
  return children;
}
