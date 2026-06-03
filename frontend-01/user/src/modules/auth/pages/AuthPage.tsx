import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthContext';
import { Mail, Lock, User, LayoutDashboard, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { authService } from '../../../core/services/api';

export default function AuthPage({ mode: initialMode, onBack }: any) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (authMode === 'login') {
        const result = await authService.login({ email, password });
        
        // CRITICAL: Passamos o objeto 'result' completo, não apenas o token.
        // O result contém: { accessToken, name, email, ... }
        login(result); 
        
        // Redireciona ou fecha o modal
        onBack(); 
      } else {
        await authService.register({ email, password, name });
        setAuthMode('login');
      }
    } catch (err: any) {
      setError("Credenciais inválidas ou erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-slate-900/40 p-10 rounded-[40px] border border-white/5">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {authMode === 'login' ? 'Bem-vindo' : 'Criar Conta'}
        </h2>

        {error && <div className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <Input icon={User} placeholder="Nome" value={name} onChange={(e:any) => setName(e.target.value)} required />
          )}
          <Input icon={Mail} type="email" placeholder="Email" value={email} onChange={(e:any) => setEmail(e.target.value)} required />
          <Input icon={Lock} type="password" placeholder="Senha" value={password} onChange={(e:any) => setPassword(e.target.value)} required />

          <Button type="submit" loading={loading} className="w-full h-14">
            {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}