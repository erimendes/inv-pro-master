export type User = {
  id: string;
  name: string;
  email: string;
  username: string;          // 👈 Adicionado para corrigir o erro principal
  role: string;
  departamento?: string;     // 👈 Adicionado (opcional, caso não venha sempre)
  authProvider?: 'AD' | 'LOCAL' | string; // 👈 Adicionado para mapear a estratégia Auth
  ativo: boolean;            // 👈 Adicionado para mapear o estado do cadastro
  createdAt?: string;
  updatedAt?: string;
};