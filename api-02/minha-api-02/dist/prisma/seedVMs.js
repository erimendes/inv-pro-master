"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedVMs = seedVMs;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const path_1 = __importDefault(require("path"));
const client_1 = require("../generated/prisma/client");
const filePath = path_1.default.resolve(__dirname, "data", "vms.csv");
const toStr = (v) => {
    const s = String(v || "").trim();
    return s === "" ? null : s;
};
const toBool = (v) => {
    const s = String(v || "").toLowerCase();
    return s === "true" || s === "1";
};
function parseCsv(file) {
    return new Promise((resolve, reject) => {
        const results = [];
        if (!fs_1.default.existsSync(file))
            return reject(new Error("CSV não encontrado: " + file));
        fs_1.default.createReadStream(file)
            .pipe((0, csv_parser_1.default)({ separator: ";" }))
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
async function seedVMs(prisma) {
    console.log("🖥️ Importando VMs...");
    const rows = await parseCsv(filePath);
    let success = 0;
    let fail = 0;
    for (const row of rows) {
        const hostname = toStr(row.hostname);
        if (!hostname) {
            fail++;
            continue;
        }
        try {
            const hostHostnameStr = toStr(row.hostHostname);
            let hostIdValue = null;
            if (hostHostnameStr) {
                const host = await prisma.ativo.findUnique({
                    where: { hostname: hostHostnameStr },
                    select: { id: true, tipo: true },
                });
                if (!host) {
                    console.warn(`⚠️ Host [${hostHostnameStr}] não encontrado.`);
                }
                else {
                    hostIdValue = host.id;
                }
            }
            await prisma.ativo.upsert({
                where: { hostname },
                update: {
                    hardware: toStr(row.hardware),
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: client_1.AtivoTipo.SERVIDOR_VIRTUAL,
                    tamanhoU: 0,
                    posicaoRack: null,
                    rackId: null,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    apelido: toStr(row.apelido),
                    patrimonio: toStr(row.patrimonio),
                    serial: toStr(row.serial),
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    isVirtualizado: toBool(row.isVirtualizado),
                    hostFisicoId: hostIdValue,
                },
                create: {
                    hostname,
                    hardware: toStr(row.hardware),
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: client_1.AtivoTipo.SERVIDOR_VIRTUAL,
                    tamanhoU: 0,
                    posicaoRack: null,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    apelido: toStr(row.apelido),
                    patrimonio: toStr(row.patrimonio),
                    serial: toStr(row.serial),
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    isVirtualizado: toBool(row.isVirtualizado),
                    hostFisicoId: hostIdValue,
                },
            });
            success++;
        }
        catch (e) {
            fail++;
            console.error(`❌ Erro na VM [${hostname}]: ${e.message}`);
        }
    }
    if (fail > 0)
        throw new Error(`Seed VMs falhou com ${fail} erros`);
    console.log(`🏁 VMs: ${success} sucessos`);
}
//# sourceMappingURL=seedVMs.js.map