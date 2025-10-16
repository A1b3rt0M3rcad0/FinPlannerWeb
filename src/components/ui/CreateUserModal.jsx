import { useState } from "react";
import { X, User, Mail, Lock, Save } from "lucide-react";
import usersAPI from "../../services/api/users";
import Swal from "sweetalert2";

export default function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação de primeiro nome
    if (!formData.first_name || formData.first_name.trim().length === 0) {
      newErrors.first_name = "Primeiro nome é obrigatório";
    } else if (formData.first_name.length > 255) {
      newErrors.first_name = "Primeiro nome muito longo (máx. 255 caracteres)";
    }

    // Validação de sobrenome
    if (!formData.last_name || formData.last_name.trim().length === 0) {
      newErrors.last_name = "Sobrenome é obrigatório";
    } else if (formData.last_name.length > 255) {
      newErrors.last_name = "Sobrenome muito longo (máx. 255 caracteres)";
    }

    // Validação de email
    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    } else if (formData.email.length > 255) {
      newErrors.email = "Email muito longo (máx. 255 caracteres)";
    }

    // Validação de senha
    if (!formData.password || formData.password.length === 0) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    } else if (formData.password.length > 255) {
      newErrors.password = "Senha muito longa (máx. 255 caracteres)";
    }

    // Validação de confirmação de senha
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Remove confirm_password antes de enviar
      const { confirm_password, ...userData } = formData;

      await usersAPI.create(userData);

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Usuário criado com sucesso",
        timer: 2000,
        showConfirmButton: false,
      });

      // Limpa o formulário
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
      });
      setErrors({});

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || "Erro ao criar usuário",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Criar Novo Usuário
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Preencha os dados do novo usuário
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Primeiro Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Primeiro Nome *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              maxLength={255}
              className={`w-full px-4 py-3 border ${
                errors.first_name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
              placeholder="João"
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>

          {/* Sobrenome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Sobrenome *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              maxLength={255}
              className={`w-full px-4 py-3 border ${
                errors.last_name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
              placeholder="Silva"
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={255}
              className={`w-full px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
              placeholder="joao.silva@exemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Lock size={16} />
              Senha *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              maxLength={255}
              className={`w-full px-4 py-3 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Lock size={16} />
              Confirmar Senha *
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              maxLength={255}
              className={`w-full px-4 py-3 border ${
                errors.confirm_password ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
              placeholder="Repita a senha"
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Nota:</strong> O usuário será criado com role padrão
              "user". Para atribuir um plano de assinatura, use o botão de criar
              assinatura após a criação.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? "Criando..." : "Criar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
