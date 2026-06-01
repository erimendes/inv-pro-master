#!/bin/bash

set -e

echo "🚀 Criando estrutura enterprise NestJS..."

# =========================================================
# ROOT
# =========================================================

mkdir -p src
mkdir -p prisma
mkdir -p generated
mkdir -p scripts
mkdir -p test
mkdir -p docker
mkdir -p .github/workflows
mkdir -p k8s

touch src/main.ts
touch src/app.module.ts

touch .env
touch .env.example
touch .gitignore
touch README.md
touch docker-compose.yml
touch Dockerfile
touch .dockerignore

touch prisma/schema.prisma

touch scripts/seed.ts
touch scripts/sync-criar-banco.ts

touch test/app.e2e-spec.ts

# =========================================================
# CONFIG
# =========================================================

mkdir -p src/config/env

touch src/config/env/configuration.ts
touch src/config/env/validation.schema.ts

# =========================================================
# COMMON
# =========================================================

mkdir -p \
src/common/decorators \
src/common/guards \
src/common/interceptors \
src/common/filters \
src/common/middleware \
src/common/pipes \
src/common/exceptions \
src/common/constants \
src/common/enums \
src/common/interfaces \
src/common/helpers \
src/common/utils

# Decorators
touch src/common/decorators/roles.decorator.ts
touch src/common/decorators/permissions.decorator.ts
touch src/common/decorators/public.decorator.ts
touch src/common/decorators/current-user.decorator.ts

# Guards
touch src/common/guards/jwt-auth.guard.ts
touch src/common/guards/roles.guard.ts
touch src/common/guards/permissions.guard.ts
touch src/common/guards/policies.guard.ts
touch src/common/guards/tenant.guard.ts

# Interceptors
touch src/common/interceptors/logging.interceptor.ts
touch src/common/interceptors/transform.interceptor.ts
touch src/common/interceptors/timeout.interceptor.ts
touch src/common/interceptors/audit.interceptor.ts
touch src/common/interceptors/response.interceptor.ts

# Filters
touch src/common/filters/http-exception.filter.ts

# Middleware
touch src/common/middleware/logger.middleware.ts
touch src/common/middleware/request-id.middleware.ts

# Pipes
touch src/common/pipes/validation.pipe.ts
touch src/common/pipes/parse-id.pipe.ts

# Exceptions
touch src/common/exceptions/business.exception.ts
touch src/common/exceptions/not-found.exception.ts
touch src/common/exceptions/forbidden.exception.ts
touch src/common/exceptions/validation.exception.ts
touch src/common/exceptions/unauthorized.exception.ts

# Constants
touch src/common/constants/roles.constants.ts
touch src/common/constants/permissions.constants.ts

# Enums
touch src/common/enums/user-role.enum.ts

# Interfaces
touch src/common/interfaces/pagination.interface.ts

# Helpers
touch src/common/helpers/pagination.helper.ts

# Utils
touch src/common/utils/date.util.ts
touch src/common/utils/hash.util.ts

# =========================================================
# DATABASE
# =========================================================

mkdir -p src/database/prisma

touch src/database/prisma.module.ts
touch src/database/prisma.service.ts

# =========================================================
# INFRA
# =========================================================

mkdir -p \
src/infra/cache \
src/infra/logger \
src/infra/monitoring \
src/infra/tracing \
src/infra/queue \
src/infra/mail \
src/infra/storage

# Cache
touch src/infra/cache/cache.module.ts
touch src/infra/cache/cache.service.ts
touch src/infra/cache/redis.service.ts
touch src/infra/cache/cache.constants.ts

# Logger
touch src/infra/logger/logger.module.ts
touch src/infra/logger/logger.service.ts
touch src/infra/logger/pino.config.ts
touch src/infra/logger/request-context.ts

# Monitoring
touch src/infra/monitoring/prometheus.service.ts

# Tracing
touch src/infra/tracing/tracing.service.ts

# Queue
touch src/infra/queue/rabbitmq.service.ts

# Mail
touch src/infra/mail/mail.service.ts

# Storage
touch src/infra/storage/storage.service.ts

# =========================================================
# SHARED
# =========================================================

mkdir -p \
src/shared/dto \
src/shared/types \
src/shared/contracts \
src/shared/events \
src/shared/value-objects \
src/shared/kernels

# =========================================================
# MODULE GENERATOR
# =========================================================

