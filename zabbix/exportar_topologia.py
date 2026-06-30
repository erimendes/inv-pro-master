import csv
import logging
import requests
from datetime import datetime
from zabbix_exporter import ZabbixClient

# Configuração de Logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def requests_manual(url, payload):
    """Função auxiliar para chamadas diretas à API do Zabbix."""
    res = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    return res.json()

def buscar_topologia_rede(client):
    """
    Busca os itens de vizinhança LLDP/CDP focando no padrão Extreme Networks e universais.
    """
    logger.info("Conectando ao Zabbix para extrair vizinhança de rede dos switches Extreme...")
    
    # Payload focado nos switches Extreme e chaves padrão de topologia
    payload_hosts = {
        "jsonrpc": "2.0",
        "method": "host.get",
        "params": {
            "output": ["hostid", "name", "host"],
            "selectInterfaces": ["ip"],
            "selectItems": ["itemid", "name", "key_", "lastvalue"],
            "searchItems": {
                # Mapeia chaves Extreme e padrões de mercado
                "key_": ["extremelldp", "extremecdp", "lldp", "cdp", "neighbor"]
            },
            "searchByAny": True,
            "filter": {"status": "0"}
        },
        "auth": client.auth_token,
        "id": client.request_id
    }
    client.request_id += 1
    
    res = requests_manual(client.url, payload_hosts)
    if 'error' in res:
        raise Exception(f"Erro na API Zabbix: {res['error']}")
        
    hosts_rede = res['result']
    logger.info(f"Analisando dados de {len(hosts_rede)} ativos de rede localizados...")
    
    conexoes = []
    
    for host in hosts_rede:
        switch_local = host.get('name')
        ip_local = host['interfaces'][0].get('ip') if host.get('interfaces') else "N/A"
        items = host.get('items', [])
        
        # Estrutura para agrupar dados por ID do vizinho
        vizinhos = {}
        
        for item in items:
            key = item.get('key_', '').lower()
            val = item.get('lastvalue', '').strip()
            item_name = item.get('name', '')
            
            if not val or val == 'N/A' or val == '0':
                continue
                
            # Extrai o índice do vizinho (ex: lldpRemSysName[1.24] -> "1.24")
            idx = ""
            if "[" in key and "]" in key:
                idx = key.split("[")[1].split("]")[0]
            else:
                continue
                
            if idx not in vizinhos:
                vizinhos[idx] = {"porta_local": "Descobrindo...", "switch_vizinho": "", "porta_vizinho": "N/A"}
            
            # 1. Identifica o Nome do Switch Vizinho
            if any(x in key for x in ['sysname', 'neighbor.name', 'remote.name', 'remname']):
                vizinhos[idx]["switch_vizinho"] = val
            elif "neighbor" in key and "name" in key:
                vizinhos[idx]["switch_vizinho"] = val
                
            # 2. Identifica a Porta do Switch Vizinho
            elif any(x in key for x in ['portid', 'portdesc', 'neighbor.port', 'remote.port']):
                vizinhos[idx]["porta_vizinho"] = val
                
            # 3. Identifica a Porta Local onde o cabo está plugado
            # Pega o texto explicativo que o Zabbix gera no nome do item
            if ":" in item_name:
                # Remove prefixos como "Interface X:" ou "Port X:"
                vizinhos[idx]["porta_local"] = item_name.split(":")[0].replace("Interface", "").replace("Port", "").strip()

        # Adiciona ao relatório apenas registros válidos
        for idx, dados in vizinhos.items():
            if dados["switch_vizinho"]:
                # Limpa nomes genéricos se a porta local não foi capturada pelo split anterior
                p_local = dados["porta_local"] if dados["porta_local"] != "Descobrindo..." else f"Slot/Port index {idx}"
                
                conexoes.append({
                    "Switch Local (Origem)": switch_local,
                    "IP Origem": ip_local,
                    "Porta Local (Origem)": p_local,
                    "Switch Conectado (Destino)": dados["switch_vizinho"],
                    "Porta no Vizinho (Destino)": dados["porta_vizinho"],
                    "Data do Mapeamento": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
                
    return conexoes

def main():
    # --- Configurações de Conexão do seu Zabbix ---
    ZABBIX_URL = "http://130.1.0.225/zabbix" # Altere para sua URL real
    USERNAME = "Admin"                     # Seu Usuário
    PASSWORD = "sptrans"                     # Sua Senha
    OUTPUT_CSV = "topologia_switches.csv"
    
    try:
        client = ZabbixClient(url=ZABBIX_URL, username=USERNAME, password=PASSWORD)
        client.authenticate()
        
        mapa_conexoes = buscar_topologia_rede(client)
        
        if not mapa_conexoes:
            print("\n[AVISO] Ainda não foi possível localizar dados preenchidos de LLDP/CDP nas chaves.")
            print("Isso pode ocorrer se a descoberta de LLDP estiver desativada globalmente nos switches Extreme.")
            return

        # Escreve o CSV de Topologia
        headers = list(mapa_conexoes[0].keys())
        with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers, delimiter=';')
            writer.writeheader()
            writer.writerows(mapa_conexoes)
            
        print(f"\n[SUCESSO] Mapa de topologia gerado! {len(mapa_conexoes)} conexões salvas em '{OUTPUT_CSV}'")
        
    except Exception as e:
        print(f"\n[ERRO] Falha ao gerar topologia: {e}")

if __name__ == "__main__":
    main()