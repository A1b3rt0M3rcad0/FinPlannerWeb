import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Eye,
  Trash2,
  Shield,
  User,
  Crown,
  Star,
  CreditCard,
  UserPlus,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import CreateSubscriptionModal from "../../components/ui/CreateSubscriptionModal";
import CreateUserModal from "../../components/ui/CreateUserModal";
import { ROUTES } from "../../config/constants";
import { useAuth } from "../../hooks/useAuth";
import usersAPI from "../../services/api/users";
import Swal from "sweetalert2";

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll(page, pagination.page_size);
      // Filtra usuários que não são administradores
      const nonAdminUsers = (response.data || []).filter(
        (user) => !user.is_admin && !user.is_super_admin
      );
      setUsers(nonAdminUsers);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao carregar usuários",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Note: Não filtra por role pois admins já foram filtrados no loadUsers

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(term) ||
          u.last_name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (id, userName) => {
    const result = await Swal.fire({
      title: "Confirmar exclusão",
      text: `Deseja realmente excluir o usuário "${userName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await usersAPI.delete(id);
        Swal.fire("Excluído!", "Usuário excluído com sucesso.", "success");
        loadUsers();
      } catch (error) {
        Swal.fire("Erro!", "Erro ao excluir usuário.", "error");
      }
    }
  };

  const getRoleBadge = (user) => {
    if (user.is_super_admin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200">
          <Crown size={14} />
          Super Admin
        </span>
      );
    }
    if (user.is_admin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
          <Shield size={14} />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
        <User size={14} />
        Usuário
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const isCurrentUser = (userId) => {
    return currentUser && currentUser.user_id === userId;
  };

  const handleCreateSubscription = (user) => {
    setSelectedUser(user);
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionCreated = () => {
    loadUsers();
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  if (loading) {
    return <LoadingSpinner message="Carregando usuários..." />;
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Gerenciar Usuários
            </h2>
            <p className="text-gray-600">
              {filteredUsers.length} usuário(s) encontrado(s)
            </p>
          </div>
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg font-semibold"
          >
            <UserPlus size={20} />
            Novo Usuário
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {/* Busca */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Lista de Usuários */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {users.length === 0
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário corresponde aos filtros"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const isMe = isCurrentUser(user.id);

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isMe ? "bg-primary-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                                {isMe && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200">
                                    <Star size={12} />
                                    Você
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  ROUTES.USERS.VIEW.replace(":id", user.id)
                                )
                              }
                              className="text-primary-600 hover:text-primary-800 transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            {!user.is_admin && (
                              <button
                                onClick={() => handleCreateSubscription(user)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Criar Assinatura"
                              >
                                <CreditCard size={18} />
                              </button>
                            )}
                            {!isMe && (
                              <button
                                onClick={() =>
                                  handleDeleteUser(
                                    user.id,
                                    `${user.first_name} ${user.last_name}`
                                  )
                                }
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">
                    {(pagination.current_page - 1) * pagination.page_size + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.current_page * pagination.page_size,
                      pagination.total_items
                    )}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium">{pagination.total_items}</span>{" "}
                  resultados
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadUsers(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <span className="text-sm text-gray-700">
                    Página {pagination.current_page} de {pagination.total_pages}
                  </span>

                  <button
                    onClick={() => loadUsers(pagination.current_page + 1)}
                    disabled={
                      pagination.current_page === pagination.total_pages
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Criar Assinatura */}
      {selectedUser && (
        <CreateSubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={handleSubscriptionCreated}
        />
      )}

      {/* Modal de Criar Usuário */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={handleUserCreated}
      />
    </PageContent>
  );
}
