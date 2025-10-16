import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  CreditCard,
  Target,
  CheckCircle,
  Zap,
  Lock,
  Globe,
  Calendar,
} from "lucide-react";
import subscriptionPlansAPI from "../services/api/subscriptionPlans";

export default function HomePage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await subscriptionPlansAPI.getAllGrouped();
      // Pega os planos agrupados
      const groupedPlans = response.data || {};

      // Converte para array de grupos com suas variações
      const planGroups = Object.entries(groupedPlans).map(
        ([baseName, variations]) => ({
          baseName,
          variations: variations.sort(
            (a, b) => a.billing_cycle_days - b.billing_cycle_days
          ),
        })
      );

      setPlans(planGroups);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      // Em caso de erro, continua sem planos
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Wallet,
      title: "Gestão Financeira Completa",
      description:
        "Controle suas receitas, despesas e investimentos em um só lugar.",
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description:
        "Visualize gráficos e análises para tomar decisões mais inteligentes.",
    },
    {
      icon: Target,
      title: "Metas e Objetivos",
      description:
        "Defina e acompanhe suas metas financeiras de forma simples e eficaz.",
    },
    {
      icon: CreditCard,
      title: "Controle de Cartões",
      description:
        "Gerencie seus cartões de crédito e acompanhe faturas automaticamente.",
    },
    {
      icon: TrendingUp,
      title: "Planejamento Inteligente",
      description:
        "Crie orçamentos e planeje seu futuro financeiro com facilidade.",
    },
    {
      icon: Users,
      title: "Compartilhamento",
      description:
        "Compartilhe o planejamento financeiro com família ou equipe.",
    },
  ];

  const getBillingLabel = (days) => {
    if (days === 30) return "Mensal";
    if (days === 180) return "Semestral";
    if (days === 365) return "Anual";
    return `${days} dias`;
  };

  const getPlanFeatures = (plan) => {
    const features = [];

    if (plan.max_users) features.push(`Até ${plan.max_users} usuários`);
    if (plan.max_transactions_per_month) {
      features.push(`${plan.max_transactions_per_month} transações/mês`);
    }
    if (plan.max_bank_accounts) {
      features.push(`${plan.max_bank_accounts} contas bancárias`);
    }
    if (plan.max_credit_cards) {
      features.push(`${plan.max_credit_cards} cartões de crédito`);
    }
    if (plan.max_budgets) features.push(`${plan.max_budgets} orçamentos`);
    if (plan.max_planners) features.push(`${plan.max_planners} planejadores`);

    return features.length > 0 ? features : ["Recursos inclusos"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      {/* Header/Navbar */}
      <nav className="bg-secondary-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-secondary-900" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                FinPlanner
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 text-white hover:text-primary-400 transition-colors font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 font-semibold"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-primary-400 text-sm font-medium">
                Planejamento Financeiro Inteligente
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Controle suas finanças com
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {" "}
                simplicidade
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Gerencie suas receitas, despesas e investimentos de forma
              inteligente. Alcance seus objetivos financeiros com o FinPlanner.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/cadastro")}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 font-bold text-lg flex items-center justify-center gap-2"
              >
                Começar Agora
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 font-semibold text-lg"
              >
                Já tenho conta
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Teste grátis 14 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Tudo que você precisa para organizar suas finanças
            </h2>
            <p className="text-xl text-gray-300">
              Ferramentas poderosas para você tomar o controle do seu dinheiro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-secondary-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="w-6 h-6 text-secondary-900" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Planos para todos os perfis
            </h2>
            <p className="text-xl text-gray-300">
              Escolha o ciclo de pagamento ideal para você
            </p>
          </div>

          {loading ? (
            <div className="text-center text-white">
              <p>Carregando planos...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>Nenhum plano disponível no momento.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {plans.map((planGroup, groupIndex) => (
                <div key={groupIndex}>
                  {/* Nome do Grupo de Planos */}
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {planGroup.baseName}
                    </h3>
                    {planGroup.variations[0]?.description && (
                      <p className="text-gray-300">
                        {planGroup.variations[0].description}
                      </p>
                    )}
                  </div>

                  {/* Variações do Plano */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {planGroup.variations.map((plan, index) => {
                      const isHighlighted = plan.billing_cycle_days === 365; // Destaca o plano anual
                      const monthlyPrice =
                        plan.billing_cycle_days === 365
                          ? (parseFloat(plan.price) / 12)
                              .toFixed(2)
                              .replace(".", ",")
                          : null;

                      // Calcula desconto para planos longos
                      const calculateDiscount = () => {
                        if (
                          plan.billing_cycle_days === 365 &&
                          planGroup.variations.length > 1
                        ) {
                          const monthlyPlan = planGroup.variations.find(
                            (p) => p.billing_cycle_days === 30
                          );
                          if (monthlyPlan) {
                            const yearlyIfMonthly =
                              parseFloat(monthlyPlan.price) * 12;
                            const yearlyPrice = parseFloat(plan.price);
                            const discount = (
                              ((yearlyIfMonthly - yearlyPrice) /
                                yearlyIfMonthly) *
                              100
                            ).toFixed(0);
                            return discount;
                          }
                        }
                        return null;
                      };

                      const discount = calculateDiscount();

                      return (
                        <div
                          key={plan.id}
                          className={`rounded-xl p-8 relative ${
                            isHighlighted
                              ? "bg-gradient-to-br from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/30 transform scale-105 border-4 border-green-400"
                              : "bg-secondary-800/50 backdrop-blur-sm border border-white/10"
                          }`}
                        >
                          {/* Badge de desconto */}
                          {discount && (
                            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-xl transform rotate-12 font-bold text-sm animate-pulse">
                              -{discount}% OFF
                            </div>
                          )}

                          <div className="text-center mb-6">
                            {/* Badge do ciclo */}
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                                isHighlighted
                                  ? "bg-secondary-900/20 text-secondary-900"
                                  : "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                              }`}
                            >
                              <Calendar size={14} />
                              {getBillingLabel(plan.billing_cycle_days)}
                            </div>

                            {/* Preço mensal para planos anuais - MARKETING CHAMATIVO */}
                            {monthlyPrice && (
                              <div className="mb-3">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-lg text-secondary-900 font-bold">
                                      Apenas
                                    </span>
                                    <span className="text-lg text-secondary-800 font-bold">
                                      R$
                                    </span>
                                    <span className="text-6xl font-black text-secondary-900 leading-none">
                                      {monthlyPrice.split(",")[0]}
                                    </span>
                                    <span className="text-4xl font-black text-secondary-900">
                                      ,{monthlyPrice.split(",")[1]}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xl text-secondary-900 font-bold">
                                      por mês
                                    </span>
                                    <span className="text-[10px] text-secondary-800/70 font-normal">
                                      (no plano anual)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Preço total - discreto para planos anuais */}
                            <div
                              className={`${
                                monthlyPrice
                                  ? "mt-4 pt-3 border-t border-secondary-900/20"
                                  : ""
                              }`}
                            >
                              {monthlyPrice && (
                                <p className="text-[10px] text-secondary-800/70 mb-1 font-normal uppercase tracking-wide">
                                  Pagamento anual de:
                                </p>
                              )}
                              <div className="flex items-baseline justify-center gap-1">
                                <span
                                  className={`${
                                    monthlyPrice ? "text-xs" : "text-sm"
                                  } ${
                                    isHighlighted
                                      ? "text-secondary-800"
                                      : "text-gray-400"
                                  }`}
                                >
                                  R$
                                </span>
                                <span
                                  className={`${
                                    monthlyPrice ? "text-2xl" : "text-5xl"
                                  } font-bold ${
                                    isHighlighted
                                      ? "text-secondary-900"
                                      : "text-white"
                                  }`}
                                >
                                  {plan.price}
                                </span>
                              </div>
                              {!monthlyPrice && (
                                <p
                                  className={`text-xs mt-1 ${
                                    isHighlighted
                                      ? "text-secondary-800"
                                      : "text-gray-400"
                                  }`}
                                >
                                  a cada {plan.billing_cycle_days} dias
                                </p>
                              )}
                            </div>

                            {/* Badges de benefícios */}
                            {plan.billing_cycle_days === 365 && (
                              <div className="mt-4 space-y-2">
                                <div className="w-full">
                                  <div className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-bold shadow-lg">
                                    <CheckCircle size={16} />
                                    Economia de {discount}%
                                  </div>
                                </div>
                                <div className="w-full">
                                  <div className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-bold shadow-lg">
                                    <Zap size={16} />
                                    Escolha Mais Popular
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <ul className="space-y-3 mb-8">
                            {getPlanFeatures(plan).map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3">
                                <CheckCircle
                                  className={`w-5 h-5 flex-shrink-0 ${
                                    isHighlighted
                                      ? "text-secondary-900"
                                      : "text-primary-400"
                                  }`}
                                />
                                <span
                                  className={
                                    isHighlighted
                                      ? "text-secondary-900"
                                      : "text-gray-300"
                                  }
                                >
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={() => navigate("/cadastro")}
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${
                              isHighlighted
                                ? "bg-secondary-900 text-white hover:bg-secondary-800"
                                : "bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 hover:from-primary-600 hover:to-primary-700 shadow-lg"
                            }`}
                          >
                            Começar Agora
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  100% Seguro
                </span>
              </div>

              <h2 className="text-4xl font-bold text-white mb-6">
                Seus dados estão seguros conosco
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Utilizamos as mais avançadas tecnologias de criptografia e
                segurança para proteger suas informações financeiras.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Lock,
                    title: "Criptografia de ponta",
                    desc: "Todos os dados são criptografados com SSL/TLS",
                  },
                  {
                    icon: Shield,
                    title: "Proteção de dados",
                    desc: "Conforme LGPD e padrões internacionais",
                  },
                  {
                    icon: Globe,
                    title: "Backup automático",
                    desc: "Seus dados sempre protegidos e disponíveis",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl border border-primary-500/30 flex items-center justify-center">
                <Shield className="w-48 h-48 text-primary-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Junte-se a milhares de pessoas que já estão no controle do seu
            dinheiro
          </p>
          <button
            onClick={() => navigate("/cadastro")}
            className="px-12 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 font-bold text-lg inline-flex items-center gap-2"
          >
            Começar Gratuitamente
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-secondary-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-secondary-900" />
                </div>
                <span className="text-xl font-bold text-white">FinPlanner</span>
              </div>
              <p className="text-gray-400 text-sm">
                Sua plataforma completa de gestão financeira pessoal e
                empresarial.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    Preços
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    Sobre
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    Contato
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    Privacidade
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary-400 transition-colors">
                    LGPD
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} FinPlanner. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
