import { useNavigate } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import PageContent from "../components/layout/PageContent";

export default function ComingSoon({ title = "Página em Desenvolvimento" }) {
  const navigate = useNavigate();

  return (
    <PageContent title={title}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl shadow-xl mb-6">
            <Construction className="w-12 h-12 text-primary-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>

          <p className="text-gray-600 mb-6">
            Esta funcionalidade está sendo desenvolvida e estará disponível em
            breve.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>
      </div>
    </PageContent>
  );
}
