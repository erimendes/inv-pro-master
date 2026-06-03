"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapService = void 0;
const common_1 = require("@nestjs/common");
const ldapts_1 = require("ldapts");
let LdapService = class LdapService {
    async authenticate(username, password) {
        const client = new ldapts_1.Client({
            url: process.env.AD_URL,
        });
        try {
            const dn = `${username}@${process.env.AD_DOMAIN}`;
            await client.bind(dn, password);
            const { searchEntries } = await client.search(process.env.AD_BASE_DN, {
                scope: 'sub',
                filter: `(sAMAccountName=${username})`,
            });
            await client.unbind();
            return searchEntries[0];
        }
        catch {
            return null;
        }
    }
    async findUser(username) {
        const client = new ldapts_1.Client({
            url: process.env.AD_URL,
        });
        try {
            await client.bind('', '');
            const { searchEntries } = await client.search(process.env.AD_BASE_DN, {
                scope: 'sub',
                filter: `(sAMAccountName=${username})`,
            });
            await client.unbind();
            return searchEntries.length > 0;
        }
        catch {
            return false;
        }
    }
};
exports.LdapService = LdapService;
exports.LdapService = LdapService = __decorate([
    (0, common_1.Injectable)()
], LdapService);
//# sourceMappingURL=ldap.service.js.map