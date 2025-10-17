import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  TrendingUp,
  PieChart,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  ArrowUpDown,
  Target,
  Users,
  Calendar,
  RefreshCw,
  Tag,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePlanner } from "../../contexts/PlannerContext";
import { ROUTES } from "../../config/constants";

export default function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const { user, logout } = useAuth();
  const { selectedPlanner } = usePlanner();
  const navigate = useNavigate();
  const location = useLocation();

  // Fecha sidebar ao mudar de rota (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      path: ROUTES.USER_DASHBOARD,
      icon: LayoutDashboard,
      label: "Visão Geral",
      color: "text-blue-500",
    },
    {
      path: "/app/transactions",
      icon: ArrowUpDown,
      label: "Transações",
      color: "text-green-500",
    },
    {
      path: "/app/categories",
      icon: Tag,
      label: "Categorias",
      color: "text-yellow-500",
    },
    {
      path: "/app/accounts",
      icon: Wallet,
      label: "Contas",
      color: "text-purple-500",
    },
    {
      path: "/app/cards",
      icon: CreditCard,
      label: "Cartões",
      color: "text-orange-500",
    },
    {
      path: "/app/budgets",
      icon: Target,
      label: "Orçamentos",
      color: "text-pink-500",
    },
    {
      path: "/app/planners",
      icon: Calendar,
      label: "Planejadores",
      color: "text-indigo-500",
    },
    {
      path: "/app/reports",
      icon: PieChart,
      label: "Relatórios",
      color: "text-cyan-500",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Desktop/Mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Logo e Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link
              to={ROUTES.USER_DASHBOARD}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <span className="hidden sm:block text-xl font-bold text-gray-800">
                FinPlanner
              </span>
            </Link>

            {/* Planner Selecionado */}
            {selectedPlanner && (
              <button
                onClick={() => navigate("/app/planners")}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors ml-4"
                title="Trocar de planner"
              >
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedPlanner.name}
                </span>
                <RefreshCw size={14} className="text-blue-600" />
              </button>
            )}
          </div>

          {/* Actions Desktop */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Planner Mobile */}
            {selectedPlanner && (
              <button
                onClick={() => navigate("/app/planners")}
                className="md:hidden p-2 hover:bg-blue-50 rounded-lg transition-colors"
                title={selectedPlanner.name}
              >
                <Calendar size={20} className="text-blue-600" />
              </button>
            )}

            {/* Notificações */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.user_type || "user"}
                </p>
              </div>
              <button
                onClick={() => navigate("/app/settings")}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all"
              >
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </button>
            </div>

            {/* Logout Mobile */}
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          {/* Planner Info */}
          {selectedPlanner && (
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => navigate("/app/planners")}
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">
                    Planner Ativo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {selectedPlanner.name}
                  </p>
                  <RefreshCw
                    size={14}
                    className="text-blue-600 group-hover:rotate-180 transition-transform duration-300"
                  />
                </div>
              </button>
            </div>
          )}

          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive(item.path) ? item.color : ""}
                />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Divider */}
            <div className="my-4 border-t border-gray-200"></div>

            {/* Settings e Logout */}
            <Link
              to="/app/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive("/app/settings")
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Settings size={20} />
              <span>Configurações</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </nav>
        </aside>

        {/* Sidebar Mobile (Overlay) */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white z-50 shadow-xl overflow-y-auto">
              {/* Planner Info Mobile */}
              {selectedPlanner && (
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => navigate("/app/planners")}
                    className="w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-blue-600" />
                      <span className="text-xs font-medium text-gray-600">
                        Planner Ativo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {selectedPlanner.name}
                      </p>
                      <RefreshCw
                        size={14}
                        className="text-blue-600 group-hover:rotate-180 transition-transform duration-300"
                      />
                    </div>
                  </button>
                </div>
              )}

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={isActive(item.path) ? item.color : ""}
                    />
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="my-4 border-t border-gray-200"></div>

                <Link
                  to="/app/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <Settings size={20} />
                  <span>Configurações</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut size={20} />
                  <span>Sair</span>
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] pb-20 lg:pb-0">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive(item.path) ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          ))}
          <Link
            to="/app/settings"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
              isActive("/app/settings") ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">Mais</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
