import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login";
import Layout from "../components/layoult";
import DashboardPage from "../pages/dashboard";
import WeighingPage from "../pages/weighing";

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
    ],
  },
  // próximas rotas entram aqui, cada uma com seu próprio handle:
  // {
  //   path: "/usuarios",
  //   element: <UsuariosPage />,
  //   handle: { title: "Usuários", subtitle: "Gerencie quem tem acesso ao sistema" } satisfies RouteHandle,
  // },
]);

export default router;
