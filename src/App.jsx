import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PlannerProvider } from "./contexts/PlannerContext";
import { ROUTES } from "./config/constants";
import AuthGuard from "./components/auth/AuthGuard";
import AdminAuthGuard from "./components/auth/AdminAuthGuard";
import UserAuthGuard from "./components/auth/UserAuthGuard";
import PlannerGuard from "./components/auth/PlannerGuard";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AdminLayout from "./components/layout/AdminLayout";

// Public Pages
import HomePage from "./pages/HomePage";

// Auth Pages
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";
import Register from "./pages/auth/Register";

// Dashboard Pages
import DashboardPage from "./pages/dashboard/DashboardPage";

// User Dashboard Pages
import SelectPlannerPage from "./pages/user/SelectPlannerPage";
import UserDashboardPage from "./pages/user/UserDashboardPage";
import TransactionsPage from "./pages/user/TransactionsPage";
import ImportTransactionsPage from "./pages/user/ImportTransactionsPage";
import CategoriesPage from "./pages/user/CategoriesPage";
import AccountsPage from "./pages/user/AccountsPage";
import CardsPage from "./pages/user/CardsPage";
import BudgetsPage from "./pages/user/BudgetsPage";
import PlannersPage from "./pages/user/PlannersPage";
import UserSettingsPage from "./pages/user/UserSettingsPage";
import ComingSoonUser from "./pages/user/ComingSoonUser";

// Subscription Plans Pages
import SubscriptionPlansListPage from "./pages/subscription-plans/SubscriptionPlansListPage";
import CreateSubscriptionPlanPage from "./pages/subscription-plans/CreateSubscriptionPlanPage";
import EditSubscriptionPlanPage from "./pages/subscription-plans/EditSubscriptionPlanPage";

// Subscriptions Pages
import SubscriptionsListPage from "./pages/subscriptions/SubscriptionsListPage";
import SubscriptionViewPage from "./pages/subscriptions/SubscriptionViewPage";

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
      <PlannerProvider>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />

          <Route
            path={ROUTES.LOGIN}
            element={
              <AuthGuard requireAuth={false}>
                <Login />
              </AuthGuard>
            }
          />

          <Route
            path={ROUTES.REGISTER}
            element={
              <AuthGuard requireAuth={false}>
                <Register />
              </AuthGuard>
            }
          />

          <Route
            path={ROUTES.ADMIN_LOGIN}
            element={
              <AuthGuard requireAuth={false}>
                <AdminLogin />
              </AuthGuard>
            }
          />

          {/* User Dashboard - Protected Routes (apenas usuários comuns) */}

          {/* Seleção de Planner - SEMPRE primeiro após login */}
          <Route
            path="/app/select-planner"
            element={
              <ErrorBoundary>
                <UserAuthGuard>
                  <SelectPlannerPage />
                </UserAuthGuard>
              </ErrorBoundary>
            }
          />

          <Route
            path={ROUTES.USER_DASHBOARD}
            element={
              <ErrorBoundary>
                <UserAuthGuard>
                  <PlannerGuard>
                    <UserDashboardPage />
                  </PlannerGuard>
                </UserAuthGuard>
              </ErrorBoundary>
            }
          />
        <Route
          path="/app/transactions"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannerGuard>
                  <TransactionsPage />
                </PlannerGuard>
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/transactions/import"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannerGuard>
                  <ImportTransactionsPage />
                </PlannerGuard>
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/categories"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannerGuard>
                  <CategoriesPage />
                </PlannerGuard>
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/accounts"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannerGuard>
                  <AccountsPage />
                </PlannerGuard>
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/cards"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannerGuard>
                  <CardsPage />
                </PlannerGuard>
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/budgets"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannerGuard>
                  <BudgetsPage />
                </PlannerGuard>
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/planners"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannersPage />
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/reports"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <PlannerGuard>
                  <ComingSoonUser title="Relatórios" />
                </PlannerGuard>
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/app/settings"
          element={
            <ErrorBoundary>
              <UserAuthGuard>
                <UserSettingsPage />
              </UserAuthGuard>
            </ErrorBoundary>
          }
        />

        {/* Protected Routes - Admin - Todas usam o AdminLayout (apenas admins) */}
        <Route
          element={
            <ErrorBoundary>
              <AdminAuthGuard>
                <AdminLayout />
              </AdminAuthGuard>
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
              element={<SubscriptionViewPage />}
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
      </PlannerProvider>
    </AuthProvider>
  );
}

export default App;
