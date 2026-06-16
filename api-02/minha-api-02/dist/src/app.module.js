"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const configuration_1 = __importDefault(require("./config/env/configuration"));
const validation_schema_1 = require("./config/env/validation.schema");
const prisma_module_1 = require("./database/prisma.module");
const sync_module_1 = require("./modules/sync/sync.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/users/user.module");
const assets_module_1 = require("./modules/assets/assets.module");
const racks_module_1 = require("./modules/racks/racks.module");
const applications_module_1 = require("./modules/applications/applications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [configuration_1.default],
                validationSchema: validation_schema_1.validationSchema,
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            sync_module_1.SyncModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            assets_module_1.AssetsModule,
            racks_module_1.RacksModule,
            applications_module_1.ApplicationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map