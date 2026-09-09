import { useState } from "react";
import logoIcon from "../../assets/somapar-icon.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Credenciais inválidas");
      }

      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("access_token", data.access_token);
      console.log("Remember:", remember);
      console.log("Local:", localStorage.getItem("access_token"));
      console.log("Session:", sessionStorage.getItem("access_token"));
      console.log("Login bem-sucedido:", data);
      window.location.href = "/dashboard"; // Redireciona para a página do dashboard

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível realizar o login. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-paper">
      {/* ===================== PAINEL DE MARCA ===================== */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-ink-navy-softer via-ink-navy to-ink-navy-deep px-16 py-14 lg:flex lg:w-[40%] lg:min-w-120">
        {/* anéis decorativos — só marca gráfica, sem dado atrelado */}
        <svg
          className="pointer-events-none absolute -bottom-16 -right-16"
          width="360"
          height="360"
          viewBox="0 0 360 360"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="#EFEBFA"
            strokeWidth="10"
            opacity="0.08"
          />
          <circle
            cx="180"
            cy="180"
            r="115"
            stroke="#AFCB80"
            strokeWidth="10"
            opacity="0.12"
          />
          <circle
            cx="180"
            cy="180"
            r="82"
            stroke="#67B82F"
            strokeWidth="10"
            opacity="0.16"
          />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={logoIcon}
              alt="SOMAPAR"
              className="h-11 w-auto drop-shadow"
            />
            <div className="leading-tight">
              <strong className="block font-display text-lg font-bold text-white">
                SOMAPAR
              </strong>
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-sage">
                Pesagem &amp; Recebimento
              </span>
            </div>
          </div>

          <h1 className="mt-16 font-display text-[34px] font-semibold leading-[1.2] text-white">
            Da entrada do
            <br />
            caminhão à nota
            <br />
            de pesagem.
          </h1>

          <p className="mt-6 max-w-[320px] text-[15px] leading-relaxed text-on-dark/68">
            Acompanhe fornecedores, caminhões e classes de madeira em um fluxo
            só.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Fornecedores centralizados",
              "Controle de caminhões e motoristas",
              "Classes de madeira padronizadas",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-[13.5px] font-semibold text-on-dark/85"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-canopy" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[11px] text-on-dark/50">
          SOMAPAR © {new Date().getFullYear()} · Sistema interno de pesagem e
          recebimento
        </p>
      </aside>

      {/* ===================== FORMULÁRIO ===================== */}
      <main className="flex flex-1 flex-col">
        <div className="flex justify-end px-6 py-6 lg:px-12">
          <p className="text-[12.5px] text-ink-soft">
            Precisa de ajuda?{" "}
            <span className="font-bold text-ink-navy">Contate o TI</span>
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-105 rounded-card border border-line bg-white p-10 shadow-hero">
            {/* mini brand header — só aparece em telas pequenas, onde o painel esquerdo some */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <img src={logoIcon} alt="SOMAPAR" className="h-8 w-auto" />
              <strong className="font-display text-base font-bold text-ink-navy">
                SOMAPAR
              </strong>
            </div>

            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-forest-deep">
              Acesso ao sistema
            </p>
            <h2 className="mt-1 font-display text-[27px] font-semibold text-ink-navy">
              Bem-vindo de volta
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Entre com suas credenciais para continuar
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
              {/* E-mail */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-ink-soft"
                >
                  E-mail
                </label>
                <div className="flex items-center gap-2.5 rounded-control border border-line bg-paper px-3.5 py-3 transition focus-within:border-canopy focus-within:ring-2 focus-within:ring-canopy/20">
                  <svg
                    className="h-4 w-4 shrink-0 text-ink-soft"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@somapar.com.br"
                    className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-placeholder focus:outline-none"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-ink-soft"
                >
                  Senha
                </label>
                <div className="flex items-center gap-2.5 rounded-control border border-line bg-paper px-3.5 py-3 transition focus-within:border-canopy focus-within:ring-2 focus-within:ring-canopy/20">
                  <svg
                    className="h-4 w-4 shrink-0 text-ink-soft"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="3" y="10" width="18" height="12" rx="2" />
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-placeholder focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={showPassword}
                    className="shrink-0 text-ink-soft transition hover:text-ink-navy"
                  >
                    {showPassword ? (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.4 18.4 0 0 1 4.22-5.77M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Lembrar / Esqueci a senha */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[12.5px] text-ink">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-canopy"
                  />
                  Lembrar de mim
                </label>
                <a
                  href="#"
                  className="text-[12.5px] font-bold text-canopy-dark hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>

              {error && (
                <p className="rounded-control bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-text">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-control bg-canopy py-3.5 text-[14.5px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Entrando…" : "Entrar"}
                {!loading && (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[11.5px] text-ink-soft">
              Esqueceu como acessar? Fale com o administrador do sistema.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
