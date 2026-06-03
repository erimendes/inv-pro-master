import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { 
  PrismaClient, 
  SistemaCategoria, 
  Criticidade 
} from "../generated/prisma/client";

// const prisma = new PrismaClient();
const filePath = path.resolve(__dirname, "data", "aplicacoes.csv");

// ---------- TYPES ----------
// Definido rigorosamente com base no seu Model Aplicacao
type AplicacaoCSV = {
  nome: string;
  sigla?: string;
  descricao?: string;
  categoria?: string;
  criticidade?: string;
  businessOwner?: string;
  responsavelTecnico?: string;
  contatoFuncional?: string;
  fornecedor?: string;
  janelaOperacao?: string;
  backupInfo?: string;
  procedimentoRecup?: string;
  pontoUnicoFalha?: string;
  tecnologiaPrincipal?: string;
  databaseInfo?: string;
  integracoes?: string;
};

// ---------- HELPERS DE HIGIENE ----------
const toStr = (v?: any) => {
  const s = String(v || "").trim();
  return s === "" ? null : s;
};

// Valida se o valor do CSV pertence ao Enum do Prisma, senão usa o Default
const toEnum = <T>(val: any, enumObj: any, defaultValue: T): T => {
  const s = String(val || "").trim().toUpperCase();
  return Object.values(enumObj).includes(s) ? (s as T) : defaultValue;
};

// ---------- CSV PARSER ----------
function parseCsv(file: string): Promise<AplicacaoCSV[]> {
  return new Promise((resolve, reject) => {
    const results: AplicacaoCSV[] = [];
    if (!fs.existsSync(file)) return reject(new Error("Arquivo CSV não encontrado."));

    fs.createReadStream(file)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("error", reject)
      .on("end", () => resolve(results));
  });
}

// ---------- SEED FUNCTION ----------
export async function seedAplicacoes(prisma: PrismaClient) {
  console.log("🚀 Iniciando Seed de Aplicações...");

  let rows: AplicacaoCSV[];
  try {
    rows = await parseCsv(filePath);
  } catch (e) {
    console.error(e);
    return;
  }

  let success = 0;
  let fail = 0;

  // FASE ÚNICA: Aplicacao não depende de IDs externos para ser criada (exceto Ativos)
  for (const row of rows) {
    const nomeValue = toStr(row.nome);
    
    if (!nomeValue) {
      console.warn("⚠️ Pulando linha: Campo 'nome' é obrigatório.");
      fail++;
      continue;
    }

    try {
      // Mapeamento fiel ao seu Schema
      const appData = {
        sigla: toStr(row.sigla), // @unique no seu schema
        descricao: toStr(row.descricao),
        categoria: toEnum<SistemaCategoria>(row.categoria, SistemaCategoria, SistemaCategoria.OPERACIONAL),
        criticidade: toEnum<Criticidade>(row.criticidade, Criticidade, Criticidade.MEDIA),
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
        where: { sigla: appData.sigla || "TEMP_IGNORE" }, // Usa sigla se houver, senão nome (ajuste conforme sua lógica de negócio)
        // Se a sigla puder ser nula, o ideal é dar upsert pelo Nome se ele fosse @unique
        // Como no seu schema só a SIGLA é @unique:
        update: appData,
        create: {
          nome: nomeValue,
          ...appData,
        },
      });

      success++;
    } catch (e: any) {
      fail++;
      console.error(`❌ Erro em [${nomeValue}]: ${e.message}`);
    }
  }

  console.log(`\n🏁 Aplicações: ${success} sucessos, ${fail} falhas.`);
}