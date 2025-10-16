import { useState } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpa erro do campo ao digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = "Senha atual é obrigatória";
    }

    if (!formData.new_password) {
      newErrors.new_password = "Nova senha é obrigatória";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "A senha deve ter no mínimo 8 caracteres";
    } else if (!/(?=.*[a-z])/.test(formData.new_password)) {
      newErrors.new_password = "A senha deve conter pelo menos uma letra minúscula";
    } else if (!/(?=.*[A-Z])/.test(formData.new_password)) {
      newErrors.new_password = "A senha deve conter pelo menos uma letra maiúscula";
    } else if (!/(?=.*\d)/.test(formData.new_password)) {
      newErrors.new_password = "A senha deve conter pelo menos um número";
    } else if (!/(?=.*[@$!%*?&#])/.test(formData.new_password)) {
      newErrors.new_password = "A senha deve conter pelo menos um caractere especial (@$!%*?&#)";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Confirmação de senha é obrigatória";
    } else if (formData.new_password !== formData.confirm_password) {
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

    await onSubmit({
      current_password: formData.current_password,
      new_password: formData.new_password,
    });

    // Limpa formulário após sucesso
    setFormData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Alterar Senha</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Senha Atual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border ${
                  errors.current_password
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.current_password}
              </p>
            )}
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border ${
                  errors.new_password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
                placeholder="Digite a nova senha"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-xs text-red-500 mt-1">{errors.new_password}</p>
            )}
            {!errors.new_password && formData.new_password && (
              <p className="text-xs text-gray-500 mt-1">
                ✓ Mínimo 8 caracteres, maiúscula, minúscula, número e
                caractere especial
              </p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border ${
                  errors.confirm_password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
            >
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

