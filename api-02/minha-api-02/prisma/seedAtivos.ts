import fs from "fs";
import csv from "csv-parser";
import { PrismaClient, AtivoTipo } from "../generated/prisma/client";
import path from "path";

const filePath = path.resolve(__dirname, "data", "seus_ativos.csv");

// ---------- TYPES ----------
type AtivoCSV = {
  tipo: string;
  tamanhoU?: string;       
  posicaoRack: string;  
  rackId?: string;
  hardware?: string;
  hostname?: string;
  ipPrincipal?: string;
  sistemaOperacional?: string;
  oQueRoda?: string;
  apelido?: string;
  patrimonio?: string;
  serial?: string;
  cpu?: string;
  ram?: string;
  armazenamento?: string;
  isVirtualizado?: string;
  hostFisicoHostname?: string; // Alterado para mapear por hostname textual
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
    if (!fs.existsSync(file)) return reject(new Error("Arquivo CSV não encontrado."));

    fs.createReadStream(file)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("error", reject)
      .on("end", () => resolve(results));
  });
}

// ---------- SEED ----------
export async function seedAtivos(prisma: PrismaClient) {
  console.log("📦 Importando ativos...");

  const rows = await parseCsv(filePath);
  console.log(`📄 CSV lido: ${rows.length} registros.`);

  let success = 0;
  let fail = 0;

  // FASE 1: Criar ou atualizar os ativos limpando inconsistências físicas
  for (const row of rows) {
    const hostnameValue = toStr(row.hostname);
    if (!hostnameValue) continue;

    try {
      const tipoAtivo = (row.tipo as AtivoTipo) || AtivoTipo.SERVIDOR_FISICO;
      
      // Padronizado com 'O' maiúsculo em todos os lugares
      const ehVirtualOuMovel = 
        tipoAtivo === AtivoTipo.SERVIDOR_VIRTUAL || 
        tipoAtivo === AtivoTipo.LAPTOP || 
        tipoAtivo === AtivoTipo.MONITOR;

      const rId = ehVirtualOuMovel ? null : toStr(row.rackId);
      const posRack = ehVirtualOuMovel ? null : toInt(row.posicaoRack);
      const tamU = tipoAtivo === AtivoTipo.SERVIDOR_VIRTUAL ? 0 : (toInt(row.tamanhoU) ?? 1);

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
    } catch (e: any) {
      fail++;
      console.error(`❌ Erro na Fase 1 do ativo [${hostnameValue}]: ${e.message}`);
    }
  }

  // FASE 2: Resolver os relacionamentos lógicos (VM -> Host Físico) via Hostname
  console.log("🔗 Vinculando Máquinas Virtuais aos Hosts...");
  for (const row of rows) {
    const parentHostname = toStr(row.hostFisicoHostname);
    const hostnameValue = toStr(row.hostname);

    if (parentHostname && hostnameValue) {
      try {
        // 1. Busca o ID real do host físico gerado pelo banco
        const hostAtivo = await prisma.ativo.findUnique({
          where: { hostname: parentHostname },
          select: { id: true, tipo: true }
        });

        if (!hostAtivo) {
          console.warn(`⚠️ Host [${parentHostname}] não encontrado no banco. Pulando VM [${hostnameValue}].`);
          continue;
        }

        if (hostAtivo.tipo !== AtivoTipo.SERVIDOR_FISICO) {
          console.warn(`⚠️ O ativo [${parentHostname}] foi achado, mas não é um SERVIDOR_FISICO. Falha de integridade.`);
          continue;
        }

        // 2. Realiza o update injetando o ID numérico correto
        await prisma.ativo.update({
          where: { hostname: hostnameValue },
          data: {
            host: { connect: { id: hostAtivo.id } }
          }
        });
      } catch (e: any) {
        console.error(`❌ Erro ao vincular a VM [${hostnameValue}] ao host [${parentHostname}]: ${e.message}`);
      }
    }
  }

  console.log(`\n🏁 Resultado Final: ${success} sucessos, ${fail} falhas.`);
}