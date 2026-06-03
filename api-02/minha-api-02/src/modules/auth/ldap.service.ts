import { Injectable } from '@nestjs/common';
import { Client } from 'ldapts';

@Injectable()
export class LdapService {
  // Método de login (já existente)
  async authenticate(username: string, password: string) {
    const client = new Client({
      url: process.env.AD_URL!,
    });

    try {
      const dn = `${username}@${process.env.AD_DOMAIN}`;
      await client.bind(dn, password);

      const { searchEntries } = await client.search(
        process.env.AD_BASE_DN!,
        {
          scope: 'sub',
          filter: `(sAMAccountName=${username})`,
        },
      );

      await client.unbind();
      return searchEntries[0];
    } catch {
      return null;
    }
  }

  // 🚀 NOVO MÉTODO: Apenas checa se o usuário existe no AD (Sem Senha)
  async findUser(username: string) {
    const client = new Client({
      url: process.env.AD_URL!,
    });

    try {
      // Nota: Conecta sem passar DN/Senha (Bind Anônimo / Leitura da rede interna)
      //  Como deve ficar para busca anônima/não autenticada:
      await client.bind('', ''); 

      const { searchEntries } = await client.search(
        process.env.AD_BASE_DN!,
        {
          scope: 'sub',
          filter: `(sAMAccountName=${username})`,
        },
      );

      await client.unbind();

      // Retorna true se encontrou pelo menos um usuário, ou false se não encontrou
      return searchEntries.length > 0;
    } catch {
      // Se o seu AD bloquear consultas anônimas, este bloco vai retornar false.
      // Nesse caso, seria obrigatório configurar um usuário de serviço no .env para ler o AD.
      return false;
    }
  }
}