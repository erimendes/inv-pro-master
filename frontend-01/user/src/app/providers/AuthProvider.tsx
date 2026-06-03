import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);

  // 1. Ao carregar a página, tenta recuperar o usuário do cache
  useEffect(() => {
    const savedUser = localStorage.getItem("@App:user");
    if (savedUser) {
      try {
        // Se o que estiver no cache for um JSON válido, carrega no estado
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("@App:user");
      }
    }
  }, []);

  const login = (userData: any) => {
    // 2. Normalização: O backend pode enviar 'name', 'nome' ou nada.
    // Aqui garantimos que a propriedade .name sempre exista para o layout.
    const userToSave = {
      ...userData,
      name: userData.name || userData.nome || userData.email?.split('@')[0] || "Usuário"
    };
    
    // 3. Salva no LocalStorage para persistir após o F5
    localStorage.setItem("@App:token", userData.accessToken || userData.token);
    localStorage.setItem("@App:user", JSON.stringify(userToSave));
    
    // 4. Atualiza o estado global para o RootLayout perceber a mudança
    setUser(userToSave);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/'; // Força um reset limpo da aplicação
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);