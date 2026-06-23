import { Role } from '../../generated/prisma/client'; // Ajuste o caminho se necessário

declare global {
  namespace Express {
    // Definimos a estrutura exata que o seu JWT joga no req.user
    interface User {
      sub: string;        // O ID do usuário no JWT costuma vir como 'sub'
      username: string;
      email: string;
      role: Role;         // Usa o Enum de Roles do seu Prisma
      sessionId: string;
    }

    interface Request {
      user?: User;
    }
  }
}