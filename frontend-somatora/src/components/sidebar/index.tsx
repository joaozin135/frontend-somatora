import { NavLink } from "react-router";

export function Sidebar(){
    return (
       <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 p-6 text-white">
      <h1 className="text-xl font-bold">Admin</h1>
      <p className="mt-1 text-sm text-slate-400">Painel de Usuários</p>

      <nav className="mt-8 space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-2 text-left transition ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/usuarios"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-2 text-left transition ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
          }
        >
          Usuários
        </NavLink>

        <NavLink
          to="/categorias"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-2 text-left transition ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
          }
        >
          Categorias
        </NavLink>

        <NavLink
          to="/cursos"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-2 text-left transition ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
          }
        >
          Cursos
        </NavLink>
      </nav>
    </aside>
    )
}