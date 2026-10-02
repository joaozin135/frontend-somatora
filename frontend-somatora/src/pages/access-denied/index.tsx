import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="p-8.5">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-card border border-line bg-paper-raised px-8 py-12 text-center shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-amber-soft text-amber">
          <ShieldAlert className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-navy">Acesso negado</h1>
        <p className="mt-2 text-[13px] text-ink-soft">
          Seu usuário não tem permissão para acessar esta página. Se achar que isso é um engano, fale com um
          administrador.
        </p>
        <Link
          to="/dashboard"
          replace
          className="mt-6 rounded-control bg-canopy px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
