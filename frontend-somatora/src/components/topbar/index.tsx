import { useState, type ChangeEvent, type ReactNode } from "react";
import { Search, Bell, CircleHelp } from "lucide-react";
import { useAuth } from "../../contexts/authContext";

/**
 * Topbar — SOMAPAR
 * Cabeçalho fixo no topo da área de conteúdo (fica ao lado da Sidebar, não por cima dela).
 *
 * Reaproveitável em qualquer tela — cada página manda seu próprio título/subtítulo:
 *
 *   <Topbar title="Bom dia, Ana." subtitle="Terça-feira, 8 de setembro de 2026" notificationCount={2} />
 *   <Topbar title="Usuários" subtitle="Gerencie quem tem acesso ao sistema" searchPlaceholder="Filtrar por nome ou e-mail…" />
 */
export interface TopbarProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onHelpClick?: () => void;
  /** Slot livre para ações específicas da tela (ex: botão "+ Novo"), renderizado antes dos ícones fixos. */
  actions?: ReactNode;
}

export default function Topbar({
  subtitle,
  searchPlaceholder = "Buscar…",
  onSearch,
  notificationCount = 0,
  onNotificationsClick,
  onHelpClick,
  actions,
}: TopbarProps) {
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  }

  const userName = user?.name ?? "";

  const hour = new Date().getHours();
  let greeting = "";

  if (hour < 12) {
    greeting = "Bom dia";
  } else if (hour < 18) {
    greeting = "Boa tarde";
  } else {
    greeting = "Boa noite";
  }

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4.5 border-b border-line bg-paper-raised px-8.5 py-4.5">
      <div className="min-w-0">
        <h1 className="truncate font-display text-xl font-semibold text-ink-navy">
          {greeting}, {userName || "Usuário"}.
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">
            {subtitle}
          </p>
        )}
      </div>

      <div className="ml-auto flex w-70 max-w-full items-center gap-2 rounded-control border border-line bg-paper px-3 py-2 text-ink-soft">
        <Search className="h-3.75 w-3.75 shrink-0" strokeWidth={2} />
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-placeholder focus:outline-none"
        />
        <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
          /
        </kbd>
      </div>

      {actions}

      <button
        type="button"
        onClick={onNotificationsClick}
        aria-label="Notificações"
        className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-control border border-line bg-paper-raised text-ink transition-colors hover:bg-paper"
      >
        <Bell className="h-4.25 w-4.25" strokeWidth={1.8} />
        {notificationCount > 0 && (
          <span className="absolute right-2 top-2 h-1.75 w-1.75 rounded-full border-[1.5px] border-paper-raised bg-amber" />
        )}
      </button>

      <button
        type="button"
        onClick={onHelpClick}
        aria-label="Ajuda"
        className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-control border border-line bg-paper-raised text-ink transition-colors hover:bg-paper"
      >
        <CircleHelp className="h-4.25 w-4.25" strokeWidth={1.8} />
      </button>
    </header>
  );
}
