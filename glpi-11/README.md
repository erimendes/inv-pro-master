Pagina GLPI
https://help.glpi-project.org/tutorials/procedures/running_glpi_on_docker

Para migrar o seu GLPI antigo (seja ele uma instalação antiga em um servidor físico ou outra versão) para o seu novo ambiente em Docker, você precisa mover essencialmente **duas coisas**: o **Banco de Dados (SQL)** e os **Arquivos de Mídia/Configuração (pastas do sistema)**.

Aqui está exatamente o que você precisa copiar e o passo a passo de como fazer esse processo:

---

### 📋 O que você precisa copiar (Os Dados Essenciais)

1. **O Banco de Dados (Dump SQL):** Contém todos os seus chamados, usuários, inventário, bases de conhecimento e configurações.
2. **A pasta `files` (Arquivos anexos):** É aqui que ficam guardados todos os PDFs, imagens e documentos que os usuários anexaram nos chamados ao longo dos anos. **Se não copiar isso, os chamados antigos ficarão sem os anexos.**
3. **A pasta `plugins` (Opcional):** Se você usava plugins específicos no GLPI antigo, precisará deles. *Dica: É melhor baixar as versões atualizadas e compatíveis com o GLPI novo do que copiar a pasta antiga bruta.*

---

### 🚀 Como fazer a migração (Passo a Passo)

#### Passo 1: No GLPI ANTIGO (Exportar os dados)

**1. Gerar o Backup do Banco de Dados:**
Acesse o terminal do seu servidor antigo e rode o comando `mysqldump` para exportar o banco atual:

```bash
mysqldump -u [usuario_do_banco] -p [nome_do_banco_antigo] > glpi_antigo_backup.sql

```

*(Se o banco antigo também estiver em Docker, use: `docker exec -i [nome_do_container_db] mysqldump -u... > glpi_antigo_backup.sql`)*

**2. Compactar os arquivos anexos:**
Vá até o diretório do seu GLPI antigo (geralmente em `/var/www/html/glpi/` ou `/var/www/glpi/`) e compacte a pasta `files`:

```bash
tar -czvf glpi_files_backup.tar.gz /var/www/html/glpi/files

```

Transfira esses dois arquivos gerados (`glpi_antigo_backup.sql` e `glpi_files_backup.tar.gz`) para o seu novo servidor onde o Docker Compose está rodando.

---

#### Passo 2: No GLPI NOVO com Docker (Importar os dados)

Certifique-se de que seus containers novos estão rodando (`docker compose up -d`).

**1. Importar o Banco de Dados para o container MySQL:**
Envie o arquivo `.sql` diretamente para dentro do banco de dados do Docker:

```bash
docker exec -i glpi-11-db-1 mysql -u [seu_usuario_novo] -p[sua_senha_nova] [nome_do_banco_novo] < glpi_antigo_backup.sql

```

*Atenção: O nome do container (`glpi-11-db-1`) deve ser o mesmo que aparece quando você roda `docker compose ps`.*

**2. Restaurar os Arquivos Anexos:**
Lembra que no seu `docker-compose.yml` nós mapeamos a pasta `./storage/glpi`? O container do GLPI joga a estrutura dele ali dentro.

Extraia o conteúdo do seu `glpi_files_backup.tar.gz` diretamente dentro da pasta correspondente no seu host (normalmente vai ficar em `./storage/glpi/files` ou dependendo de como a imagem organiza, dentro de `./storage/glpi/`).

```bash
tar -xzvf glpi_files_backup.tar.gz -C ./storage/glpi/

```

**3. Corrigir as permissões novamente:**
Como você acabou de colar arquivos novos vindos de outro servidor, o erro de `Permission denied` pode voltar se você não ajustar o dono deles. Rode o comando que funcionou para o usuário do container:

```bash
sudo chown -R 33:33 ./storage/glpi
sudo chmod -R 775 ./storage/glpi

```

---

#### Passo 3: Atualizar o GLPI (Se as versões forem diferentes)

Se o seu GLPI antigo era, por exemplo, a versão `10.0.x` e você subiu o Docker com a versão `11.x` (latest), o sistema não vai abrir direto de primeira porque o banco de dados antigo precisa ser atualizado para o formato novo.

1. Acesse a URL do seu GLPI novo no navegador.
2. O sistema detectará automaticamente que o banco de dados pertence a uma versão anterior e exibirá um botão escrito **"Atualizar"** (em vez de Instalar).
3. Clique em **Atualizar** e siga o assistente web até o final. O GLPI vai rodar os scripts necessários para adequar o banco antigo à versão nova.