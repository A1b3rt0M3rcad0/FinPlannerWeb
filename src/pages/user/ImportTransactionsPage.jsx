import { useState, useCallback } from "react";
import UserLayout from "../../components/layout/UserLayout";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Tag,
  ArrowLeft,
  Save,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ImportTransactionsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: upload, 2: review, 3: map categories
  const [file, setFile] = useState(null);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Mock categories - TODO: buscar do backend
  const [availableCategories] = useState([
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Salário",
    "Investimentos",
    "Outros",
  ]);

  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    const validExtensions = [".csv", ".ofx", ".ofc"];
    const fileExtension = uploadedFile.name.substring(
      uploadedFile.name.lastIndexOf(".")
    ).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: "error",
        title: "Formato inválido",
        text: "Apenas arquivos CSV, OFX ou OFC são aceitos",
      });
      return;
    }

    setFile(uploadedFile);
    parseFile(uploadedFile);
  }, []);

  const parseFile = async (file) => {
    try {
      const text = await file.text();
      
      // Parse CSV
      if (file.name.endsWith(".csv")) {
        parseCSV(text);
      } else if (file.name.endsWith(".ofx") || file.name.endsWith(".ofc")) {
        parseOFX(text);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao ler arquivo",
        text: error.message,
      });
    }
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(/[,;]/);
    
    // Detecta colunas automaticamente
    const dateIdx = headers.findIndex((h) =>
      /data|date/i.test(h.trim())
    );
    const descriptionIdx = headers.findIndex((h) =>
      /descri[cç][aã]o|description|hist[oó]rico/i.test(h.trim())
    );
    const amountIdx = headers.findIndex((h) =>
      /valor|amount|value/i.test(h.trim())
    );

    const transactions = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[,;]/);
      
      if (values.length < 3) continue;

      const amount = parseFloat(
        values[amountIdx]?.replace(/[^\d.,-]/g, "").replace(",", ".")
      );
      
      if (isNaN(amount)) continue;

      transactions.push({
        id: i,
        date: values[dateIdx]?.trim() || "",
        description: values[descriptionIdx]?.trim() || "",
        amount: Math.abs(amount),
        type: amount < 0 ? "expense" : "income",
        category: "", // Usuário vai mapear
        original_amount: amount,
      });
    }

    setParsedTransactions(transactions);
    setStep(2);

    Swal.fire({
      icon: "success",
      title: "Arquivo Importado!",
      text: `${transactions.length} transações encontradas`,
      timer: 2000,
    });
  };

  const parseOFX = (text) => {
    // Simplified OFX parsing
    const transactions = [];
    const transactionPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    let match;
    let id = 1;

    while ((match = transactionPattern.exec(text)) !== null) {
      const txData = match[1];
      
      const dateMatch = /<DTPOSTED>(\d{8})/i.exec(txData);
      const amountMatch = /<TRNAMT>([-\d.]+)/i.exec(txData);
      const descMatch = /<MEMO>(.*?)</i.exec(txData);

      if (dateMatch && amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        const dateStr = dateMatch[1];
        const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(
          4,
          6
        )}-${dateStr.substring(6, 8)}`;

        transactions.push({
          id: id++,
          date: formattedDate,
          description: descMatch ? descMatch[1].trim() : "Sem descrição",
          amount: Math.abs(amount),
          type: amount < 0 ? "expense" : "income",
          category: "",
          original_amount: amount,
        });
      }
    }

    if (transactions.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Nenhuma transação encontrada",
        text: "Verifique se o arquivo está no formato correto",
      });
      return;
    }

    setParsedTransactions(transactions);
    setStep(2);

    Swal.fire({
      icon: "success",
      title: "Arquivo Importado!",
      text: `${transactions.length} transações encontradas`,
      timer: 2000,
    });
  };

  const handleCategoryChange = (transactionId, category) => {
    setParsedTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId ? { ...t, category } : t
      )
    );
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) return;

    // TODO: Integrar com API POST /categories
    setCategories((prev) => [...prev, newCategoryName.trim()]);
    
    Swal.fire({
      icon: "success",
      title: "Categoria Criada!",
      text: newCategoryName,
      timer: 1500,
    });

    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  const handleImportTransactions = async () => {
    const uncategorized = parsedTransactions.filter((t) => !t.category);

    if (uncategorized.length > 0) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Transações sem categoria",
        text: `${uncategorized.length} transações não têm categoria. Deseja continuar?`,
        showCancelButton: true,
        confirmButtonText: "Sim, importar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;
    }

    try {
      // TODO: Integrar com API POST /transactions/import
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Swal.fire({
        icon: "success",
        title: "Importação Concluída!",
        text: `${parsedTransactions.length} transações importadas com sucesso`,
        timer: 2000,
      });

      navigate("/app/transactions");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro na Importação",
        text: error.message,
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return dateString;
    }
  };

  const getTransactionIcon = (type) => {
    return type === "income" ? (
      <ArrowUpRight size={16} className="text-green-600" />
    ) : (
      <ArrowDownLeft size={16} className="text-red-600" />
    );
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/app/transactions")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Importar Transações
            </h1>
            <p className="text-gray-600 mt-1">
              Importe transações em massa via CSV, OFX ou OFC
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Upload" },
              { num: 2, label: "Revisar" },
              { num: 3, label: "Categorizar" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > s.num ? <CheckCircle size={20} /> : s.num}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      step >= s.num ? "text-blue-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${
                      step > s.num ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mb-6">
                <Upload size={40} className="text-blue-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Faça Upload do Arquivo
              </h3>
              <p className="text-gray-600 mb-6">
                Formatos aceitos: CSV, OFX, OFC
              </p>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.ofx,.ofc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all inline-flex items-center gap-2">
                  <FileText size={20} />
                  Selecionar Arquivo
                </div>
              </label>

              {/* Template Download */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Não tem um arquivo? Baixe nosso modelo CSV:
                </p>
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mx-auto">
                  <Download size={16} />
                  Baixar Modelo CSV
                </button>
              </div>

              {/* Format Info */}
              <div className="mt-8 text-left bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Formato esperado do CSV:
                </p>
                <code className="text-xs text-gray-600 block">
                  Data,Descrição,Valor
                  <br />
                  2025-10-15,Supermercado,-234.50
                  <br />
                  2025-10-14,Salário,5000.00
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {parsedTransactions.length} Transações Encontradas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Arquivo: {file?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStep(1);
                      setFile(null);
                      setParsedTransactions([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Continuar
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Descrição
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedTransactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          {transaction.description}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              transaction.type === "income"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {getTransactionIcon(transaction.type)}
                            {transaction.type === "income" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-bold text-right ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedTransactions.length > 10 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Mostrando 10 de {parsedTransactions.length} transações
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Categorize */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Mapeamento de Categorias
                  </h3>
                  <p className="text-sm text-gray-600">
                    Selecione uma categoria para cada transação
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Nova Categoria
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleImportTransactions}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <Save size={20} />
                    Importar Todas
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {parsedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === "income"
                            ? "bg-green-50"
                            : "bg-red-50"
                        }`}
                      >
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(transaction.date)} •{" "}
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-green-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:w-64">
                      <Tag size={16} className="text-gray-400" />
                      <select
                        value={transaction.category}
                        onChange={(e) =>
                          handleCategoryChange(transaction.id, e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
                          transaction.category
                            ? "border-green-300 bg-green-50 text-green-800 font-medium"
                            : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                        }`}
                      >
                        <option value="">Selecione...</option>
                        {[...availableCategories, ...categories].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-xl font-bold text-gray-800">
                    {parsedTransactions.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Receitas</p>
                  <p className="text-xl font-bold text-green-600">
                    {parsedTransactions.filter((t) => t.type === "income").length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Despesas</p>
                  <p className="text-xl font-bold text-red-600">
                    {parsedTransactions.filter((t) => t.type === "expense").length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Sem Categoria</p>
                  <p className="text-xl font-bold text-orange-600">
                    {parsedTransactions.filter((t) => !t.category).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Nova Categoria</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Farmácia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}

