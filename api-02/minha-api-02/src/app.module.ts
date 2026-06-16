import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/env/configuration';
import { validationSchema } from './config/env/validation.schema';
import { PrismaModule } from './database/prisma.module';
import { SyncModule } from './modules/sync/sync.module';
// import { InventoryModule } from './modules/inventory/inventory.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { AssetsModule } from './modules/assets/assets.module'
import { RacksModule } from './modules/racks/racks.module'
import { ApplicationsModule } from './modules/applications/applications.module';

// 👇 1. ADICIONE ESSES DOIS IMPORTS AQUI
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    // InventoryModule,
    SyncModule,
    AuthModule,
    UserModule,
    AssetsModule,
    RacksModule,
    ApplicationsModule,
  ],
  // 👇 2. ADICIONE O CONTROLLER E O PROVIDER AQUI EMBAIXO
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}