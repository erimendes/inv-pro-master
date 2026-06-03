"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineExtension = exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.NullableJsonNullValueInput = exports.SortOrder = exports.AplicacaoScalarFieldEnum = exports.ConfigRedeScalarFieldEnum = exports.AtivoScalarFieldEnum = exports.RackScalarFieldEnum = exports.AuditLogScalarFieldEnum = exports.SessionScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
const runtime = __importStar(require("@prisma/client/runtime/client"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "7.8.0",
    engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    Session: 'Session',
    AuditLog: 'AuditLog',
    Rack: 'Rack',
    Ativo: 'Ativo',
    ConfigRede: 'ConfigRede',
    Aplicacao: 'Aplicacao'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UserScalarFieldEnum = {
    id: 'id',
    username: 'username',
    email: 'email',
    password: 'password',
    name: 'name',
    authProvider: 'authProvider',
    role: 'role',
    departamento: 'departamento',
    ultimoLogin: 'ultimoLogin',
    ativo: 'ativo',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
};
exports.SessionScalarFieldEnum = {
    id: 'id',
    refreshToken: 'refreshToken',
    userId: 'userId',
    userAgent: 'userAgent',
    ip: 'ip',
    revoked: 'revoked',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
};
exports.AuditLogScalarFieldEnum = {
    id: 'id',
    action: 'action',
    module: 'module',
    entityId: 'entityId',
    oldData: 'oldData',
    newData: 'newData',
    userId: 'userId',
    ip: 'ip',
    createdAt: 'createdAt'
};
exports.RackScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    localizacao: 'localizacao',
    corredor: 'corredor',
    capacidade: 'capacidade',
    observacoes: 'observacoes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
};
exports.AtivoScalarFieldEnum = {
    id: 'id',
    patrimonio: 'patrimonio',
    tipo: 'tipo',
    fabricante: 'fabricante',
    hardware: 'hardware',
    modelo: 'modelo',
    serial: 'serial',
    hostname: 'hostname',
    apelido: 'apelido',
    descricao: 'descricao',
    tag: 'tag',
    ipPrincipal: 'ipPrincipal',
    sistemaOperacional: 'sistemaOperacional',
    versaoSO: 'versaoSO',
    cpu: 'cpu',
    nucleosCPU: 'nucleosCPU',
    threadsCPU: 'threadsCPU',
    ram: 'ram',
    armazenamento: 'armazenamento',
    gpu: 'gpu',
    macAddress: 'macAddress',
    status: 'status',
    powerState: 'powerState',
    criticidade: 'criticidade',
    emUso: 'emUso',
    monitorado: 'monitorado',
    dataCompra: 'dataCompra',
    garantiaFim: 'garantiaFim',
    valor: 'valor',
    fornecedor: 'fornecedor',
    observacoes: 'observacoes',
    isVirtualizado: 'isVirtualizado',
    hypervisor: 'hypervisor',
    vmId: 'vmId',
    cluster: 'cluster',
    datacenter: 'datacenter',
    hostFisicoId: 'hostFisicoId',
    userId: 'userId',
    rackId: 'rackId',
    posicaoRack: 'posicaoRack',
    tamanhoU: 'tamanhoU',
    glpiId: 'glpiId',
    glpiLastSync: 'glpiLastSync',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
};
exports.ConfigRedeScalarFieldEnum = {
    id: 'id',
    ipAddress: 'ipAddress',
    macAddress: 'macAddress',
    gateway: 'gateway',
    mascara: 'mascara',
    dns: 'dns',
    vlan: 'vlan',
    interface: 'interface',
    velocidade: 'velocidade',
    portasUTP: 'portasUTP',
    portasFibra: 'portasFibra',
    storageConectado: 'storageConectado',
    discoStorage: 'discoStorage',
    ativoId: 'ativoId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.AplicacaoScalarFieldEnum = {
    id: 'id',
    nome: 'nome',
    sigla: 'sigla',
    descricao: 'descricao',
    categoria: 'categoria',
    criticidade: 'criticidade',
    businessOwner: 'businessOwner',
    responsavelTecnico: 'responsavelTecnico',
    contatoFuncional: 'contatoFuncional',
    fornecedor: 'fornecedor',
    url: 'url',
    repositorio: 'repositorio',
    documentacao: 'documentacao',
    janelaOperacao: 'janelaOperacao',
    backupInfo: 'backupInfo',
    procedimentoRecup: 'procedimentoRecup',
    pontoUnicoFalha: 'pontoUnicoFalha',
    tecnologiaPrincipal: 'tecnologiaPrincipal',
    databaseInfo: 'databaseInfo',
    integracoes: 'integracoes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map