import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { authService } from '../services/auth.service';

type User = {
  email?: string; // Tornou-se opcional caso o login AD não retorne e-mail imediatamente
  username?: string; // 💡 Adicionado suporte ao login corporativo
  role: 'ADMIN' | 'USER';
  name: string;
};

// 💡 CORREÇÃO PRINCIPAL: Permite que a página envie tanto e-mail quanto username
type LoginData = {
  email?: string;
  username?: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // =====================================
  // RESTORE SESSION
  // =====================================
  useEffect(() => {
    try {
      const tokenStorage = localStorage.getItem('token');
      const userStorage = localStorage.getItem('user');

      if (tokenStorage && userStorage) {
        const parsedUser = JSON.parse(userStorage);
        setToken(tokenStorage);
        setUser(parsedUser);
        console.log('Sessão restaurada');
      }
    } catch (err) {
      console.error('Erro ao restaurar sessão:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================
  // LOGIN
  // =====================================
  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);

      console.log('LOGIN RESPONSE', response);

      const accessToken =
        response.accessToken ||
        response.token ||
        response.access_token;

      const refreshToken =
        response.refreshToken ||
        response.refresh_token;

      if (!accessToken) {
        throw new Error('Token não retornado pelo backend');
      }

      // =====================================
      // USER MAPPING (Incluso suporte a username)
      // =====================================
      const userData: User = {
        email:
          response.email ||
          response.user?.email,
        
        username:
          response.username ||
          response.user?.username,

        name:
          response.name ||
          response.user?.name || 
          response.username || 'Usuário',

        role:
          response.role ||
          response.user?.role ||
          'USER',
      };

      // =====================================
      // STORAGE
      // =====================================
      localStorage.setItem('token', accessToken);

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      localStorage.setItem('user', JSON.stringify(userData));

      // =====================================
      // STATE
      // =====================================
      setToken(accessToken);
      setUser(userData);

      console.log('Login realizado com sucesso');
    } catch (error) {
      console.error('LOGIN ERROR', error);
      throw error;
    }
  };

  // =====================================
  // REGISTER
  // =====================================
  const register = async (data: RegisterData) => {
    try {
      await authService.register({
        ...data,
        role: data.role || 'USER',
      });
    } catch (error) {
      console.error('REGISTER ERROR', error);
      throw error;
    }
  };

  // =====================================
  // LOGOUT
  // =====================================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    console.log('Logout realizado');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}