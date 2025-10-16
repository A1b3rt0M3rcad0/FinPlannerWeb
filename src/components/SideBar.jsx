import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  Shield,
} from "lucide-react";
import SideBarItem from "./SideBarItem";
import { ROUTES } from "../config/constants";
import { useAuth } from "../hooks/useAuth";

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      route: ROUTES.DASHBOARD,
    },
    {
      icon: Wallet,
      label: "Planos",
      route: ROUTES.SUBSCRIPTION_PLANS.LIST,
    },
    {
      icon: CreditCard,
      label: "Assinaturas",
      route: ROUTES.SUBSCRIPTIONS.LIST,
    },
    {
      icon: Users,
      label: "Usuários",
      route: ROUTES.USERS.LIST,
    },
    {
      icon: Shield,
      label: "Administradores",
      route: ROUTES.ADMINS.LIST,
    },
    {
      icon: Receipt,
      label: "Pagamentos",
      route: ROUTES.PAYMENTS.LIST,
    },
    {
      icon: Settings,
      label: "Configurações",
      route: ROUTES.SETTINGS,
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gradient-to-b from-secondary-900 via-secondary-800 to-secondary-900
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
          border-r border-primary-500/20
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Wallet className="w-6 h-6 text-secondary-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">FinPlanner</h2>
              <p className="text-xs text-primary-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="p-4 border-b border-primary-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-secondary-900 font-bold">
                  {user.first_name?.[0] || user.email?.[0] || "A"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {user.first_name || user.email}
                </p>
                <p className="text-xs text-primary-400">Administrador</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <SideBarItem
              key={item.route}
              icon={item.icon}
              label={item.label}
              route={item.route}
              isActive={location.pathname === item.route}
              onClick={() => {
                navigate(item.route);
                setIsOpen(false);
              }}
            />
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-primary-500/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
