import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Shield, Crown, AlertCircle } from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import { ROUTES } from "../../config/constants";
import adminsAPI from "../../services/api/admins";
import Swal from "sweetalert2";

export default function CreateAdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    role: "admin",
    is_super_admin: false,
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        user_id: parseInt(formData.user_id),
        role: formData.role,
        is_super_admin: formData.is_super_admin,
        is_active: formData.is_active,
      };

      await adminsAPI.create(dataToSend);

      Swal.fire({
        icon: "success",
        title: "Administrador criado!",
        text: "Novo administrador criado com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(ROUTES.ADMINS.LIST);
    } catch (error) {
      console.error("Erro ao criar administrador:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao criar administrador",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContent title="Novo Administrador">
      <div className="max-w-3xl mx-auto">
        {/* Botão voltar */}
        <button
          onClick={() => navigate(ROUTES.ADMINS.LIST)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar para lista
        </button>

        {/* Card do formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Importante</p>
              <p>
                Informe o ID de um usuário existente para promovê-lo a
                administrador. O usuário terá acesso ao painel administrativo.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações básicas */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Informações do Administrador
              </h3>

              <div className="space-y-4">
                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Usuário *
                  </label>
                  <input
                    type="number"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ex: 5"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ID do usuário que será promovido a administrador
                  </p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Papel (Role) *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderador</option>
                    <option value="support">Suporte</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Define o nível de acesso do administrador
                  </p>
                </div>

                {/* Super Admin */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="is_super_admin"
                    name="is_super_admin"
                    checked={formData.is_super_admin}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_super_admin" className="flex-1">
                    <div className="flex items-center gap-2 font-medium text-gray-800">
                      <Crown className="w-4 h-4 text-amber-600" />
                      Super Administrador
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Super Admins têm acesso total ao sistema, incluindo
                      gerenciar outros administradores
                    </p>
                  </label>
                </div>

                {/* Ativo */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-gray-700"
                  >
                    Administrador ativo (pode acessar o sistema)
                  </label>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(ROUTES.ADMINS.LIST)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-bold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? "Criando..." : "Criar Administrador"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContent>
  );
}
