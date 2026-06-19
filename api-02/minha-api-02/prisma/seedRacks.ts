import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { PrismaClient } from "../generated/prisma/client";

// Mapeia o caminho para buscar o arquivo dentro de prisma/data/racks.csv
const filePath = path.resolve(__dirname, "data", "racks.csv");

type RackCSV = {
  nome?: string;
  localizacao?: string;
  capacidade?: string;
};

const toStr = (v?: any) => {
  const s = String(v || "").trim();
  return s === "" ? null : s;
};

// Remove letras (como o "U") e converte para número puro
const toIntCapacidade = (v?: string): number => {
  const limpo = String(v || "").replace(/\D/g, ""); // Remove tudo o que não for dígito
  const num = parseInt(limpo, 10);
  return isNaN(num) ? 42 : num; // Fallback para 42U caso o campo esteja bizarro
};

function parseCsv(file: string): Promise<RackCSV[]> {
  return new Promise((resolve, reject) => {
    const results: RackCSV[] = [];
    if (!fs.existsSync(file)) return reject(new Error("CSV de Racks não encontrado: " + file));

    fs.createReadStream(file)
      .pipe(csv({ separator: ";" })) // Separador por ponto e vírgula conforme o padrão
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

export async function seedRacks(prisma: PrismaClient) {
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

      // Como o campo 'nome' é @unique no seu schema, o upsert garante que não haverá duplicidade
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
          corredor: null, // Deixando opcional caso queira mapear depois
          observacoes: "Carga automatizada via script de infraestrutura",
        },
      });

      success++;
    } catch (e: any) {
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
