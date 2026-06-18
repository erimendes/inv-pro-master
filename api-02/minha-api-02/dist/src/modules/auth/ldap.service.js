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
    getLdapUrl() {
        const url = process.env.AD_URL || process.env.LDAP_URL || 'ldap://172.27.96.1:389';
        console.log('--- [LDAP] URL DE CONEXÃO ---', url);
        return url;
    }
    async authenticate(username, password) {
        const ldapUrl = this.getLdapUrl();
        const client = new ldapts_1.Client({ url: ldapUrl });
        const domain = process.env.AD_DOMAIN || process.env.LDAP_DOMAIN || '';
        const baseDn = process.env.AD_BASE_DN || process.env.LDAP_BASE_DN || '';
        console.log('--- [LDAP] DADOS DO AMBIENTE RECEBIDOS ---');
        console.log('Username enviado:', username);
        console.log('Domínio mapeado:', domain);
        console.log('Base DN mapeada:', baseDn);
        console.log('-----------------------------------------');
        if (!domain || !baseDn) {
            console.error('❌ [LDAP ERRO] AD_DOMAIN ou AD_BASE_DN não estão definidos no .env!');
            return null;
        }
        try {
            const dn = `${username}@${domain}`;
            console.log(`[LDAP] Tentando realizar o BIND com o DN: ${dn}`);
            await client.bind(dn, password);
            console.log('✅ [LDAP] BIND efetuado com sucesso! Usuário autenticado.');
            console.log(`[LDAP] Iniciando busca no escopo pelo sAMAccountName=${username}...`);
            const { searchEntries } = await client.search(baseDn, {
                scope: 'sub',
                filter: `(sAMAccountName=${username})`,
            });
            await client.unbind();
            if (!searchEntries || searchEntries.length === 0) {
                console.warn('⚠️ [LDAP] Usuário autenticado, mas nenhum registro de objeto correspondente foi encontrado na árvore Base DN.');
                return null;
            }
            console.log('🎉 [LDAP] Registro do usuário recuperado com sucesso do Active Directory.');
            return searchEntries[0];
        }
        catch (error) {
            console.error('❌ --- [LDAP CRITICAL ERROR IN BACKEND] --- ❌');
            console.error('Mensagem do Erro:', error?.message || error);
            console.error('Código do Erro:', error?.code);
            console.error('Stack Trace:', error?.stack);
            console.error('--------------------------------------------');
            try {
                await client.unbind();
            }
            catch { }
            return null;
        }
    }
    async findUser(username) {
        const ldapUrl = this.getLdapUrl();
        const client = new ldapts_1.Client({ url: ldapUrl });
        const baseDn = process.env.AD_BASE_DN || process.env.LDAP_BASE_DN || '';
        if (!baseDn)
            return false;
        try {
            await client.bind('', '');
            const { searchEntries } = await client.search(baseDn, {
                scope: 'sub',
                filter: `(sAMAccountName=${username})`,
            });
            await client.unbind();
            return searchEntries.length > 0;
        }
        catch (error) {
            console.warn('[LDAP WARN] Falha na busca anônima de usuário (Procedimento Normal se o AD for fechado).');
            try {
                await client.unbind();
            }
            catch { }
            return false;
        }
    }
};
exports.LdapService = LdapService;
exports.LdapService = LdapService = __decorate([
    (0, common_1.Injectable)()
], LdapService);
//# sourceMappingURL=ldap.service.js.map