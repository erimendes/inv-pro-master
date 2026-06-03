"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAplicacoes = seedAplicacoes;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const client_1 = require("../generated/prisma/client");
const filePath = path_1.default.resolve(__dirname, "data", "aplicacoes.csv");
const toStr = (v) => {
    const s = String(v || "").trim();
    return s === "" ? null : s;
};
const toEnum = (val, enumObj, defaultValue) => {
    const s = String(val || "").trim().toUpperCase();
    return Object.values(enumObj).includes(s) ? s : defaultValue;
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
async function seedAplicacoes(prisma) {
    console.log("🚀 Iniciando Seed de Aplicações...");
    let rows;
    try {
        rows = await parseCsv(filePath);
    }
    catch (e) {
        console.error(e);
        return;
    }
    let success = 0;
    let fail = 0;
    for (const row of rows) {
        const nomeValue = toStr(row.nome);
        if (!nomeValue) {
            console.warn("⚠️ Pulando linha: Campo 'nome' é obrigatório.");
            fail++;
            continue;
        }
        try {
            const appData = {
                sigla: toStr(row.sigla),
                descricao: toStr(row.descricao),
                categoria: toEnum(row.categoria, client_1.SistemaCategoria, client_1.SistemaCategoria.OPERACIONAL),
                criticidade: toEnum(row.criticidade, client_1.Criticidade, client_1.Criticidade.MEDIA),
                businessOwner: toStr(row.businessOwner),
                responsavelTecnico: toStr(row.responsavelTecnico),
                contatoFuncional: toStr(row.contatoFuncional),
                fornecedor: toStr(row.fornecedor),
                janelaOperacao: toStr(row.janelaOperacao),
                backupInfo: toStr(row.backupInfo),
                procedimentoRecup: toStr(row.procedimentoRecup),
                pontoUnicoFalha: toStr(row.pontoUnicoFalha),
                tecnologiaPrincipal: toStr(row.tecnologiaPrincipal),
                databaseInfo: toStr(row.databaseInfo),
                integracoes: toStr(row.integracoes),
            };
            await prisma.aplicacao.upsert({
                where: { sigla: appData.sigla || "TEMP_IGNORE" },
                update: appData,
                create: {
                    nome: nomeValue,
                    ...appData,
                },
            });
            success++;
        }
        catch (e) {
            fail++;
            console.error(`❌ Erro em [${nomeValue}]: ${e.message}`);
        }
    }
    console.log(`\n🏁 Aplicações: ${success} sucessos, ${fail} falhas.`);
}
//# sourceMappingURL=seedAplicacoes.js.map