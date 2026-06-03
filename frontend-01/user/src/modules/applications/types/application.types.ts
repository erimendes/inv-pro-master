export type Application = {
  id: number;
  nome: string;
  sigla?: string;         // Adicionado
  descricao?: string;
  categoria: 'ADMINISTRATIVO' | 'OPERACIONAL';
  criticidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  businessOwner?: string;      // Conforme Prisma
  responsavelTecnico?: string; // Conforme Prisma
  tecnologiaPrincipal?: string; // Conforme Prisma
  servidores?: any[];          // Relação que você tem no Prisma
};
