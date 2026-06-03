import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GlpiService {
  private readonly logger = new Logger(GlpiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchInventory() {
    this.logger.log('Buscando ativos do GLPI...');
    // TODO: Implementar lógica de fetch real conforme o modelo do Ativo
    return []; 
  }
}
