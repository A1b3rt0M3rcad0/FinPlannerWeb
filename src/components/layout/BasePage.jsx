import SideBar from "../SideBar";
import Header from "../Header";
import Footer from "../Footer";

export default function BasePage({ pageTitle, children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <SideBar />

      {/* Main area: header + content + footer */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header pageTitle={pageTitle} />

        {/* Conteúdo principal: scrollable */}
        <main className="flex-1 overflow-auto p-6 bg-transparent">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
