import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ROUTES } from "./config/constants";
import AuthGuard from "./components/auth/AuthGuard";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AdminLayout from "./components/layout/AdminLayout";

// Auth Pages
import Login from "./pages/auth/Login";

// Dashboard Pages
import DashboardPage from "./pages/dashboard/DashboardPage";

// Subscription Plans Pages
import SubscriptionPlansListPage from "./pages/subscription-plans/SubscriptionPlansListPage";
import CreateSubscriptionPlanPage from "./pages/subscription-plans/CreateSubscriptionPlanPage";
import EditSubscriptionPlanPage from "./pages/subscription-plans/EditSubscriptionPlanPage";

// Subscriptions Pages
import SubscriptionsListPage from "./pages/subscriptions/SubscriptionsListPage";

// Users Pages
import UsersListPage from "./pages/users/UsersListPage";
import UserViewPage from "./pages/users/UserViewPage";
import UserEditPage from "./pages/users/UserEditPage";

// Payments Pages
import PaymentsListPage from "./pages/payments/PaymentsListPage";

// Admins Pages
import AdminsListPage from "./pages/admins/AdminsListPage";
import CreateAdminPage from "./pages/admins/CreateAdminPage";

// Settings Pages
import SettingsPage from "./pages/settings/SettingsPage";

// Utility Pages
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login - Public Route */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <AuthGuard requireAuth={false}>
              <Login />
            </AuthGuard>
          }
        />

        {/* Protected Routes - Todas usam o AdminLayout */}
        <Route
          element={
            <ErrorBoundary>
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            </ErrorBoundary>
          }
        >
          {/* Dashboard */}
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

          {/* Subscription Plans */}
          <Route
            path={ROUTES.SUBSCRIPTION_PLANS.LIST}
            element={<SubscriptionPlansListPage />}
          />
          <Route
            path={ROUTES.SUBSCRIPTION_PLANS.CREATE}
            element={<CreateSubscriptionPlanPage />}
          />
          <Route
            path={ROUTES.SUBSCRIPTION_PLANS.EDIT}
            element={<EditSubscriptionPlanPage />}
          />
          <Route
            path={ROUTES.SUBSCRIPTION_PLANS.VIEW}
            element={<ComingSoon title="Visualizar Plano de Assinatura" />}
          />

          {/* Subscriptions */}
          <Route
            path={ROUTES.SUBSCRIPTIONS.LIST}
            element={<SubscriptionsListPage />}
          />
          <Route
            path={ROUTES.SUBSCRIPTIONS.VIEW}
            element={<ComingSoon title="Detalhes da Assinatura" />}
          />

          {/* Users */}
          <Route path={ROUTES.USERS.LIST} element={<UsersListPage />} />
          <Route
            path={ROUTES.USERS.CREATE}
            element={<ComingSoon title="Criar Usuário" />}
          />
          <Route path={ROUTES.USERS.EDIT} element={<UserEditPage />} />
          <Route path={ROUTES.USERS.VIEW} element={<UserViewPage />} />

          {/* Payments */}
          <Route path={ROUTES.PAYMENTS.LIST} element={<PaymentsListPage />} />
          <Route
            path={ROUTES.PAYMENTS.VIEW}
            element={<ComingSoon title="Detalhes do Pagamento" />}
          />

          {/* Admins */}
          <Route path={ROUTES.ADMINS.LIST} element={<AdminsListPage />} />
          <Route path={ROUTES.ADMINS.CREATE} element={<CreateAdminPage />} />
          <Route
            path={ROUTES.ADMINS.EDIT}
            element={<ComingSoon title="Editar Administrador" />}
          />
          <Route
            path={ROUTES.ADMINS.VIEW}
            element={<ComingSoon title="Visualizar Administrador" />}
          />

          {/* Settings */}
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

          {/* Profile */}
          <Route
            path={ROUTES.PROFILE}
            element={<ComingSoon title="Meu Perfil" />}
          />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
