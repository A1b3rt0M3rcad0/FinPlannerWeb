import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  ArrowRight,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePlanner } from "../../contexts/PlannerContext";
import { ROUTES } from "../../config/constants";
import Swal from "sweetalert2";

export default function SelectPlannerPage() {
  const [loading, setLoading] = useState(true);
  const [planners, setPlanners] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { user, logout } = useAuth();
  const { selectPlanner } = usePlanner();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlanners();
  }, []);

  const loadPlanners = async () => {
    setLoading(true);
    try {
      // TODO: Integrar com API GET /planners (do usuário logado)
      setTimeout(() => {
        const mockPlanners = [
          {
            id: 1,
            name: "Finanças Pessoais",
            description: "Minhas finanças pessoais",
            owner_id: user?.id,
            is_owner: true,
            members_count: 1,
            created_at: "2025-01-15",
          },
          {
            id: 2,
            name: "Família",
            description: "Orçamento familiar compartilhado",
            owner_id: user?.id,
            is_owner: true,
            members_count: 3,
            created_at: "2025-02-20",
          },
        ];
        setPlanners(mockPlanners);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar planners:", error);
      setLoading(false);
    }
  };

  const handleSelectPlanner = (planner) => {
    selectPlanner(planner);
    Swal.fire({
      icon: "success",
      title: `${planner.name}`,
      text: "Planner selecionado!",
      timer: 1500,
      showConfirmButton: false,
    });
    navigate(ROUTES.USER_DASHBOARD);
  };

  const handleCreatePlanner = async (e) => {
    e.preventDefault();

    try {
      // TODO: Integrar com API POST /planners
      const newPlanner = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        owner_id: user?.id,
        is_owner: true,
        members_count: 1,
        created_at: new Date().toISOString(),
      };

      setPlanners((prev) => [...prev, newPlanner]);
      
      Swal.fire({
        icon: "success",
        title: "Planner Criado!",
        text: `${newPlanner.name} foi criado com sucesso`,
        timer: 2000,
        showConfirmButton: false,
      });

      setShowCreateModal(false);
      setFormData({ name: "", description: "" });

      // Auto-seleciona o planner recém criado
      handleSelectPlanner(newPlanner);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Erro ao criar planner",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-lg mb-4">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Olá, {user?.first_name}!
          </h1>
          <p className="text-white/80 text-lg">
            Selecione um planner para continuar
          </p>
        </div>

        {/* User Info Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <p className="text-white font-medium">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-white/60 text-sm capitalize">
                Plano: {user?.user_type || "Básico"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Planners Grid */}
        {planners.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhum Planner Encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie seu primeiro planner para começar a gerenciar suas finanças
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Criar Meu Primeiro Planner
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {planners.map((planner) => (
                <button
                  key={planner.id}
                  onClick={() => handleSelectPlanner(planner)}
                  className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all group text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <Calendar size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {planner.name}
                        </h3>
                        {planner.description && (
                          <p className="text-sm text-gray-600">
                            {planner.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight
                      size={24}
                      className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{planner.members_count} membro{planner.members_count > 1 ? "s" : ""}</span>
                    </div>
                    {planner.is_owner && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                        Proprietário
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Create New Planner Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-white/10 backdrop-blur-lg border-2 border-white/30 border-dashed rounded-2xl p-6 text-white hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center justify-center gap-3">
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-lg font-medium">Criar Novo Planner</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Modal Create Planner */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Novo Planner</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePlanner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Planner
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Finanças Pessoais"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Breve descrição do planner"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  maxLength={255}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Você poderá convidar outros membros depois de criar o
                  planner
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Criar Planner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

