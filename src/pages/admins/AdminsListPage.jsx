import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Crown,
} from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";
import adminsAPI from "../../services/api/admins";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import Swal from "sweetalert2";

export default function AdminsListPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadAdmins = useCallback(async () => {
    try {
      const response = await adminsAPI.getAllNoPagination();
      setAdmins(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar administradores:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar administradores",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const { confirmDelete } = useConfirmAction(loadAdmins);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleDelete = (id, name) => {
    confirmDelete({
      action: () => adminsAPI.delete(id),
      itemName: name,
      itemType: "o administrador",
      successMessage: "Administrador removido com sucesso",
      errorMessage: "Erro ao remover administrador.",
    });
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: "Admin", color: "blue" },
      moderator: { label: "Moderador", color: "purple" },
      support: { label: "Suporte", color: "green" },
      super_admin: { label: "Super Admin", color: "red" },
    };

    const config = roles[role] || roles.admin;
    const colorClasses = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      green: "bg-green-100 text-green-700 border-green-200",
      red: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          colorClasses[config.color]
        }`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Carregando administradores..." />;
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Gerenciar Administradores
            </h2>
            <p className="text-gray-600">
              {admins.length} administrador(es) cadastrado(s)
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMINS.CREATE)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30"
          >
            <Plus size={20} />
            Novo Administrador
          </button>
        </div>

        {/* Lista de administradores */}
        {admins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
              >
                {/* Header do card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-sm">
                      {admin.is_super_admin ? (
                        <Crown className="w-6 h-6 text-primary-600" />
                      ) : (
                        <Shield className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {admin.first_name} {admin.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                  {admin.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Role */}
                <div className="mb-4">
                  {getRoleBadge(admin.role)}
                  {admin.is_super_admin && (
                    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                      <Crown className="w-3 h-3 inline mr-1" />
                      Super Admin
                    </span>
                  )}
                </div>

                {/* Info adicional */}
                <div className="mb-4 text-sm text-gray-600 space-y-1">
                  <p>• ID: #{admin.id}</p>
                  <p>• Status: {admin.is_active ? "Ativo" : "Inativo"}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate(ROUTES.ADMINS.VIEW.replace(":id", admin.id))
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    onClick={() =>
                      navigate(ROUTES.ADMINS.EDIT.replace(":id", admin.id))
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(
                        admin.id,
                        `${admin.first_name} ${admin.last_name}`
                      )
                    }
                    className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    disabled={admin.is_super_admin}
                    title={
                      admin.is_super_admin
                        ? "Super Admin não pode ser removido"
                        : "Remover administrador"
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Nenhum administrador cadastrado
            </p>
            <button
              onClick={() => navigate(ROUTES.ADMINS.CREATE)}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
            >
              Criar Primeiro Administrador
            </button>
          </div>
        )}
      </div>
    </PageContent>
  );
}
