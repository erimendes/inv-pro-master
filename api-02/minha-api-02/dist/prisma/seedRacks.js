"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRacks = seedRacks;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.resolve(__dirname, "data", "racks.csv");
const toStr = (v) => {
    const s = String(v || "").trim();
    return s === "" ? null : s;
};
const toIntCapacidade = (v) => {
    const limpo = String(v || "").replace(/\D/g, "");
    const num = parseInt(limpo, 10);
    return isNaN(num) ? 42 : num;
};
function parseCsv(file) {
    return new Promise((resolve, reject) => {
        const results = [];
        if (!fs_1.default.existsSync(file))
            return reject(new Error("CSV de Racks não encontrado: " + file));
        fs_1.default.createReadStream(file)
            .pipe((0, csv_parser_1.default)({ separator: ";" }))
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
async function seedRacks(prisma) {
    console.log("🗄️ Iniciando a importação de Racks do DataCenter...");
    const rows = await parseCsv(filePath);
    let success = 0;
    let fail = 0;
    for (const row of rows) {
        const nome = toStr(row.nome);
        if (!nome) {
            fail++;
            continue;
        }
        try {
            const capacidadeNum = toIntCapacidade(row.capacidade);
            await prisma.rack.upsert({
                where: { nome },
                update: {
                    localizacao: toStr(row.localizacao),
                    capacidade: capacidadeNum,
                },
                create: {
                    nome,
                    localizacao: toStr(row.localizacao),
                    capacidade: capacidadeNum,
                    corredor: null,
                    observacoes: "Carga automatizada via script de infraestrutura",
                },
            });
            success++;
        }
        catch (e) {
            fail++;
            console.error(`❌ Erro ao salvar o [${nome}]: ${e.message}`);
        }
    }
    console.log(`\n🏁 --- RESUMO DA CARGA DE RACKS ---`);
    console.log(`✅ Racks criados/atualizados: ${success}`);
    if (fail > 0) {
        console.warn(`⚠️ Falhas encontradas: ${fail}`);
    }
}
//# sourceMappingURL=seedRacks.js.map