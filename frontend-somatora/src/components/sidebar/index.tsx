import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Scale,
  Building2,
  Truck,
  Layers,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import logoIcon from "../../assets/somapar-icon.png";
import { useAuth } from "../../contexts/authContext";

interface NavItemConfig {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: number;
}

export interface SidebarUser {
  name: string;
  role: string;
  initials: string;
}

export interface SidebarProps {
  reportsCount?: number;
}

const operacaoItems: NavItemConfig[] = [
  { key: "painel", label: "Painel", to: "/dashboard", icon: LayoutDashboard },
  { key: "pesagens", label: "Pesagens", to: "/pesagens", icon: Scale },
  { key: "fornecedores", label: "Fornecedores", to: "/fornecedores", icon: Building2 },
  { key: "caminhoes", label: "Caminhões", to: "/caminhoes", icon: Truck },
  { key: "classes-madeira", label: "Classes de Madeira", to: "/classes-madeira", icon: Layers },
];

function buildGestaoItems(reportsCount: number): NavItemConfig[] {
  return [
    { key: "usuarios", label: "Usuários", to: "/usuarios", icon: Users },
    { key: "relatorios", label: "Relatórios", to: "/relatorios", icon: BarChart3, badge: reportsCount },
    { key: "configuracoes", label: "Configurações", to: "/configuracoes", icon: Settings },
  ];
}


export default function Sidebar({ reportsCount = 0 }: SidebarProps) {
  const { user: authUser } = useAuth();

  let user: SidebarUser = {
    name: "Usuário",
    role: "—",
    initials: "US",
  };

  if (authUser) {
    const initials = authUser.name
      .split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    user = {
      name: authUser.name,
      role: authUser.role,
      initials,
    };
  }

  return (
    <aside className="sticky top-0 flex h-screen w-65 shrink-0 flex-col bg-linear-to-b from-ink-navy to-ink-navy-deep px-4 py-5.5 text-on-dark">
      {/* Marca */}
      <div className="mb-4.5 flex items-center gap-2.5 border-b border-white/9 px-2 pb-5.5">
        <img src={logoIcon} alt="SOMAPAR" className="h-8.5 w-auto drop-shadow" />
        <div className="leading-[1.05]">
          <strong className="block font-display text-[17px] font-semibold text-white">SOMAPAR</strong>
          <span className="block text-[10.5px] uppercase tracking-[0.08em] text-sage">
            Pesagem &amp; Recebimento
          </span>
        </div>
      </div>

      {/* Operação */}
      <p className="mt-1.5 px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-on-dark/38">
        Operação
      </p>
      <nav className="flex flex-col gap-0.5">
        {operacaoItems.map(({ key, ...item }) => (
          <NavItem key={key} {...item} />
        ))}
      </nav>

      {/* Gestão */}
      <p className="mt-4 px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-on-dark/38">
        Gestão
      </p>
      <nav className="flex flex-col gap-0.5">
        {buildGestaoItems(reportsCount).map(({ key, ...item }) => (
          <NavItem key={key} {...item} />
        ))}
      </nav>

      {/* Usuário logado */}
      <div className="mt-auto border-t border-white/9 pt-4">
        <div className="flex items-center gap-2.5 rounded-control p-2">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-canopy to-forest-deep font-display text-[13px] font-semibold text-white">
            {user.initials}
          </div>
          <div className="min-w-0 leading-[1.2]">
            <strong className="block truncate text-[13px] text-white">{user.name}</strong>
            <small className="block truncate text-[11.5px] text-on-dark/55">{user.role}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------------- */
/* Subcomponentes                                                          */
/* ---------------------------------------------------------------------- */

type NavItemProps = Omit<NavItemConfig, "key">;

function NavItem({ icon: Icon, label, to, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center gap-2.5 rounded-control border-l-[3px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
          isActive
            ? "border-canopy bg-linear-to-r from-canopy/20 to-canopy/5 text-white"
            : "border-transparent text-on-dark/72 hover:bg-white/6 hover:text-white",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-4.25 w-4.25 shrink-0 ${isActive ? "opacity-100" : "opacity-85"}`}
            strokeWidth={1.8}
          />
          <span className="flex-1">{label}</span>
          {!!badge && (
            <span className="rounded-full bg-amber px-1.5 py-px text-[10.5px] font-extrabold text-amber-badge-text">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}