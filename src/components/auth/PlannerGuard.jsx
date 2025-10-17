import { Navigate, useLocation } from "react-router-dom";
import { usePlanner } from "../../contexts/PlannerContext";
import LoadingSpinner from "../ui/LoadingSpinner";

/**
 * Guard para verificar se um planner está selecionado
 * Redireciona para seleção de planner se não houver planner selecionado
 */
export default function PlannerGuard({ children }) {
  const { selectedPlanner, loading } = usePlanner();
  const location = useLocation();

  console.log("📋 PlannerGuard:", {
    path: location.pathname,
    hasPlanner: !!selectedPlanner,
    loading,
  });

  if (loading) {
    return <LoadingSpinner message="Carregando planner..." />;
  }

  // Se não tem planner selecionado, redireciona para seleção
  // EXCETO se já estiver na página de seleção de planner
  if (!selectedPlanner && location.pathname !== "/app/select-planner") {
    console.log("❌ PlannerGuard - Nenhum planner selecionado - redirecionando");
    return <Navigate to="/app/select-planner" replace />;
  }

  console.log("✅ PlannerGuard aprovado");
  return children;
}