create_module() {

  MODULE=$1

  echo "📦 Criando módulo: $MODULE"

  mkdir -p \
  src/modules/$MODULE/presentation/controllers \
  src/modules/$MODULE/presentation/presenters \
  src/modules/$MODULE/presentation/swagger \
  src/modules/$MODULE/application/use-cases \
  src/modules/$MODULE/application/dto \
  src/modules/$MODULE/application/queries \
  src/modules/$MODULE/application/commands \
  src/modules/$MODULE/application/handlers \
  src/modules/$MODULE/domain/entities \
  src/modules/$MODULE/domain/repositories \
  src/modules/$MODULE/domain/services \
  src/modules/$MODULE/domain/events \
  src/modules/$MODULE/domain/value-objects \
  src/modules/$MODULE/infrastructure/prisma \
  src/modules/$MODULE/infrastructure/repositories \
  src/modules/$MODULE/infrastructure/integrations \
  src/modules/$MODULE/infrastructure/cache \
  src/modules/$MODULE/events \
  src/modules/$MODULE/jobs \
  src/modules/$MODULE/queues \
  src/modules/$MODULE/consumers \
  src/modules/$MODULE/producers \
  src/modules/$MODULE/policies \
  src/modules/$MODULE/permissions \
  src/modules/$MODULE/tests

  # Module
  touch src/modules/$MODULE/$MODULE.module.ts

  # Controllers
  touch src/modules/$MODULE/presentation/controllers/create-$MODULE.controller.ts
  touch src/modules/$MODULE/presentation/controllers/list-$MODULE.controller.ts
  touch src/modules/$MODULE/presentation/controllers/find-one-$MODULE.controller.ts
  touch src/modules/$MODULE/presentation/controllers/update-$MODULE.controller.ts
  touch src/modules/$MODULE/presentation/controllers/delete-$MODULE.controller.ts

  # DTO
  touch src/modules/$MODULE/application/dto/create-$MODULE.dto.ts
  touch src/modules/$MODULE/application/dto/update-$MODULE.dto.ts
  touch src/modules/$MODULE/application/dto/filter-$MODULE.dto.ts

  # Use Cases
  touch src/modules/$MODULE/application/use-cases/create-$MODULE.use-case.ts
  touch src/modules/$MODULE/application/use-cases/list-$MODULE.use-case.ts
  touch src/modules/$MODULE/application/use-cases/find-one-$MODULE.use-case.ts
  touch src/modules/$MODULE/application/use-cases/update-$MODULE.use-case.ts
  touch src/modules/$MODULE/application/use-cases/delete-$MODULE.use-case.ts

  # Domain
  touch src/modules/$MODULE/domain/entities/$MODULE.entity.ts
  touch src/modules/$MODULE/domain/repositories/$MODULE.repository.ts
  touch src/modules/$MODULE/domain/services/$MODULE-domain.service.ts

  # Events
  touch src/modules/$MODULE/domain/events/$MODULE-created.event.ts
  touch src/modules/$MODULE/domain/events/$MODULE-updated.event.ts

  # Infra
  touch src/modules/$MODULE/infrastructure/prisma/prisma-$MODULE.mapper.ts
  touch src/modules/$MODULE/infrastructure/repositories/prisma-$MODULE.repository.ts
  touch src/modules/$MODULE/infrastructure/cache/$MODULE.cache.ts

  # Policies
  touch src/modules/$MODULE/policies/$MODULE.policy.ts

  # Permissions
  touch src/modules/$MODULE/permissions/$MODULE.permissions.ts

  # Queues
  touch src/modules/$MODULE/queues/$MODULE.queue.ts

  # Jobs
  touch src/modules/$MODULE/jobs/sync-$MODULE.job.ts

  # Consumers
  touch src/modules/$MODULE/consumers/$MODULE.consumer.ts

  # Producers
  touch src/modules/$MODULE/producers/$MODULE.producer.ts

}

# =========================================================
# MODULES
# =========================================================

mkdir -p src/modules

create_module auth
create_module users
create_module permissions
create_module applications
create_module assets
create_module racks
create_module datacenter
create_module servers
create_module network
create_module licensing
create_module inventory
create_module glpi
create_module sync
create_module audit
create_module notifications
create_module dashboard
create_module reports
create_module monitoring

# =========================================================
# AUTH EXTRA
# =========================================================

mkdir -p \
src/modules/auth/strategies \
src/modules/auth/tokens \
src/modules/auth/sessions

touch src/modules/auth/strategies/jwt.strategy.ts
touch src/modules/auth/strategies/local.strategy.ts
touch src/modules/auth/strategies/refresh.strategy.ts

touch src/modules/auth/tokens/token.service.ts

touch src/modules/auth/sessions/session.service.ts

# =========================================================
# GLPI EXTRA
# =========================================================

mkdir -p \
src/modules/glpi/services \
src/modules/glpi/interfaces

touch src/modules/glpi/services/glpi-api.service.ts
touch src/modules/glpi/services/glpi-sync.service.ts
touch src/modules/glpi/services/glpi-mapper.service.ts
touch src/modules/glpi/services/glpi-reconcile.service.ts

# =========================================================
# DISCOVERY
# =========================================================

mkdir -p \
src/modules/discovery/collectors/snmp \
src/modules/discovery/collectors/wmi \
src/modules/discovery/collectors/ssh \
src/modules/discovery/collectors/vmware \
src/modules/discovery/collectors/proxmox \
src/modules/discovery/collectors/kubernetes \
src/modules/discovery/parsers \
src/modules/discovery/normalizers \
src/modules/discovery/jobs \
src/modules/discovery/queues

touch src/modules/discovery/discovery.module.ts

# =========================================================
# DOCKER
# =========================================================

mkdir -p \
docker/api \
docker/postgres \
docker/redis \
docker/rabbitmq \
docker/nginx

# =========================================================
# K8S
# =========================================================

mkdir -p \
k8s/api \
k8s/workers \
k8s/postgres \
k8s/redis \
k8s/rabbitmq \
k8s/ingress

# =========================================================
# GITHUB ACTIONS
# =========================================================

touch .github/workflows/ci.yml
touch .github/workflows/cd.yml

# =========================================================
# FINAL
# =========================================================

echo ""
echo "✅ Estrutura enterprise criada com sucesso!"
echo ""
echo "🔥 Recursos:"
echo "✔ Clean Architecture"
echo "✔ DDD"
echo "✔ Use Cases"
echo "✔ Repositories"
echo "✔ RBAC"
echo "✔ Policies"
echo "✔ RabbitMQ"
echo "✔ Redis"
echo "✔ Cache"
echo "✔ Docker Ready"
echo "✔ Kubernetes Ready"
echo "✔ GLPI Ready"
echo "✔ Observability Ready"
echo "✔ Microservices Ready"
echo ""