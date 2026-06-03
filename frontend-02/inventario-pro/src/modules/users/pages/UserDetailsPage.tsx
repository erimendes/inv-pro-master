import { useNavigate }
from 'react-router-dom';

import { useUserDetailsController }
from '../controllers/user-details.controller';

export default function UserDetailsPage() {
  const navigate =
    useNavigate();

  const {
    user,
    loading,
    error,
  } =
    useUserDetailsController();

  if (loading) {
    return (
      <div className="p-6 text-white">
        Carregando...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="mb-6 text-3xl font-bold text-white">
          Detalhes Usuário
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm">
              Nome
            </p>

            <p className="text-white text-lg">
              {user.name}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">
              Email
            </p>

            <p className="text-white text-lg">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">
              Role
            </p>

            <p className="text-white text-lg">
              {user.role}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            navigate('/users')
          }
          className="mt-8 rounded-lg bg-slate-700 px-4 py-2 text-white"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}