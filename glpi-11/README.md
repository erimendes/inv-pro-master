Aqui tem o conteúdo completo estruturado em **bloco de código Markdown puro** para que possa simplesmente clicar no botão de copiar e colar diretamente no seu ficheiro `README.md`.

Note que, para além de organizar toda a estrutura técnica, mantive a mesma linguagem formal e clara do seu repositório original.

```markdown
# 🐳 GLPI em Docker - Guia de Migração e Implantação

Este repositório contém as instruções e os ficheiros necessários para executar o GLPI num ambiente contentorizado utilizando o Docker. Caso necessite de mais detalhes sobre a infraestrutura da aplicação, consulte o [Tutorial Oficial do GLPI no Docker](https://help.glpi-project.org/tutorials/procedures/running_glpi_on_docker).

Para migrar o seu GLPI antigo (seja ele uma instalação antiga num servidor físico ou outra versão) para o seu novo ambiente em Docker, precisa de mover essencialmente **duas coisas**: o **Banco de Dados (SQL)** e os **Arquivos de Mídia/Configuração (pastas do sistema)**.

---

## 📋 O que precisa de copiar (Os Dados Essenciais)

1. **O Banco de Dados (Dump SQL):** Contém todos os seus chamados, utilizadores, inventário, bases de conhecimento e configurações.
2. **A pasta `files` (Arquivos anexos):** É aqui que ficam guardados todos os PDFs, imagens e documentos que os utilizadores anexaram nos chamados ao longo dos anos. **Se não copiar isto, os chamados antigos ficarão sem os anexos.**
3. **A pasta `plugins` (Opcional):** Se utilizava plugins específicos no GLPI antigo, precisará deles. 
   * *Dica:* É preferível descarregar as versões limpas e atualizadas que sejam totalmente compatíveis com o GLPI novo do que copiar a pasta antiga bruta.

---

## 🚀 Como fazer a migração (Passo a Passo)

### 🔹 Passo 1: No GLPI ANTIGO (Exportar os dados)

**1. Gerar o Backup do Banco de Dados:**
Aceda ao terminal do seu servidor antigo e execute o comando `mysqldump` para exportar o banco atual:

```bash
mysqldump -u [usuario_do_banco] -p [nome_do_banco_antigo] > glpi_antigo_backup.sql

```

*(Se o banco antigo também estiver a rodar em Docker, utilize: `docker exec -i [nome_do_container_db] mysqldump -u... > glpi_antigo_backup.sql`)*

**2. Compactar os arquivos anexos:**
Vá até ao diretório do seu GLPI antigo (geralmente localizado em `/var/www/html/glpi/` ou `/var/www/glpi/`) e compacte a pasta `files`:

```bash
tar -czvf glpi_files_backup.tar.gz /var/www/html/glpi/files

```

Transfira esses dois ficheiros gerados (`glpi_antigo_backup.sql` e `glpi_files_backup.tar.gz`) para o seu novo servidor onde o Docker Compose está a rodar.

---

### 🔹 Passo 2: No GLPI NOVO com Docker (Importar os dados)

Garanta que os seus contentores novos estão ativos e em execução (`docker compose up -d`).

**1. Importar o Banco de Dados para o contentor MySQL:**
Envie o ficheiro `.sql` gerado diretamente para dentro do banco de dados do Docker:

```bash
docker exec -i glpi-11-db-1 mysql -u [seu_usuario_novo] -p[sua_senha_nova] [nome_do_banco_novo] < glpi_antigo_backup.sql

```

*Atenção:* O nome do contentor (`glpi-11-db-1`) deve ser ajustado exatamente para o nome real que aparece quando executa o comando `docker compose ps`.

**2. Restaurar os Arquivos Anexos:**
No ficheiro `docker-compose.yml`, os volumes persistentes foram mapeados na pasta local `./storage/glpi`. Extraia o conteúdo do seu `glpi_files_backup.tar.gz` diretamente dentro deste diretório do host:

```bash
tar -xzvf glpi_files_backup.tar.gz -C ./storage/glpi/

```

**3. Corrigir as permissões de acesso:**
Como foram colados ficheiros novos vindos de outro servidor, os erros de `Permission denied` no painel do GLPI podem acontecer se o proprietário não for ajustado. Force o ID do utilizador padrão do contentor (Geralmente `www-data` -> 33:33):

```bash
sudo chown -R 33:33 ./storage/glpi
sudo chmod -R 775 ./storage/glpi

```

---

### 🔹 Passo 3: Atualizar o GLPI (Se as versões forem diferentes)

Se o seu GLPI antigo era, por exemplo, de uma versão anterior como a `10.0.x` e o novo ambiente Docker foi implantado com a versão `11.x` (latest), o sistema necessitará de uma atualização estrutural no banco de dados.

1. Aceda à URL do seu GLPI novo através do navegador.
2. O sistema detetará automaticamente que o banco de dados pertence a uma versão anterior e exibirá um botão escrito **"Atualizar"** (em vez de instalar do zero).
3. Clique em **Atualizar** e siga o assistente web até ao final. O próprio GLPI executará as queries necessárias para adequar o esquema do banco antigo à versão nova.

---

## 🛠️ Bônus: Scripts Úteis para Auditoria do GLPI Agent

Se está a gerir a implantação automatizada dos agentes de inventário nas estações de trabalho Windows, utilize estes comandos rápidos diretamente pelo Prompt de Comando (CMD) como **Administrador** para validação e testes:

### 1. Verificar as chaves de registo do Agente no Windows

Para verificar quais servidores, portas, tags e configurações de debug estão atualmente aplicadas no registo local da máquina:

```cmd
reg query HKEY_LOCAL_MACHINE\SOFTWARE\GLPI-Agent /s

```

### 2. Forçar a execução/reconfiguração manual do script VBS

Para testar a implantação ou forçar a atualização imediata das configurações locais do ficheiro `agent.cfg` através do script automatizado, execute:

```cmd
cscript "C:\GLPI\glpi-agent-deployment.vbs"

```

```

```