import { useState, type FormEvent, type ReactNode } from "react";
import { isAxiosError } from "axios";
import type { Role } from "../../contexts/authContext";
import { createUser, roleLabels, type User } from "../../services/users";

export interface UserFormProps {
  onCancel: () => void;
  onSaved: (user: User) => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

const inputClass =
  "w-full rounded-control border border-line bg-paper px-3.5 py-2.75 text-[13px] text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-canopy focus:ring-2 focus:ring-canopy/20";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return "Não foi possível salvar. Tente novamente.";
}

// Mesmas regras do @IsStrongPassword da API: 8+ caracteres, maiúscula, minúscula, número e símbolo.
function isStrongPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function validate(form: FormState): string {
  if (form.name.trim().length < 2) return "Informe o nome do usuário.";
  if (!EMAIL_PATTERN.test(form.email.trim())) return "Informe um e-mail válido.";
  if (!isStrongPassword(form.password)) {
    return "A senha precisa ter ao menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.";
  }
  return "";
}

export default function UserForm({ onCancel, onSaved }: UserFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validate(form);
    setError(validationError);
    if (validationError) return;

    setSubmitting(true);
    try {
      const saved = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: form.role,
      });
      onSaved(saved);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Nome" htmlFor="user-name">
        <input
          id="user-name"
          autoFocus
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Ex: Ana Souza"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="E-mail" htmlFor="user-email">
          <input
            id="user-email"
            type="email"
            autoComplete="off"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="ana@somapar.com.br"
          />
        </Field>

        <Field label="Telefone" htmlFor="user-phone">
          <input
            id="user-phone"
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(11) 91234-5678"
          />
        </Field>

        <Field label="Perfil de acesso" htmlFor="user-role">
          <select
            id="user-role"
            className={inputClass}
            value={form.role}
            onChange={(e) => update("role", e.target.value as Role)}
          >
            {(Object.keys(roleLabels) as Role[]).map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Senha inicial" htmlFor="user-password" hint="Mín. 8 caracteres, com maiúscula, número e símbolo.">
          <input
            id="user-password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </Field>
      </div>

      {error && (
        <p className="rounded-control bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-text">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-line pt-4.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-control border border-line px-4.5 py-2.5 text-[13px] font-semibold text-ink-soft transition hover:bg-paper"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-control bg-canopy px-4.5 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Salvando…" : "Criar usuário"}
        </button>
      </div>
    </form>
  );
}
