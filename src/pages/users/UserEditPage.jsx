import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, User, Mail, Shield, AlertCircle } from "lucide-react";
import PageContent from "../../components/layout/PageContent";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROUTES } from "../../config/constants";
import usersAPI from "../../services/api/users";
import Swal from "sweetalert2";

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await usersAPI.getById(id);
      const user = response.data;

      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar dados do usuário",
      });
      navigate(ROUTES.USERS.LIST);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await usersAPI.update(id, formData);

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Usuário atualizado com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(ROUTES.USERS.VIEW.replace(":id", id));
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao atualizar usuário",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando usuário..." />;
  }

  return (
    <PageContent>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.USERS.VIEW.replace(":id", id))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Editar Usuário
              </h3>
              <p className="text-sm text-gray-600">
                Atualize as informações do usuário
              </p>
            </div>
          </div>

          {/* Alerta informativo */}
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">
                  Informações importantes
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• O email é usado para login e não pode ser alterado aqui</li>
                  <li>• Para alterar a senha, use a opção "Configurações" no perfil do usuário</li>
                  <li>• Apenas nome e sobrenome podem ser editados</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (somente leitura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                O email não pode ser alterado
              </p>
            </div>

            {/* Nome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primeiro Nome *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(ROUTES.USERS.VIEW.replace(":id", id))}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContent>
  );
}

