import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login";
import Layout from "../components/layoult";
import DashboardPage from "../pages/dashboard";
import WeighingPage from "../pages/weighing";
import ReconciliationPage from "../pages/reconciliation";
import SuppliersPage from "../pages/suppliers";
import AccessDeniedPage from "../pages/access-denied";
import ProtectedRoute from "../components/protected-route";
import UsersPage from "../pages/users";

/**
 * Formato do `handle` de cada rota — é isso que o Layout lê via useMatches()
 * pra saber o que mostrar no Topbar, sem a página precisar renderizar o
 * próprio <Topbar /> manualmente.
 *
 * Pode ser um objeto fixo ou uma função que retorna o objeto — use função
 * quando precisar de algo calculado na hora (ex: data de hoje), já que o
 * router só roda uma vez, no carregamento do app.
 */
export interface RouteHandle {
  title?: string;
  subtitle?: string;
}
export type RouteHandleValue = RouteHandle | (() => RouteHandle);

function formatToday(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
    // sem handle: a tela de login não passa pelo Layout, não usa Topbar
  },
  {
    element: <ProtectedRoute />, // exige login para tudo abaixo
    children: [
      {
        element: <Layout />, // rota "casca" sem path — só agrupa as filhas com Sidebar+Topbar
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
            handle: (): RouteHandle => ({
              // TODO: trocar "Ana" pelo primeiro nome do usuário logado quando o auth existir
              title: "Bom dia, Ana.",
              subtitle: formatToday(),
            }),
          },
    
          {
            path: "/pesagens",
            element: <WeighingPage />,
            handle: {
              title: "Pesagens",
              subtitle: "Gerencie as pesagens do dia",
            } satisfies RouteHandle,
          },
          {
            path: "/relatorios",
            element: <ReconciliationPage />,
            handle: {
              title: "Relatórios",
              subtitle: "Fechamento de notas complementares",
            } satisfies RouteHandle,
          },
          {
            path: "/fornecedores",
            element: <SuppliersPage />,
            handle: {
              title: "Fornecedores",
              subtitle: "Cadastro usado na seleção de novas pesagens",
            } satisfies RouteHandle,
          },
          {
            path: "/acesso-negado",
            element: <AccessDeniedPage />,
            handle: {
              title: "Acesso negado",
              subtitle: "Você não tem permissão para esta página",
            } satisfies RouteHandle,
          },
          // rotas só de administrador entram dentro de um ProtectedRoute com roles:
          {
            element: <ProtectedRoute roles={["ADMIN"]} />,
            children: [
              {
                path: "/usuarios",
                element: <UsersPage />,
                handle: {
                  title: "Usuários",
                  subtitle: "Gerencie quem tem acesso ao sistema",
                } satisfies RouteHandle,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
