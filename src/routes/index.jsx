import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../config/constants";
import AuthGuard from "../components/auth/AuthGuard";
import ErrorBoundary from "../components/ui/ErrorBoundary";

// Auth Pages
import Login from "../pages/auth/Login";

// Dashboard Pages
import DashboardPage from "../pages/dashboard/DashboardPage";

// Subscription Plans Pages
import SubscriptionPlansListPage from "../pages/subscription-plans/SubscriptionPlansListPage";
import CreateSubscriptionPlanPage from "../pages/subscription-plans/CreateSubscriptionPlanPage";

const router = createBrowserRouter([
  // Login
  {
    path: ROUTES.LOGIN,
    element: (
      <AuthGuard requireAuth={false}>
        <Login />
      </AuthGuard>
    ),
  },

  // Dashboard
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ErrorBoundary>
        <AuthGuard>
          <DashboardPage />
        </AuthGuard>
      </ErrorBoundary>
    ),
  },

  // Subscription Plans Routes
  {
    path: ROUTES.SUBSCRIPTION_PLANS.LIST,
    element: (
      <ErrorBoundary>
        <AuthGuard>
          <SubscriptionPlansListPage />
        </AuthGuard>
      </ErrorBoundary>
    ),
  },
  {
    path: ROUTES.SUBSCRIPTION_PLANS.CREATE,
    element: (
      <ErrorBoundary>
        <AuthGuard>
          <CreateSubscriptionPlanPage />
        </AuthGuard>
      </ErrorBoundary>
    ),
  },
]);

export default router;
