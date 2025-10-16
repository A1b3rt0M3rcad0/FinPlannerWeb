import { Outlet } from "react-router-dom";
import SideBar from "../SideBar";
import Header from "../Header";
import Footer from "../Footer";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Sidebar - Fixa */}
      <SideBar />

      {/* Main area: header + content + footer */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - Fixo */}
        <Header user={user} />

        {/* Conteúdo principal: scrollable - APENAS ESTA PARTE MUDA */}
        <main className="flex-1 overflow-auto p-6 bg-transparent">
          <div className="max-w-7xl mx-auto">
            {/* Outlet renderiza a rota filha atual */}
            <Outlet />
          </div>
        </main>

        {/* Footer - Fixo */}
        <Footer />
      </div>
    </div>
  );
}

