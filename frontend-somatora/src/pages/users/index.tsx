import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../../components/modal";
import UserForm from "./user-form";
import { getUsers, roleLabels, type User } from "../../services/users";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError("Não foi possível carregar os usuários agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const closeForm = useCallback(() => setFormOpen(false), []);

  function handleSaved(user: User) {
    setUsers((prev) => [...prev, user]);
    setFormOpen(false);
  }

  return (
    <div className="p-8.5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-navy">Usuários</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">Gerencie quem tem acesso ao sistema</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-control bg-canopy px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Novo usuário
        </button>
      </div>

      {loading && <p className="text-[13px] text-ink-soft">Carregando usuários…</p>}

      {!loading && error && (
        <div className="flex items-center justify-between gap-4 rounded-control border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger-text">
          {error}
          <button type="button" onClick={loadUsers} className="font-bold underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="rounded-card border border-line bg-paper-raised px-6 py-12 text-center text-[13px] text-ink-soft shadow-card">
          Nenhum usuário cadastrado ainda.
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-paper-raised shadow-card">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">Nome</th>
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">E-mail</th>
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">Telefone</th>
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">Perfil</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 font-semibold text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-ink">{user.email}</td>
                  <td className="px-4 py-3 text-ink">
                    {user.phone ?? <span className="text-ink-placeholder">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        user.role === "ADMIN" ? "bg-canopy/14 text-forest-deep" : "bg-line text-ink-soft"
                      }`}
                    >
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={closeForm} title="Novo usuário">
        <UserForm onCancel={closeForm} onSaved={handleSaved} />
      </Modal>
    </div>
  );
}
