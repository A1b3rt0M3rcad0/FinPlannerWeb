import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import authAPI from "../../services/api/auth";
import Swal from "sweetalert2";
import { ROUTES } from "../../config/constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.data?.access_token) {
        // Extrai informações do usuário da resposta
        const userInfo = {
          id: response.data.user.id,
          email: response.data.user.email,
          first_name: response.data.user.first_name || email.split("@")[0],
          last_name: response.data.user.last_name || "",
          user_type: response.data.user.user_type || "user",
        };

        // Salva tokens e informações do usuário
        login(
          response.data.access_token,
          response.data.refresh_token,
          userInfo
        );

        Swal.fire({
          icon: "success",
          title: "Bem-vindo!",
          text: `Olá, ${userInfo.first_name}!`,
          timer: 2000,
          showConfirmButton: false,
        });

        // Redireciona para seleção de planner primeiro
        navigate("/app/select-planner");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.response?.data?.error || "Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-500/50 mb-4 hover:scale-105 transition-transform">
              <Wallet className="w-12 h-12 text-secondary-900" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">FinPlanner</h1>
          <p className="text-primary-300">Controle Financeiro Pessoal</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Acesse sua conta
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Link para Cadastro */}
            <div className="text-center text-sm">
              <p className="text-gray-600">
                Não tem uma conta?{" "}
                <Link
                  to={ROUTES.REGISTER}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Criar conta grátis
                </Link>
              </p>
            </div>

            {/* Botão de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-bold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Link para voltar */}
        <div className="text-center mt-6">
          <Link
            to={ROUTES.HOME}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Voltar para home
          </Link>
        </div>
      </div>
    </div>
  );
}
