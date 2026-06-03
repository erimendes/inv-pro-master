import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  
  // Propriedade que seus outros Services vão consumir
  public client: any;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    
    // Inicializa o PrismaClient base
    super({ adapter });

    // Armazenamos a referência da instância da classe base externa
    const baseClient = this;

    // Aplicamos a extensão global de auditoria
    this.client = this.$extends({
      query: {
        $allModels: {
          // Captura qualquer operação de criação
          async create({ model, args, query }) {
            const result = await query(args);

            // Evita loop infinito se a query for o próprio AuditLog
            if (model === 'AuditLog') return result;

            // 🚀 CORRIGIDO: Usamos o cliente base salvo externamente para evitar o 'undefined'
            (baseClient as any).auditLog.create({
              data: {
                action: 'CREATE',
                module: model.toUpperCase(),
                entityId: (result as any).id ? String((result as any).id) : null,
                newData: result as any, // Salva o JSON do objeto criado
                userId: (args.data as any).userId || null,
              },
            }).catch((err: any) => console.error('Erro ao gravar AuditLog automático:', err));

            return result;
          },

          // Captura qualquer operação de atualização
          async update({ model, args, query }) {
            const isSoftDelete = args.data && (args.data as any).deletedAt !== undefined;
            const actionType = isSoftDelete ? 'DELETE' : 'UPDATE';

            const result = await query(args);

            if (model === 'AuditLog') return result;

            // 🚀 CORRIGIDO: Usamos o cliente base salvo externamente
            (baseClient as any).auditLog.create({
              data: {
                action: actionType,
                module: model.toUpperCase(),
                entityId: (result as any).id ? String((result as any).id) : null,
                newData: result as any,
              },
            }).catch((err: any) => console.error('Erro ao gravar AuditLog automático:', err));

            return result;
          },
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexão com o banco estabelecida.');
    } catch (err) {
      this.logger.error('Falha ao conectar no banco:', err);
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
