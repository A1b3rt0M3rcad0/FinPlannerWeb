import { useState, useEffect } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  Plus,
  Tag,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  Palette,
} from "lucide-react";
import Swal from "sweetalert2";
import categoriesAPI from "../../services/api/categories";
import { usePlanner } from "../../contexts/PlannerContext";

export default function CategoriesPage() {
  const { selectedPlanner } = usePlanner();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "expense", // income, expense, both
    color: "#3B82F6",
    icon: "tag",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (!selectedPlanner) {
      console.warn("Nenhum planner selecionado");
      return;
    }

    setLoading(true);
    try {
      const response = await categoriesAPI.getAll(selectedPlanner.id);
      const categoriesData = response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar categorias",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        type: "expense",
        color: "#3B82F6",
        icon: "tag",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlanner) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Nenhum planner selecionado",
      });
      return;
    }

    try {
      const categoryData = {
        ...formData,
        planner_id: selectedPlanner.id,
      };

      if (editingCategory) {
        const response = await categoriesAPI.update(
          editingCategory.id,
          categoryData
        );
        const updatedCategory = response.data;

        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updatedCategory : c))
        );

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Categoria atualizada",
          timer: 2000,
        });
      } else {
        const response = await categoriesAPI.create(categoryData);
        const newCategory = response.data;

        setCategories((prev) => [...prev, newCategory]);

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Categoria criada",
          timer: 2000,
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.error || error.message,
      });
    }
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      Swal.fire({
        icon: "warning",
        title: "Categoria Padrão",
        text: "Categorias padrão não podem ser excluídas",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirmar exclusão?",
      text: "As transações desta categoria ficarão sem categoria",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await categoriesAPI.delete(id);

        setCategories((prev) => prev.filter((c) => c.id !== id));

        Swal.fire({
          icon: "success",
          title: "Excluído!",
          text: "Categoria excluída com sucesso",
          timer: 2000,
        });
      } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: error.response?.data?.error || error.message,
        });
      }
    }
  };

  const colorOptions = [
    { value: "#3B82F6", label: "Azul" },
    { value: "#8B5CF6", label: "Roxo" },
    { value: "#10B981", label: "Verde" },
    { value: "#F59E0B", label: "Laranja" },
    { value: "#EF4444", label: "Vermelho" },
    { value: "#EC4899", label: "Rosa" },
    { value: "#06B6D4", label: "Ciano" },
    { value: "#6366F1", label: "Índigo" },
  ];

  const incomeCategories = categories.filter(
    (c) => c.type === "income" || c.type === "both"
  );
  const expenseCategories = categories.filter(
    (c) => c.type === "expense" || c.type === "both"
  );

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Categorias
            </h1>
            <p className="text-gray-600 mt-1">
              Organize suas transações por categoria
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Nova Categoria
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Total de Categorias
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {categories.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Categorias de Receita
            </p>
            <p className="text-2xl font-bold text-green-600">
              {incomeCategories.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">
              Categorias de Despesa
            </p>
            <p className="text-2xl font-bold text-red-600">
              {expenseCategories.length}
            </p>
          </div>
        </div>

        {/* Categories Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingDown size={20} className="text-red-600" />
              Categorias de Despesa
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Tag size={20} style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {category.transaction_count} transações
                          {category.is_default && " • Padrão"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!category.is_default && (
                        <>
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(category.id, category.is_default)
                            }
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Income Categories */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              Categorias de Receita
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Tag size={20} style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {category.transaction_count} transações
                          {category.is_default && " • Padrão"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!category.is_default && (
                        <>
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(category.id, category.is_default)
                            }
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Farmácia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: "expense" }))
                    }
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      formData.type === "expense"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: "income" }))
                    }
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      formData.type === "income"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: "both" }))
                    }
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      formData.type === "both"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Ambos
                  </button>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color: color.value }))
                      }
                      className={`h-12 rounded-lg transition-all ${
                        formData.color === color.value
                          ? "ring-4 ring-offset-2 ring-blue-500 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${formData.color}20` }}
                  >
                    <Tag size={20} style={{ color: formData.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {formData.name || "Nome da categoria"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.type === "income"
                        ? "Receita"
                        : formData.type === "expense"
                        ? "Despesa"
                        : "Receita e Despesa"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingCategory ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
