"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAtivos = seedAtivos;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const client_1 = require("../generated/prisma/client");
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.resolve(__dirname, "data", "ativos.csv");
const toStr = (v) => {
    const s = String(v || "").trim();
    return s === "" ? null : s;
};
const toBool = (v) => {
    const s = String(v || "").toLowerCase();
    return s === "true" || s === "1";
};
const toInt = (v) => {
    const n = parseInt(v);
    return isNaN(n) ? null : n;
};
function parseCsv(file) {
    return new Promise((resolve, reject) => {
        const results = [];
        if (!fs_1.default.existsSync(file))
            return reject(new Error("Arquivo CSV não encontrado."));
        fs_1.default.createReadStream(file)
            .pipe((0, csv_parser_1.default)({ separator: ";" }))
            .on("data", (data) => results.push(data))
            .on("error", reject)
            .on("end", () => resolve(results));
    });
}
async function seedAtivos(prisma) {
    console.log("📦 Importando ativos...");
    const rows = await parseCsv(filePath);
    console.log(`📄 CSV lido: ${rows.length} registros.`);
    let success = 0;
    let fail = 0;
    for (const row of rows) {
        const hostnameValue = toStr(row.hostname);
        if (!hostnameValue)
            continue;
        try {
            const tipoAtivo = row.tipo || client_1.AtivoTipo.SERVIDOR_FISICO;
            const ehVirtualOuMovel = tipoAtivo === client_1.AtivoTipo.SERVIDOR_VIRTUAL ||
                tipoAtivo === client_1.AtivoTipo.LAPTOP ||
                tipoAtivo === client_1.AtivoTipo.MONITOR;
            const rId = ehVirtualOuMovel ? null : toStr(row.rackId);
            const posRack = ehVirtualOuMovel ? null : toInt(row.posicaoRack);
            const tamU = tipoAtivo === client_1.AtivoTipo.SERVIDOR_VIRTUAL ? 0 : (toInt(row.tamanhoU) ?? 1);
            await prisma.ativo.upsert({
                where: { hostname: hostnameValue },
                update: {
                    hardware: toStr(row.hardware),
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: tipoAtivo,
                    tamanhoU: tamU,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    apelido: toStr(row.apelido),
                    patrimonio: toStr(row.patrimonio),
                    serial: toStr(row.serial),
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    isVirtualizado: toBool(row.isVirtualizado),
                    posicaoRack: posRack,
                    rack: rId ? { connect: { id: rId } } : { disconnect: true },
                },
                create: {
                    hostname: hostnameValue,
                    hardware: toStr(row.hardware),
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: tipoAtivo,
                    tamanhoU: tamU,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    apelido: toStr(row.apelido),
                    patrimonio: toStr(row.patrimonio),
                    serial: toStr(row.serial),
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    isVirtualizado: toBool(row.isVirtualizado),
                    posicaoRack: posRack,
                    rack: rId ? { connect: { id: rId } } : undefined,
                },
            });
            success++;
        }
        catch (e) {
            fail++;
            console.error(`❌ Erro na Fase 1 do ativo [${hostnameValue}]: ${e.message}`);
        }
    }
    console.log("🔗 Vinculando Máquinas Virtuais aos Hosts...");
    for (const row of rows) {
        const parentHostname = toStr(row.hostFisicoHostname);
        const hostnameValue = toStr(row.hostname);
        if (parentHostname && hostnameValue) {
            try {
                const hostAtivo = await prisma.ativo.findUnique({
                    where: { hostname: parentHostname },
                    select: { id: true, tipo: true }
                });
                if (!hostAtivo) {
                    console.warn(`⚠️ Host [${parentHostname}] não encontrado no banco. Pulando VM [${hostnameValue}].`);
                    continue;
                }
                if (hostAtivo.tipo !== client_1.AtivoTipo.SERVIDOR_FISICO) {
                    console.warn(`⚠️ O ativo [${parentHostname}] foi achado, mas não é um SERVIDOR_FISICO. Falha de integridade.`);
                    continue;
                }
                await prisma.ativo.update({
                    where: { hostname: hostnameValue },
                    data: {
                        host: { connect: { id: hostAtivo.id } }
                    }
                });
            }
            catch (e) {
                console.error(`❌ Erro ao vincular a VM [${hostnameValue}] ao host [${parentHostname}]: ${e.message}`);
            }
        }
    }
    console.log(`\n🏁 Resultado Final: ${success} sucessos, ${fail} falhas.`);
}
//# sourceMappingURL=seedAtivos.js.map