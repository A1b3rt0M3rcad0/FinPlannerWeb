import { createContext, useContext, useState, useCallback, useEffect } from "react";

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

  // Carrega planner selecionado do localStorage ao montar
  useEffect(() => {
    const storedPlanner = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (storedPlanner) {
      try {
        const planner = JSON.parse(storedPlanner);
        setSelectedPlanner(planner);
        console.log("📋 Planner carregado do storage:", planner.name);
      } catch (error) {
        console.error("Erro ao carregar planner do storage:", error);
        localStorage.removeItem(PLANNER_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

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
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}

