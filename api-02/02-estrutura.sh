#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="minha-api-02"

# Cores e Estilos
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}==> $1${NC}"; }

echo -e "${BLUE}🚀 INICIANDO SETUP: $PROJECT_NAME${NC}"

cd "$PROJECT_NAME"

echo "🚀 Criando estrutura NestJS simplificada..."

# =========================================================
# ROOT
# =========================================================

touch .env.example
touch .gitignore
touch README.md

# =========================================================
# CONFIG
# =========================================================

mkdir -p src/config

touch src/config/configuration.ts

# =========================================================
# COMMON
# =========================================================

mkdir -p \
src/common/decorators \
src/common/guards \
src/common/interceptors \
src/common/filters

touch src/common/decorators/roles.decorator.ts

touch src/common/guards/jwt-auth.guard.ts
touch src/common/guards/roles.guard.ts

touch src/common/interceptors/logging.interceptor.ts

touch src/common/filters/http-exception.filter.ts

# =========================================================
# MODULE GENERATOR
# =========================================================

create_module() {

  MODULE=$1

  echo "📦 Criando módulo: $MODULE"

  mkdir -p \
  src/modules/$MODULE \
  src/modules/$MODULE \
  src/modules/$MODULE/dto \
  src/modules/$MODULE/repositories
}

# =========================================================
# MODULES
# =========================================================

mkdir -p src/modules

create_module auth
create_module users
create_module applications
create_module assets
create_module racks
create_module inventory
create_module network
create_module licensing
create_module glpi

# =========================================================
# AUTH EXTRA
# =========================================================

mkdir -p \
src/modules/auth/strategies

# =========================================================
# GLPI EXTRA
# =========================================================

mkdir -p src/modules/glpi


# =========================================================
# FINAL
# =========================================================

echo ""
echo "✅ Estrutura NestJS criada com sucesso!"
echo ""
echo "🔥 Estrutura:"
echo "✔ Modules"
echo "✔ Controllers"
echo "✔ Services"
echo "✔ DTOs"
echo "✔ Repositories"
echo "✔ Prisma"
echo "✔ Auth"
echo "✔ GLPI"
echo ""