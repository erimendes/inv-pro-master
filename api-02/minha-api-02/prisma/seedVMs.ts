import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { PrismaClient, AtivoTipo } from "../generated/prisma/client";

const filePath = path.resolve(__dirname, "data", "vms.csv");

type VmCSV = {
  hardware?: string;
  hostname?: string;
  ipPrincipal?: string;
  sistemaOperacional?: string;
  apelido?: string;
  patrimonio?: string;
  serial?: string;
  cpu?: string;
  ram?: string;
  armazenamento?: string;
  isVirtualizado?: string;
  hostHostname?: string;
};

const toStr = (v?: any) => {
  const s = String(v || "").trim();
  return s === "" ? null : s;
};

const toBool = (v?: string) => {
  const s = String(v || "").toLowerCase();
  return s === "true" || s === "1";
};

function parseCsv(file: string): Promise<VmCSV[]> {
  return new Promise((resolve, reject) => {
    const results: VmCSV[] = [];
    if (!fs.existsSync(file)) return reject(new Error("CSV não encontrado: " + file));

    fs.createReadStream(file)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

export async function seedVMs(prisma: PrismaClient) {
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
      let hostIdValue: number | null = null;

      if (hostHostnameStr) {
        const host = await prisma.ativo.findUnique({
          where: { hostname: hostHostnameStr },
          select: { id: true, tipo: true },
        });

        if (!host) {
          console.warn(`⚠️ Host [${hostHostnameStr}] não encontrado.`);
        } else {
          hostIdValue = host.id;
        }
      }

      await prisma.ativo.upsert({
        where: { hostname },
        update: {
          hardware: toStr(row.hardware),
          ipPrincipal: toStr(row.ipPrincipal),
          tipo: AtivoTipo.SERVIDOR_VIRTUAL,
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
          // AQUI ESTÁ A CHAVE: Usamos a Foreign Key direta, NUNCA o objeto 'host'
          hostFisicoId: hostIdValue, 
        },
        create: {
          hostname,
          hardware: toStr(row.hardware),
          ipPrincipal: toStr(row.ipPrincipal),
          tipo: AtivoTipo.SERVIDOR_VIRTUAL, 
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
    } catch (e: any) {
      fail++;
      console.error(`❌ Erro na VM [${hostname}]: ${e.message}`);
    }
  }

  if (fail > 0) throw new Error(`Seed VMs falhou com ${fail} erros`);
  console.log(`🏁 VMs: ${success} sucessos`);
}