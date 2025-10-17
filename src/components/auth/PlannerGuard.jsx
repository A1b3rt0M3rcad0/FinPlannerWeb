import { Navigate, useLocation } from "react-router-dom";
import { usePlanner } from "../../contexts/PlannerContext";
import { useState, useEffect } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import plannersAPI from "../../services/api/planners";

/**
 * Guard para verificar se um planner está selecionado
 * Redireciona para seleção de planner se não houver planner selecionado
 */
export default function PlannerGuard({ children }) {
  const { selectedPlanner, selectPlanner, loading: contextLoading } = usePlanner();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasAnyPlanner, setHasAnyPlanner] = useState(true);

  useEffect(() => {
    checkPlanners();
  }, []);

  const checkPlanners = async () => {
    try {
      const response = await plannersAPI.getAll();
      const planners = response.data || [];
      
      console.log("📋 PlannerGuard - Planners encontrados:", planners.length);
      
      if (planners.length === 0) {
        console.log("❌ PlannerGuard - Nenhum planner existe, redirecionando para criação");
        setHasAnyPlanner(false);
      } else {
        setHasAnyPlanner(true);
        
        // Se não tem planner selecionado, seleciona o primeiro automaticamente
        if (!selectedPlanner) {
          console.log("📋 PlannerGuard - Selecionando primeiro planner automaticamente");
          selectPlanner(planners[0]);
        }
      }
    } catch (error) {
      console.error("❌ PlannerGuard - Erro ao verificar planners:", error);
      setHasAnyPlanner(false);
    } finally {
      setChecking(false);
    }
  };

  if (checking || contextLoading) {
    return <LoadingSpinner message="Verificando planners..." />;
  }

  // Se não existe nenhum planner no banco, redireciona para criar
  if (!hasAnyPlanner) {
    console.log("❌ PlannerGuard - Redirecionando para /app/planners (sem planners)");
    return <Navigate to="/app/planners" state={{ needsPlanner: true }} replace />;
  }

  // Se existe planner mas nenhum está selecionado ainda (aguardando seleção)
  if (!selectedPlanner) {
    return <LoadingSpinner message="Carregando planner..." />;
  }

  console.log("✅ PlannerGuard aprovado - Planner:", selectedPlanner.name);
  return children;
}

