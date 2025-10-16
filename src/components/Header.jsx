import { Bell, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config/constants";

export default function Header({ pageTitle }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-primary-200/50 shadow-sm z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Título da página */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full shadow-sm"></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-secondary-900 to-secondary-700 bg-clip-text text-transparent">
            {pageTitle}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Bell size={20} />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate(ROUTES.SETTINGS)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
