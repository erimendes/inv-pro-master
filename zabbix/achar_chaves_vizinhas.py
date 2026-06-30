import logging
import requests
from zabbix_exporter import ZabbixClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    # 1. Configurações de Acesso (Mude para os seus dados reais)
    ZABBIX_URL = "http://130.1.0.225/zabbix" 
    USERNAME = "Admin"                     
    PASSWORD = "sptrans"                     
    
    # 2. COLOQUE O NOME VISÍVEL DE UM SWITCH QUE VOCÊ SABE QUE ESTÁ FUNCIONANDO:
    NOME_DO_SWITCH = "BVII_1_ANDAR_30"
    
    try:
        client = ZabbixClient(url=ZABBIX_URL, username=USERNAME, password=PASSWORD)
        client.authenticate()
        
        logger.info(f"Fazendo varredura completa no switch: '{NOME_DO_SWITCH}'...")
        
        payload = {
            "jsonrpc": "2.0",
            "method": "host.get",
            "params": {
                "output": ["hostid", "name"],
                "selectItems": ["name", "key_", "lastvalue"],
                "filter": {"name": [NOME_DO_SWITCH]}
            },
            "auth": client.auth_token,
            "id": client.request_id
        }
        
        res = requests.post(client.url, json=payload, headers={"Content-Type": "application/json"}).json()
        
        if 'error' in res or not res.get('result'):
            print(f"\n[ERRO] Switch '{NOME_DO_SWITCH}' não localizado.")
            return

        items = res['result'][0].get('items', [])
        print(f"\n[SUCESSO] Analisando {len(items)} itens coletados no switch.")
        print("Procurando por tabelas de vizinhos escondidas...")
        print("-" * 80)
        
        achou = False
        for item in items:
            key = item['key_'].lower()
            val = str(item['lastvalue']).strip()
            
            # Se o valor guardado tiver cara de ser o nome de outro switch da sua empresa,
            # ou se a chave contiver termos de LLDP/CDP/Vizinhança
            if any(x in key for x in ['lldp', 'cdp', 'rem', 'neigh', 'local', 'port']) and val and val != '0' and val != '2':
                # Filtra ruídos de status de interface comum
                if "net.if.in" in key or "net.if.out" in key or "net.if.status" in key:
                    continue
                    
                achou = True
                print(f"Nome do Item: {item['name']}")
                print(f"Chave Real:   {item['key_']}")
                print(f"Valor Atual:  {val}")
                print("-" * 80)
                
        if not achou:
            print("\n[AVISO] Nenhuma chave de topologia ativa foi encontrada com dados preenchidos.")
            print("Isso confirma que o LLDP físico precisa ser ativado nos switches via CLI.")

    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    main()