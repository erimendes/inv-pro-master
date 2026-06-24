import csv
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ZabbixExporter:
    """Processa dados de hosts do Zabbix e os exporta no formato CSV personalizado com Status de Energia."""
    
    def __init__(self, zabbix_client):
        self.client = zabbix_client

    def clean_os_name(self, os_string):
        """Limpa strings de Kernel do Linux e uname do Windows obtidos do Zabbix."""
        if not os_string:
            return ""
        
        os_lower = os_string.lower()
        
        if "windows" in os_lower or "microsoft" in os_lower:
            if "server 2022" in os_lower: return "Windows Server 2022"
            if "server 2019" in os_lower: return "Windows Server 2019"
            if "server 2016" in os_lower: return "Windows Server 2016"
            if "server 2012" in os_lower: return "Windows Server 2012"
            if "datacenter" in os_lower: return "Windows Server Datacenter"
            return "Windows OS"
        
        if "linux version" in os_lower:
            try:
                parts = os_string.split()
                return f"Linux (Kernel {parts[2]})"
            except IndexError:
                return "Linux"

        return os_string.split('\n')[0].strip()[:40]

    def parse_hosts_data(self, hosts_raw):
        """Transforma a resposta bruta do Zabbix em uma lista plana de dicionários."""
        flattened_data = []
        interface_types = {1: "Agent", 2: "SNMP", 3: "IPMI", 4: "JMX"}
        
        for host in hosts_raw:
            # 1. Interfaces e IP
            interfaces = host.get('interfaces', [])
            main_ip = ""
            main_dns = ""
            agent_types_found = set()
            is_snmp_primary = False
            
            for inter in interfaces:
                type_id = int(inter.get('type', 1))
                agent_types_found.add(interface_types.get(type_id, "Unknown"))
                if inter.get('main') == '1':
                    main_ip = inter.get('ip', '')
                    main_dns = inter.get('dns', '')
                    if type_id == 2:
                        is_snmp_primary = True
            
            agent_type_str = ", ".join(agent_types_found) if agent_types_found else "N/A"
            if not main_ip and interfaces:
                main_ip = interfaces[0].get('ip', '')
                main_dns = interfaces[0].get('dns', '')
            
            # 2. Métricas de Hardware
            items = host.get('items', [])
            agent_hostname = "N/A"
            cpus_count = "N/A"
            ram_total = "N/A"
            disco_total = "N/A"
            os_fallback = ""
            
            # Identificadores de comportamento e energia
            has_windows_keys = False
            is_agent_online = True
            has_any_recent_data = False
            
            for item in items:
                key = item.get('key_', '')  
                key_lower = key.lower()
                val = item.get('lastvalue', '').strip()
                
                if val and val != 'N/A':
                    has_any_recent_data = True
                
                if "perf_counter" in key_lower:
                    has_windows_keys = True
                    
                # Checagem rigorosa de conectividade do Agente
                if "agent.ping" in key_lower and val == "0":
                    is_agent_online = False
                if "zabbix[host,agent,available]" in key_lower and val == "0":
                    is_agent_online = False

                if not val or val == 'N/A' or (val == '0' and not is_agent_online and not 'ping' in key_lower):
                    continue

                if 'agent.hostname' in key_lower:
                    agent_hostname = val
                elif 'system.cpu.num' in key_lower and val != '0':
                    cpus_count = val
                elif 'system.uname' in key_lower or 'system.sw.os' in key_lower or 'os.name' in key_lower:
                    os_fallback = val
                elif 'vm.memory.size[total]' in key_lower and val != '0':
                    if val.isdigit():
                        ram_total = f"{round(float(val) / (1024**3), 1)} GB"
                elif 'vfs.fs.size[' in key_lower and ',total]' in key_lower and val != '0':
                    if ('[c:,' in key_lower or '[/,' in key_lower or '[/' in key_lower) and val.isdigit():
                        disco_total = f"{round(float(val) / (1024**3), 1)} GB"

            # 3. Determinação do Estado de Energia (Ligada / Desligada)
            # Se for monitoramento por agente e ele der falso, ou se for SNMP e não trouxer nenhum dado recente
            if not is_snmp_primary and not is_agent_online:
                estado_energia = "Desligado / Sem Comunicação"
            elif is_snmp_primary and not has_any_recent_data:
                estado_energia = "Desligado / Sem Comunicação"
            else:
                estado_energia = "Ligado"

            # 4. Classificação de S.O. e Tipo Inteligente
            inventory = host.get('inventory') or {}
            os_inventory = inventory.get('os', '').strip()
            hardware_inventory = inventory.get('hardware', '').strip() or inventory.get('model', '').strip() or ''
            
            os_bruto = os_inventory if os_inventory else os_fallback
            sistema_operacional = self.clean_os_name(os_bruto)
            
            if (sistema_operacional == "N/A" or sistema_operacional == "") and has_windows_keys:
                sistema_operacional = "Windows OS"

            tipo_ativo = "Servidor Físico"
            os_lower = sistema_operacional.lower()
            hw_lower = hardware_inventory.lower()
            host_name_lower = host.get('name', '').lower()
            
            if is_snmp_primary or any(x in os_lower for x in ['cisco', 'ios', 'vrp', 'huawei', 'switch', 'router']):
                tipo_ativo = "Roteador" if any(x in host_name_lower for x in ['router', 'rot', 'rtr']) else "Switch"
            elif any(x in hw_lower for x in ['virtual', 'vmware', 'qemu', 'xen', 'hyper-v', 'virtualbox']):
                tipo_ativo = "VM"
            elif any(x in host_name_lower for x in ['vrt', 'vm-', 'virtual', 'virtsrv']):
                tipo_ativo = "VM"
            elif has_windows_keys and estado_energia == "Desligado / Sem Comunicação":
                tipo_ativo = "VM" if host_name_lower.startswith('vrt') else "Servidor Físico"

            # Formatação visual para hosts fora do ar
            if estado_energia == "Desligado / Sem Comunicação":
                if cpus_count == "N/A": cpus_count = "Offline"
                if ram_total == "N/A": ram_total = "Offline"
                if disco_total == "N/A": disco_total = "Offline"
                if agent_hostname == "N/A": agent_hostname = "Offline"
            if sistema_operacional == "":
                sistema_operacional = "N/A"

            # 5. Monta a linha do CSV com a nova coluna "Estado"
            row = {
                "Host ID": host.get('hostid'),
                "Nome Tecnico": host.get('host'),
                "Nome Visivel": host.get('name'),
                "Tipo": tipo_ativo,
                "Estado": estado_energia,                    # NOVA COLUNA ADICIONADA
                "Hostname do Agente": agent_hostname,       
                "Status no Zabbix": "Monitoramento Ativo" if host.get('status') == '0' else "Desativado",
                "Endereco IP": main_ip if main_ip else "Sem IP",
                "Meio de Coleta": agent_type_str,
                "Sistema Operacional": sistema_operacional,
                "Quantidade de CPUs": cpus_count,           
                "Memoria RAM Total": ram_total,
                "Disco Rigido Total": disco_total,
                "Data da Exportacao": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            flattened_data.append(row)
            
        return flattened_data

    def generate_csv(self, output_filepath):
        """Busca, processa e escreve os dados do Zabbix no arquivo CSV."""
        logger.info("Buscando dados no Zabbix...")
        hosts_raw = self.client.get_hosts()
        
        logger.info(f"Processando {len(hosts_raw)} hosts localizados...")
        processed_data = self.parse_hosts_data(hosts_raw)
        
        if not processed_data:
            logger.warning("Nenhum dado de host encontrado para exportação.")
            return False
            
        headers = list(processed_data[0].keys())
        
        try:
            with open(output_filepath, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=headers, delimiter=';')
                writer.writeheader()
                writer.writerows(processed_data)
                
            logger.info(f"CSV gerado com sucesso em: {output_filepath}")
            return True
        except IOError as e:
            logger.error(f"Falha ao escrever arquivo CSV: {e}")
            raise