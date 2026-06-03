"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || '3000', 10),
    database: { url: process.env.DATABASE_URL },
    glpi: {
        url: process.env.GLPI_API_URL,
        appToken: process.env.GLPI_APP_TOKEN,
        userToken: process.env.GLPI_USER_TOKEN,
    },
}));
//# sourceMappingURL=configuration.js.map