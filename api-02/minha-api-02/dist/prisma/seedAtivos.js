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
            return reject(new Error("Arquivo CSV de Ativos não encontrado em: " + file));
        fs_1.default.createReadStream(file)
            .pipe((0, csv_parser_1.default)({ separator: ";" }))
            .on("data", (data) => results.push(data))
            .on("error", reject)
            .on("end", () => resolve(results));
    });
}
async function seedAtivos(prisma) {
    console.log("📦 Iniciando a importação de ativos físicos...");
    const rows = await parseCsv(filePath);
    console.log(`📄 CSV lido com sucesso: ${rows.length} registros encontrados.`);
    let success = 0;
    let fail = 0;
    for (const row of rows) {
        const hostnameValue = toStr(row.hostname);
        if (!hostnameValue) {
            continue;
        }
        try {
            const tipoAtivo = row.tipo || client_1.AtivoTipo.SERVIDOR_FISICO;
            const isVM = tipoAtivo === client_1.AtivoTipo.SERVIDOR_VIRTUAL;
            const ehVirtualOuMovel = isVM ||
                tipoAtivo === client_1.AtivoTipo.LAPTOP ||
                tipoAtivo === client_1.AtivoTipo.MONITOR;
            const nomeRack = ehVirtualOuMovel ? null : toStr(row.rack);
            const posRack = ehVirtualOuMovel ? null : toInt(row.posicaoRack);
            const tamU = isVM ? 0 : (toInt(row.tamanhoU) ?? 1);
            let rackIdReal = null;
            if (nomeRack) {
                const rackEncontrado = await prisma.rack.findUnique({
                    where: { nome: nomeRack },
                    select: { id: true }
                });
                if (rackEncontrado) {
                    rackIdReal = rackEncontrado.id;
                }
                else {
                    console.warn(`⚠️ Rack [${nomeRack}] não foi pré-cadastrado no sistema. O ativo [${hostnameValue}] será salvo sem rack.`);
                }
            }
            const fabricanteFinal = isVM ? "Virtual" : "Mapeado via CSV";
            const modeloFinal = isVM ? "Virtual Machine" : toStr(row.hardware);
            const patrimonioFinal = isVM ? `VM-${hostnameValue}` : toStr(row.patrimonio);
            const serialFinal = isVM ? null : toStr(row.serial);
            await prisma.ativo.upsert({
                where: { hostname: hostnameValue },
                update: {
                    hardware: toStr(row.hardware),
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: tipoAtivo,
                    tamanhoU: tamU,
                    posicaoRack: posRack,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    apelido: toStr(row.apelido) || toStr(row.oQueRoda),
                    patrimonio: patrimonioFinal,
                    serial: serialFinal,
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    observacoes: toStr(row.observacoes),
                    isVirtualizado: isVM ? true : toBool(row.isVirtualizado),
                    fabricante: fabricanteFinal,
                    modelo: modeloFinal,
                    rackId: rackIdReal,
                },
                create: {
                    hostname: hostnameValue,
                    hardware: toStr(row.hardware),
                    ipPrincipal: toStr(row.ipPrincipal),
                    tipo: tipoAtivo,
                    tamanhoU: tamU,
                    posicaoRack: posRack,
                    sistemaOperacional: toStr(row.sistemaOperacional),
                    apelido: toStr(row.apelido) || toStr(row.oQueRoda),
                    patrimonio: patrimonioFinal,
                    serial: serialFinal,
                    cpu: toStr(row.cpu),
                    ram: toStr(row.ram),
                    armazenamento: toStr(row.armazenamento),
                    observacoes: toStr(row.observacoes),
                    isVirtualizado: isVM ? true : toBool(row.isVirtualizado),
                    fabricante: fabricanteFinal,
                    modelo: modeloFinal,
                    status: "EM_USO",
                    emUso: true,
                    valor: 0,
                    rackId: rackIdReal,
                },
            });
            success++;
        }
        catch (e) {
            fail++;
            console.error(`❌ Falha crítica ao processar o ativo [${hostnameValue}]: ${e.message}`);
        }
    }
    console.log(`\n🏁 --- RESUMO DO SEED DE ATIVOS ---`);
    console.log(`✅ Sucessos salvos no banco: ${success}`);
    console.log(`❌ Falhas de processamento: ${fail}`);
}
//# sourceMappingURL=seedAtivos.js.map