import fs from "fs";
import csv from "csv-parser";
import { PrismaClient, AtivoTipo } from "../generated/prisma/client";
import path from "path";

const filePath = path.resolve(__dirname, "data", "ativos.csv");

// ---------- TYPES ----------
type AtivoCSV = {
  rack?: string;          // Nome do Rack vindo do CSV (ex: 'Rack 13')
  posicaoRack?: string;  
  tamanhoU?: string;       
  hardware?: string;
  hostname?: string;
  tipo?: string;
  ipPrincipal?: string;
  sistemaOperacional?: string;
  oQueRoda?: string;
  apelido?: string;       // 👈 ADICIONE ESTA LINHA AQUI
  patrimonio?: string;
  serial?: string;
  cpu?: string;
  ram?: string;
  armazenamento?: string;
  observacoes?: string;
  isVirtualizado?: string;
};

// ---------- HELPERS ----------
const toStr = (v?: any) => {
  const s = String(v || "").trim();
  return s === "" ? null : s;
};

const toBool = (v?: string) => {
  const s = String(v || "").toLowerCase();
  return s === "true" || s === "1";
};

const toInt = (v?: any) => {
  const n = parseInt(v);
  return isNaN(n) ? null : n;
};

// ---------- CSV PARSER ----------
function parseCsv(file: string): Promise<AtivoCSV[]> {
  return new Promise((resolve, reject) => {
    const results: AtivoCSV[] = [];
    if (!fs.existsSync(file)) return reject(new Error("Arquivo CSV de Ativos não encontrado em: " + file));

    fs.createReadStream(file)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("error", reject)
      .on("end", () => resolve(results));
  });
}

// ---------- SEED MAIN FUNCTION ----------
export async function seedAtivos(prisma: PrismaClient) {
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
      const tipoAtivo = (row.tipo as AtivoTipo) || AtivoTipo.SERVIDOR_FISICO;
      const isVM = tipoAtivo === AtivoTipo.SERVIDOR_VIRTUAL;
      
      const ehVirtualOuMovel = 
        isVM || 
        tipoAtivo === AtivoTipo.LAPTOP || 
        tipoAtivo === AtivoTipo.MONITOR;

      // Regras de negócio para ativos físicos e virtuais (VMs não têm Rack)
      const nomeRack = ehVirtualOuMovel ? null : toStr(row.rack);
      const posRack = ehVirtualOuMovel ? null : toInt(row.posicaoRack);
      const tamU = isVM ? 0 : (toInt(row.tamanhoU) ?? 1);

      let rackIdReal: string | null = null;

      // 🔍 BUSCA DO RACK: Mapeia o nome do texto do CSV para achar o rackId (UUID) real
      if (nomeRack) {
        const rackEncontrado = await prisma.rack.findUnique({
          where: { nome: nomeRack },
          select: { id: true }
        });

        if (rackEncontrado) {
          rackIdReal = rackEncontrado.id;
        } else {
          console.warn(`⚠️ Rack [${nomeRack}] não foi pré-cadastrado no sistema. O ativo [${hostnameValue}] será salvo sem rack.`);
        }
      }

      // Padronizações normativas para evitar campos nulos obrigatórios se for VM
      const fabricanteFinal = isVM ? "Virtual" : "Mapeado via CSV";
      const modeloFinal = isVM ? "Virtual Machine" : toStr(row.hardware);
      const patrimonioFinal = isVM ? `VM-${hostnameValue}` : toStr(row.patrimonio);
      const serialFinal = isVM ? null : toStr(row.serial);

      // 💾 Gravação direta usando a FK rackId (String) do seu Schema
      await prisma.ativo.upsert({
        where: { hostname: hostnameValue },
        update: {
          hardware: toStr(row.hardware),
          ipPrincipal: toStr(row.ipPrincipal),
          tipo: tipoAtivo,
          tamanhoU: tamU,
          posicaoRack: posRack,
          sistemaOperacional: toStr(row.sistemaOperacional),
          apelido: toStr(row.oQueRoda),
          patrimonio: patrimonioFinal,
          serial: serialFinal,
          cpu: toStr(row.cpu),
          ram: toStr(row.ram),
          armazenamento: toStr(row.armazenamento),
          observacoes: toStr(row.observacoes),
          isVirtualizado: isVM ? true : toBool(row.isVirtualizado),
          fabricante: fabricanteFinal,
          modelo: modeloFinal,
          
          // Atualiza o rackId diretamente (Se for null, o banco desvincula automaticamente)
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
          apelido: toStr(row.oQueRoda),
          patrimonio: patrimonioFinal!,
          serial: serialFinal,
          cpu: toStr(row.cpu),
          ram: toStr(row.ram),
          armazenamento: toStr(row.armazenamento),
          observacoes: toStr(row.observacoes),
          isVirtualizado: isVM ? true : toBool(row.isVirtualizado),
          fabricante: fabricanteFinal,
          modelo: modeloFinal!,
          status: "EM_USO",
          emUso: true,
          valor: 0,
          
          // Insere o rackId diretamente no momento da criação
          rackId: rackIdReal, 
        },
      });
      success++;
    } catch (e: any) {
      fail++;
      console.error(`❌ Falha crítica ao processar o ativo [${hostnameValue}]: ${e.message}`);
    }
  }

  console.log(`\n🏁 --- RESUMO DO SEED DE ATIVOS ---`);
  console.log(`✅ Sucessos salvos no banco: ${success}`);
  console.log(`❌ Falhas de processamento: ${fail}`);
}

