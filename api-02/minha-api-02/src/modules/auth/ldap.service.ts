import { Injectable } from '@nestjs/common';
import { Client } from 'ldapts';

@Injectable()
export class LdapService {
  
  private getLdapUrl(): string {
    const url = process.env.AD_URL || process.env.LDAP_URL || 'ldap://172.27.96.1:389';
    console.log('--- [LDAP] URL DE CONEXÃO ---', url);
    return url;
  }

  async authenticate(username: string, password: string) {
    const ldapUrl = this.getLdapUrl();
    const client = new Client({ url: ldapUrl });

    // Fallbacks inteligentes para evitar 'undefined' na montagem das strings
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
      const { searchEntries } = await client.search(
        baseDn,
        {
          scope: 'sub',
          filter: `(sAMAccountName=${username})`,
        },
      );

      await client.unbind();
      
      if (!searchEntries || searchEntries.length === 0) {
        console.warn('⚠️ [LDAP] Usuário autenticado, mas nenhum registro de objeto correspondente foi encontrado na árvore Base DN.');
        return null;
      }

      console.log('🎉 [LDAP] Registro do usuário recuperado com sucesso do Active Directory.');
      return searchEntries[0];
    } catch (error: any) {
      // 🌟 ISSO AQUI VAI EXPULSÁ-LO DO ERRO INTEGRAL NO TERMINAL:
      console.error('❌ --- [LDAP CRITICAL ERROR IN BACKEND] --- ❌');
      console.error('Mensagem do Erro:', error?.message || error);
      console.error('Código do Erro:', error?.code);
      console.error('Stack Trace:', error?.stack);
      console.error('--------------------------------------------');
      
      try { await client.unbind(); } catch {}
      return null; 
    }
  }

  async findUser(username: string) {
    const ldapUrl = this.getLdapUrl();
    const client = new Client({ url: ldapUrl });
    const baseDn = process.env.AD_BASE_DN || process.env.LDAP_BASE_DN || '';

    if (!baseDn) return false;

    try {
      await client.bind('', ''); 
      const { searchEntries } = await client.search(
        baseDn,
        {
          scope: 'sub',
          filter: `(sAMAccountName=${username})`,
        },
      );
      await client.unbind();
      return searchEntries.length > 0;
    } catch (error) {
      console.warn('[LDAP WARN] Falha na busca anônima de usuário (Procedimento Normal se o AD for fechado).');
      try { await client.unbind(); } catch {}
      return false;
    }
  }
}