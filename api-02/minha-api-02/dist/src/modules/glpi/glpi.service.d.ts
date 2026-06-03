import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class GlpiService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    constructor(configService: ConfigService, httpService: HttpService);
    fetchInventory(): Promise<never[]>;
}
