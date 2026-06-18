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
    console.log("🖥️ Importando VMs e mapeando Hypervisors...");
    const rows = await parseCsv(filePath);
    let success = 0;
    let fail = 0;
    let hypervisorsUpdated = 0;
    for (const row of rows) {
        const hostname = toStr(row.hostname);
        if (!hostname) {
            fail++;
            continue;
        }
        try {
            const hostnameServidorStr = toStr(row.hostnameServidor);
            const hardwareStr = toStr(row.hardware) || "";
            let hostIdValue = null;
            if (hostnameServidorStr) {
                const host = await prisma.ativo.findUnique({
                    where: { hostname: hostnameServidorStr },
                    select: { id: true, tipo: true },
                });
                if (!host) {
                    console.warn(`⚠️ Host Pai [${hostnameServidorStr}] especificado no CSV não foi encontrado no banco.`);
                }
                else {
                    hostIdValue = host.id;
                    if (hardwareStr.toLowerCase().includes("hyper-v")) {
                        await prisma.ativo.update({
                            where: { id: host.id },
                            data: { hypervisor: "HYPERV" },
                        });
                        console.log(`🛡️ Host Pai [${hostnameServidorStr}] atualizado para hypervisor: HYPERV`);
                        hypervisorsUpdated++;
                    }
                }
            }
            const patrimonioVirtual = `VM-${hostname}`;
            await prisma.ativo.upsert({
                where: { hostname },
                update: {
                    hardware: hardwareStr || "Virtualizado",
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: client_1.AtivoTipo.SERVIDOR_VIRTUAL,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    observacoes: toStr(row.observacoes),
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    isVirtualizado: toBool(row.isVirtualizado) || true,
                    hostFisicoId: hostIdValue,
                    tamanhoU: 0,
                    posicaoRack: null,
                    rackId: null,
                    fabricante: "Virtual",
                    modelo: "Virtual Machine",
                    serial: null,
                    valor: 0,
                    dataCompra: null,
                },
                create: {
                    hostname,
                    patrimonio: patrimonioVirtual,
                    hardware: hardwareStr || "Virtualizado",
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: client_1.AtivoTipo.SERVIDOR_VIRTUAL,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    observacoes: toStr(row.observacoes),
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    isVirtualizado: toBool(row.isVirtualizado) || true,
                    hostFisicoId: hostIdValue,
                    tamanhoU: 0,
                    posicaoRack: null,
                    rackId: null,
                    fabricante: "Virtual",
                    modelo: "Virtual Machine",
                    serial: null,
                    valor: 0,
                    dataCompra: null,
                },
            });
            success++;
        }
        catch (e) {
            fail++;
            console.error(`❌ Erro na VM [${hostname}]: ${e.message}`);
        }
    }
    console.log(`\n🏁 --- RESUMO DA CARGA ---`);
    console.log(`✅ VMs processadas com sucesso: ${success}`);
    console.log(`🛡️ Hosts físicos marcados como HYPERV: ${hypervisorsUpdated}`);
    if (fail > 0) {
        console.warn(`⚠️ Houve ${fail} falha(s) durante o processo.`);
        throw new Error(`Seed VMs finalizou com erros pendentes.`);
    }
}
//# sourceMappingURL=seedVMs.js.map