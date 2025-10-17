import { useState, useEffect } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  Plus,
  Calendar,
  Users,
  Edit2,
  Trash2,
  X,
  UserPlus,
  Crown,
  Settings,
  LogOut as LogOutIcon,
} from "lucide-react";
import { usePlanner } from "../../contexts/PlannerContext";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import plannersAPI from "../../services/api/planners";

export default function PlannersPage() {
  const [loading, setLoading] = useState(false);
  const [planners, setPlanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingPlanner, setEditingPlanner] = useState(null);
  const [selectedPlannerForMembers, setSelectedPlannerForMembers] =
    useState(null);

  const { selectedPlanner, selectPlanner, clearPlanner } = usePlanner();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se veio com flag de needsPlanner (redirecionado por falta de planner)
  const needsPlanner = location.state?.needsPlanner;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [memberEmail, setMemberEmail] = useState("");

  useEffect(() => {
    loadPlanners();

    // Se foi redirecionado por falta de planner, abre modal automaticamente
    if (needsPlanner) {
      // Garante que o formData está limpo
      setFormData({ name: "", description: "" });
      setEditingPlanner(null);
      setShowModal(true);
      // Limpa a flag do state
      navigate("/app/planners", { replace: true, state: {} });
    }
  }, [needsPlanner]);

  const loadPlanners = async () => {
    setLoading(true);
    try {
      const response = await plannersAPI.getAll();
      const plannersData = response.data || [];

      // Enriquecer dados dos planners
      const enrichedPlanners = await Promise.all(
        plannersData.map(async (planner) => {
          try {
            // Tentar buscar membros do planner
            const membersResponse = await plannersAPI.getMembers(planner.id);
            const members = membersResponse.data || [];

            return {
              ...planner,
              is_owner: planner.owner_id === user?.id,
              members: members,
              members_count: members.length,
            };
          } catch (error) {
            // Se não conseguir buscar membros, retorna com dados básicos
            console.warn(
              `Não foi possível carregar membros do planner ${planner.id}`,
              error
            );
            return {
              ...planner,
              is_owner: planner.owner_id === user?.id,
              members: [],
              members_count: 0,
            };
          }
        })
      );

      setPlanners(enrichedPlanners);
    } catch (error) {
      console.error("Erro ao carregar planners:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar planners",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (planner = null) => {
    if (planner) {
      setEditingPlanner(planner);
      setFormData({
        name: planner.name,
        description: planner.description || "",
      });
    } else {
      setEditingPlanner(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação extra
    if (!formData.name || formData.name.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Por favor, informe o nome do planner",
      });
      return;
    }

    try {
      if (editingPlanner) {
        // Atualizar planner existente
        const response = await plannersAPI.update(editingPlanner.id, formData);
        const updatedPlanner = response.data;

        // Atualizar na lista local
        setPlanners((prev) =>
          prev.map((p) =>
            p.id === editingPlanner.id
              ? {
                  ...p,
                  ...updatedPlanner,
                }
              : p
          )
        );

        // Se for o planner selecionado, atualiza o contexto
        if (selectedPlanner?.id === editingPlanner.id) {
          selectPlanner({
            ...selectedPlanner,
            ...updatedPlanner,
          });
        }

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Planner atualizado",
          timer: 2000,
        });
      } else {
        // Criar novo planner
        console.log("📋 Criando planner com dados:", formData);
        const response = await plannersAPI.create(formData);
        console.log("✅ Planner criado:", response.data);
        const newPlanner = response.data;

        // Adicionar à lista local com dados enriquecidos
        setPlanners((prev) => [
          ...prev,
          {
            ...newPlanner,
            is_owner: true,
            members: [],
            members_count: 0,
          },
        ]);

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Planner criado",
          timer: 2000,
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error("❌ Erro ao salvar planner:", error);
      console.error("Detalhes do erro:", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirmar exclusão?",
      text: "Todas as transações e dados deste planner serão excluídos",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        console.log(`🗑️ Excluindo planner ID: ${id}`);
        const response = await plannersAPI.delete(id);
        console.log("✅ Planner excluído:", response);

        setPlanners((prev) => prev.filter((p) => p.id !== id));

        // Se deletou o planner selecionado, limpa a seleção
        if (selectedPlanner?.id === id) {
          clearPlanner();
        }

        Swal.fire({
          icon: "success",
          title: "Excluído!",
          text: "Planner excluído com sucesso",
          timer: 2000,
        });

        // Recarrega a lista para garantir sincronização
        await loadPlanners();
      } catch (error) {
        console.error("❌ Erro ao excluir planner:", error);
        console.error("Detalhes:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir",
          text: error.response?.data?.error || error.message,
        });
      }
    }
  };

  const handleSelectPlanner = (planner) => {
    selectPlanner(planner);
    Swal.fire({
      icon: "success",
      title: "Planner Alterado!",
      text: `Agora você está em: ${planner.name}`,
      timer: 2000,
    });
  };

  const handleOpenMembersModal = (planner) => {
    setSelectedPlannerForMembers(planner);
    setShowMembersModal(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      await plannersAPI.addMember(selectedPlannerForMembers.id, {
        email: memberEmail,
      });

      Swal.fire({
        icon: "success",
        title: "Convite Enviado!",
        text: `Convite enviado para ${memberEmail}`,
        timer: 2000,
      });
      setMemberEmail("");
      setShowMembersModal(false);

      // Recarregar planners para atualizar lista de membros
      loadPlanners();
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || error.message,
      });
    }
  };

  const handleRemoveMember = async (plannerId, memberId) => {
    const result = await Swal.fire({
      title: "Remover membro?",
      text: "O membro perderá acesso a este planner",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await plannersAPI.removeMember(plannerId, memberId);

        Swal.fire({
          icon: "success",
          title: "Removido!",
          timer: 2000,
        });

        // Recarregar planners para atualizar lista de membros
        loadPlanners();
      } catch (error) {
        console.error("Erro ao remover membro:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error.response?.data?.error || error.message,
        });
      }
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Meus Planners
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus planejadores financeiros
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Novo Planner
          </button>
        </div>

        {/* Current Planner */}
        {selectedPlanner && (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Planner Ativo
                </p>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedPlanner.name}
                </h2>
                {selectedPlanner.description && (
                  <p className="text-blue-100">{selectedPlanner.description}</p>
                )}
              </div>
              <div className="hidden sm:block p-4 bg-white/20 rounded-2xl">
                <Calendar size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Planners List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : planners.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum planner cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie seu primeiro planner para começar a organizar suas finanças
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Criar Primeiro Planner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {planners.map((planner) => (
              <div
                key={planner.id}
                className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all ${
                  selectedPlanner?.id === planner.id
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-100 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Calendar size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {planner.name}
                        </h3>
                        {selectedPlanner?.id === planner.id && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                            Ativo
                          </span>
                        )}
                      </div>
                      {planner.description && (
                        <p className="text-sm text-gray-600">
                          {planner.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {planner.is_owner && (
                      <>
                        <button
                          onClick={() => handleOpenModal(planner)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(planner.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>
                      {planner.members_count} membro
                      {planner.members_count > 1 ? "s" : ""}
                    </span>
                  </div>
                  {planner.is_owner && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Crown size={16} />
                      Proprietário
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {selectedPlanner?.id !== planner.id && (
                    <button
                      onClick={() => handleSelectPlanner(planner)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Selecionar
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenMembersModal(planner)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Users size={16} />
                    Membros
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPlanner ? "Editar Planner" : "Novo Planner"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  minLength={1}
                  maxLength={100}
                  autoFocus
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
                  placeholder="Breve descrição"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingPlanner ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Members */}
      {showMembersModal && selectedPlannerForMembers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Membros - {selectedPlannerForMembers.name}
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Add Member Form */}
            {selectedPlannerForMembers.is_owner && (
              <form onSubmit={handleAddMember} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adicionar Membro
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Um convite será enviado para o email
                </p>
              </form>
            )}

            {/* Members List */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Membros Atuais ({selectedPlannerForMembers.members.length})
              </h3>
              {selectedPlannerForMembers.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.role === "owner" ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-medium flex items-center gap-1">
                        <Crown size={12} />
                        Dono
                      </span>
                    ) : (
                      selectedPlannerForMembers.is_owner && (
                        <button
                          onClick={() =>
                            handleRemoveMember(
                              selectedPlannerForMembers.id,
                              member.id
                            )
                          }
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <LogOutIcon size={16} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
