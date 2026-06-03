-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'SUPER_USER', 'MANAGER');

-- CreateEnum
CREATE TYPE "AtivoTipo" AS ENUM ('LAPTOP', 'DESKTOP', 'SERVIDOR_FISICO', 'SERVIDOR_VIRTUAL', 'SWITCH', 'ROTEADOR', 'STORAGE', 'FIREWALL', 'ACCESS_POINT', 'IMPRESSORA', 'MONITOR', 'NOBREAK');

-- CreateEnum
CREATE TYPE "AtivoStatus" AS ENUM ('DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "PowerState" AS ENUM ('ON', 'OFF', 'SUSPENDED', 'PAUSED');

-- CreateEnum
CREATE TYPE "SistemaCategoria" AS ENUM ('ADMINISTRATIVO', 'OPERACIONAL', 'MONITORAMENTO', 'DEVOPS', 'SEGURANCA');

-- CreateEnum
CREATE TYPE "Criticidade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "HypervisorTipo" AS ENUM ('VMWARE', 'HYPERV', 'PROXMOX', 'KVM', 'XEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "departamento" TEXT,
    "ultimoLogin" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "userId" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rack" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT,
    "corredor" TEXT,
    "capacidade" INTEGER NOT NULL DEFAULT 42,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Rack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ativo" (
    "id" SERIAL NOT NULL,
    "patrimonio" TEXT,
    "tipo" "AtivoTipo" NOT NULL DEFAULT 'LAPTOP',
    "fabricante" TEXT,
    "hardware" TEXT,
    "modelo" TEXT,
    "serial" TEXT,
    "hostname" TEXT,
    "apelido" TEXT,
    "descricao" TEXT,
    "tag" TEXT,
    "ipPrincipal" TEXT,
    "sistemaOperacional" TEXT,
    "versaoSO" TEXT,
    "cpu" TEXT,
    "nucleosCPU" INTEGER,
    "threadsCPU" INTEGER,
    "ram" TEXT,
    "armazenamento" TEXT,
    "gpu" TEXT,
    "macAddress" TEXT,
    "status" "AtivoStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "powerState" "PowerState",
    "criticidade" "Criticidade" NOT NULL DEFAULT 'MEDIA',
    "emUso" BOOLEAN NOT NULL DEFAULT true,
    "monitorado" BOOLEAN NOT NULL DEFAULT true,
    "dataCompra" TIMESTAMP(3),
    "garantiaFim" TIMESTAMP(3),
    "valor" DECIMAL(10,2),
    "fornecedor" TEXT,
    "observacoes" TEXT,
    "isVirtualizado" BOOLEAN NOT NULL DEFAULT false,
    "hypervisor" "HypervisorTipo",
    "vmId" TEXT,
    "cluster" TEXT,
    "datacenter" TEXT,
    "hostFisicoId" INTEGER,
    "userId" TEXT,
    "rackId" TEXT,
    "posicaoRack" INTEGER,
    "tamanhoU" INTEGER,
    "glpiId" INTEGER,
    "glpiLastSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Ativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigRede" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "gateway" TEXT,
    "mascara" TEXT,
    "dns" TEXT,
    "vlan" INTEGER,
    "interface" TEXT,
    "velocidade" TEXT,
    "portasUTP" INTEGER,
    "portasFibra" INTEGER,
    "storageConectado" TEXT,
    "discoStorage" TEXT,
    "ativoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigRede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aplicacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT,
    "descricao" TEXT,
    "categoria" "SistemaCategoria" NOT NULL DEFAULT 'OPERACIONAL',
    "criticidade" "Criticidade" NOT NULL DEFAULT 'MEDIA',
    "businessOwner" TEXT,
    "responsavelTecnico" TEXT,
    "contatoFuncional" TEXT,
    "fornecedor" TEXT,
    "url" TEXT,
    "repositorio" TEXT,
    "documentacao" TEXT,
    "janelaOperacao" TEXT,
    "backupInfo" TEXT,
    "procedimentoRecup" TEXT,
    "pontoUnicoFalha" TEXT,
    "tecnologiaPrincipal" TEXT,
    "databaseInfo" TEXT,
    "integracoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Aplicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppServidores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AppServidores_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE UNIQUE INDEX "Rack_nome_key" ON "Rack"("nome");

-- CreateIndex
CREATE INDEX "Rack_nome_idx" ON "Rack"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Ativo_serial_key" ON "Ativo"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Ativo_hostname_key" ON "Ativo"("hostname");

-- CreateIndex
CREATE INDEX "Ativo_hostname_idx" ON "Ativo"("hostname");

-- CreateIndex
CREATE INDEX "Ativo_serial_idx" ON "Ativo"("serial");

-- CreateIndex
CREATE INDEX "Ativo_tipo_idx" ON "Ativo"("tipo");

-- CreateIndex
CREATE INDEX "Ativo_status_idx" ON "Ativo"("status");

-- CreateIndex
CREATE INDEX "Ativo_powerState_idx" ON "Ativo"("powerState");

-- CreateIndex
CREATE INDEX "Ativo_rackId_idx" ON "Ativo"("rackId");

-- CreateIndex
CREATE INDEX "Ativo_hostFisicoId_idx" ON "Ativo"("hostFisicoId");

-- CreateIndex
CREATE INDEX "Ativo_userId_idx" ON "Ativo"("userId");

-- CreateIndex
CREATE INDEX "Ativo_glpiId_idx" ON "Ativo"("glpiId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigRede_macAddress_key" ON "ConfigRede"("macAddress");

-- CreateIndex
CREATE INDEX "ConfigRede_ipAddress_idx" ON "ConfigRede"("ipAddress");

-- CreateIndex
CREATE INDEX "ConfigRede_ativoId_idx" ON "ConfigRede"("ativoId");

-- CreateIndex
CREATE UNIQUE INDEX "Aplicacao_sigla_key" ON "Aplicacao"("sigla");

-- CreateIndex
CREATE INDEX "Aplicacao_nome_idx" ON "Aplicacao"("nome");

-- CreateIndex
CREATE INDEX "Aplicacao_categoria_idx" ON "Aplicacao"("categoria");

-- CreateIndex
CREATE INDEX "_AppServidores_B_index" ON "_AppServidores"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ativo" ADD CONSTRAINT "Ativo_hostFisicoId_fkey" FOREIGN KEY ("hostFisicoId") REFERENCES "Ativo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ativo" ADD CONSTRAINT "Ativo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ativo" ADD CONSTRAINT "Ativo_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigRede" ADD CONSTRAINT "ConfigRede_ativoId_fkey" FOREIGN KEY ("ativoId") REFERENCES "Ativo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppServidores" ADD CONSTRAINT "_AppServidores_A_fkey" FOREIGN KEY ("A") REFERENCES "Aplicacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppServidores" ADD CONSTRAINT "_AppServidores_B_fkey" FOREIGN KEY ("B") REFERENCES "Ativo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
