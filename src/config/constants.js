// Configurações da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  TIMEOUT: 30000,
};

// Rotas da aplicação
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login", // Login de usuários comuns
  ADMIN_LOGIN: "/admin/login", // Login administrativo (escondido)
  REGISTER: "/cadastro",
  DASHBOARD: "/dashboard", // Dashboard administrativo
  USER_DASHBOARD: "/app", // Dashboard de usuários comuns

  // Subscription Plans (Admin)
  SUBSCRIPTION_PLANS: {
    LIST: "/admin/subscription-plans",
    CREATE: "/admin/subscription-plans/create",
    EDIT: "/admin/subscription-plans/:id/edit",
    VIEW: "/admin/subscription-plans/:id",
  },

  // User Subscriptions (Admin view)
  SUBSCRIPTIONS: {
    LIST: "/admin/subscriptions",
    VIEW: "/admin/subscriptions/:id",
  },

  // Users Management (Admin)
  USERS: {
    LIST: "/admin/users",
    CREATE: "/admin/users/create",
    EDIT: "/admin/users/:id/edit",
    VIEW: "/admin/users/:id",
  },

  // Payments (Admin)
  PAYMENTS: {
    LIST: "/admin/payments",
    VIEW: "/admin/payments/:id",
  },

  // Admins Management (Super Admin only)
  ADMINS: {
    LIST: "/admin/admins",
    CREATE: "/admin/admins/create",
    EDIT: "/admin/admins/:id/edit",
    VIEW: "/admin/admins/:id",
  },

  // Settings
  SETTINGS: "/admin/settings",

  // Profile
  PROFILE: "/admin/profile",
};

// Configurações de autenticação
export const AUTH_CONFIG = {
  TOKEN_KEY: "finplanner_access_token",
  REFRESH_TOKEN_KEY: "finplanner_refresh_token",
  USER_INFO_KEY: "finplanner_user_info",
};

// Configurações de UI
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  CHART_COLORS: {
    primary: "#F59E0B", // Dourado escuro
    secondary: "#FBBF24", // Dourado claro
    dark: "#1F2937", // Cinza escuro
    light: "#FEF3C7", // Creme/Amarelo claro
    success: "#10b981",
    danger: "#ef4444",
    info: "#3b82f6",
  },
};

// Status de assinatura
export const SUBSCRIPTION_STATUS = {
  PENDING: { label: "Pendente", color: "yellow" },
  ACTIVE: { label: "Ativa", color: "green" },
  EXPIRED: { label: "Expirada", color: "red" },
  CANCELLED: { label: "Cancelada", color: "gray" },
  SUSPENDED: { label: "Suspensa", color: "orange" },
};

// Métodos de pagamento
export const PAYMENT_METHODS = {
  CREDIT_CARD: { label: "Cartão de Crédito", icon: "CreditCard" },
  PIX: { label: "PIX", icon: "QrCode" },
  BOLETO: { label: "Boleto", icon: "FileText" },
};

// Intervalos de cobrança
export const BILLING_INTERVALS = [
  { value: 30, label: "Mensal (30 dias)" },
  { value: 90, label: "Trimestral (90 dias)" },
  { value: 180, label: "Semestral (180 dias)" },
  { value: 365, label: "Anual (365 dias)" },
];
