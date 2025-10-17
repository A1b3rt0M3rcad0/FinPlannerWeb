import UserLayout from "../../components/layout/UserLayout";
import { Construction } from "lucide-react";

export default function ComingSoonUser({ title = "Em Breve" }) {
  return (
    <UserLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Construction size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-gray-600 max-w-md">
            Esta funcionalidade está em desenvolvimento e estará disponível em
            breve.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}
