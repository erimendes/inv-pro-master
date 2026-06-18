import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { PrismaClient, AtivoTipo } from "../generated/prisma/client";

const filePath = path.resolve(__dirname, "data", "vms.csv");

// 🌟 Typagem mapeada perfeitamente com o seu novo cabeçalho do CSV
type VmCSV = {
  hostnameServidor?: string;
  hardware?: string;
  hostname?: string;
  ipPrincipal?: string;
  observacoes?: string;
  sistemaOperacional?: string;
  cpu?: string;
  armazenamento?: string;
  ram?: string;
  isVirtualizado?: string;
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
      let hostIdValue: number | null = null;

      // 1. Amarração e Descoberta do Host Pai
      if (hostnameServidorStr) {
        const host = await prisma.ativo.findUnique({
          where: { hostname: hostnameServidorStr },
          select: { id: true, tipo: true },
        });

        if (!host) {
          console.warn(`⚠️ Host Pai [${hostnameServidorStr}] especificado no CSV não foi encontrado no banco.`);
        } else {
          hostIdValue = host.id;

          // Se o campo hardware indicar Hyper-V, atualiza a tecnologia do pai
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

      // 2. Criação do patrimônio virtualizado e higienização dos dados de VM
      const patrimonioVirtual = `VM-${hostname}`;

      await prisma.ativo.upsert({
        where: { hostname },
        update: {
          hardware: hardwareStr || "Virtualizado",
          ipPrincipal: toStr(row.ipPrincipal),
          tipo: AtivoTipo.SERVIDOR_VIRTUAL,
          sistemaOperacional: toStr(row.sistemaOperacional),
          observacoes: toStr(row.observacoes),
          cpu: toStr(row.cpu),
          ram: toStr(row.ram),
          armazenamento: toStr(row.armazenamento),
          isVirtualizado: toBool(row.isVirtualizado) || true, // VMs são sempre virtualizadas
          hostFisicoId: hostIdValue,
          
          // Alinhamento com as novas regras de negócio do frontend para VMs:
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
          tipo: AtivoTipo.SERVIDOR_VIRTUAL, 
          sistemaOperacional: toStr(row.sistemaOperacional),
          observacoes: toStr(row.observacoes),
          cpu: toStr(row.cpu),
          ram: toStr(row.ram),
          armazenamento: toStr(row.armazenamento),
          isVirtualizado: toBool(row.isVirtualizado) || true,
          hostFisicoId: hostIdValue,
          
          // Alinhamento com as novas regras de negócio do frontend para VMs:
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
    } catch (e: any) {
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
