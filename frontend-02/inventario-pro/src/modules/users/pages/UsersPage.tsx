import { useEffect, useState } from "react";
import { usersService } from "../services/users.service";
import type { User } from "../types/users.types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    try {
      const data = await usersService.getAll();

      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-white">
        Carregando usuários...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">
      <h1 className="text-4xl font-black mb-8">
        Usuários
      </h1>

      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-slate-900 border border-white/10 rounded-2xl p-5"
          >
            <h2 className="font-bold text-xl">
              {user.name}
            </h2>

            <p className="text-slate-400">
              {user.email}
            </p>

            <div className="mt-3 inline-flex px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
              {user.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}