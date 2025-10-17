import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import plannersAPI from "../services/api/planners";

const PlannerContext = createContext(null);

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner deve ser usado dentro de PlannerProvider");
  }
  return context;
};

const PLANNER_STORAGE_KEY = "finplanner_selected_planner";

export function PlannerProvider({ children }) {
  const [selectedPlanner, setSelectedPlanner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega e valida planner selecionado do localStorage ao montar
  useEffect(() => {
    validateStoredPlanner();
  }, []);

  const validateStoredPlanner = async () => {
    const storedPlanner = localStorage.getItem(PLANNER_STORAGE_KEY);

    if (storedPlanner) {
      try {
        const planner = JSON.parse(storedPlanner);
        console.log("📋 Planner encontrado no storage:", planner.name);

        // Valida se o planner ainda existe no backend
        try {
          const response = await plannersAPI.getById(planner.id);
          if (response.data) {
            setSelectedPlanner(response.data);
            console.log("✅ Planner validado no backend:", response.data.name);
          } else {
            throw new Error("Planner não encontrado");
          }
        } catch (error) {
          console.warn(
            "⚠️ Planner do storage não existe mais no backend, removendo:",
            error
          );
          localStorage.removeItem(PLANNER_STORAGE_KEY);
          setSelectedPlanner(null);
        }
      } catch (error) {
        console.error("❌ Erro ao validar planner do storage:", error);
        localStorage.removeItem(PLANNER_STORAGE_KEY);
        setSelectedPlanner(null);
      }
    }

    setLoading(false);
  };

  const selectPlanner = useCallback((planner) => {
    console.log("📋 Selecionando planner:", planner.name);
    setSelectedPlanner(planner);
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(planner));
  }, []);

  const clearPlanner = useCallback(() => {
    console.log("🗑️ Removendo planner selecionado");
    setSelectedPlanner(null);
    localStorage.removeItem(PLANNER_STORAGE_KEY);
  }, []);

  const updatePlanner = useCallback((updatedPlanner) => {
    console.log("🔄 Atualizando planner:", updatedPlanner.name);
    setSelectedPlanner(updatedPlanner);
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(updatedPlanner));
  }, []);

  const value = {
    selectedPlanner,
    loading,
    selectPlanner,
    clearPlanner,
    updatePlanner,
  };

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}
