import { Outlet, useMatches } from "react-router";
import Sidebar from "../sidebar";
import Topbar from "../topbar";
import type { RouteHandle, RouteHandleValue } from "../../router";

/**
 * Layout — SOMAPAR
 * Sidebar fixa + Topbar (título/subtítulo lidos da rota atual) + área de
 * conteúdo rolável com <Outlet />.
 *
 * Cada rota filha declara seu handle no router.tsx — como objeto fixo ou
 * como função (útil pra valores que mudam a cada navegação, tipo a data
 * de hoje). As páginas em si (DashboardPage, etc.) NÃO renderizam
 * <Topbar /> nem <Sidebar /> — só retornam o próprio conteúdo.
 */
export default function Layout() {
  const matches = useMatches();
  const current = matches[matches.length - 1];
  const rawHandle = current?.handle as RouteHandleValue | undefined;
  const handle: RouteHandle | undefined = typeof rawHandle === "function" ? rawHandle() : rawHandle;

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={handle?.title ?? "SOMAPAR"} subtitle={handle?.subtitle} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}