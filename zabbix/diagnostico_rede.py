import logging
import requests
from zabbix_exporter import ZabbixClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    # 1. Configurações de Acesso (Mude para os seus dados reais)
    ZABBIX_URL = "http://ip/zabbix" # Altere para sua URL real
    USERNAME = "Admin"                     
    PASSWORD = ""                     
    
    # 2. COLOQUE O NOME VISÍVEL DE UM SWITCH DA SUA REDE AQUI:
    NOME_DO_SWITCH = "SWITCH121_FILA1"
    
    try:
        client = ZabbixClient(url=ZABBIX_URL, username=USERNAME, password=PASSWORD)
        client.authenticate()
        
        logger.info(f"Buscando chaves de topologia para o switch: '{NOME_DO_SWITCH}'...")
        
        # Busca o host específico e traz TODOS os seus itens sem filtros restritivos de chaves
        payload = {
            "jsonrpc": "2.0",
            "method": "host.get",
            "params": {
                "output": ["hostid", "name"],
                "selectItems": ["itemid", "name", "key_", "lastvalue"],
                "filter": {"name": [NOME_DO_SWITCH]}
            },
            "auth": client.auth_token,
            "id": client.request_id
        }
        
        res = requests.post(client.url, json=payload, headers={"Content-Type": "application/json"}).json()
        
        if 'error' in res or not res.get('result'):
            print(f"\n[ERRO] Switch '{NOME_DO_SWITCH}' não localizado ou erro na API.")
            return

        host_data = res['result'][0]
        items = host_data.get('items', [])
        
        print(f"\n[SUCESSO] Analisando {len(items)} itens do switch: {host_data['name']}")
        print("-" * 80)
        print("Pistas de LLDP/CDP/Vizinhança encontradas:")
        print("-" * 80)
        
        achou_algo = False
        for item in items:
            key_lower = item['key_'].lower()
            name_lower = item['name'].lower()
            
            # Varre por qualquer termo que lembre vizinhos, lldp, cdp, topologia ou links
            if any(x in key_lower or x in name_lower for x in ['lldp', 'cdp', 'neigh', 'rem', 'vizinho', 'topo']):
                achou_algo = True
                print(f"Nome do Item: {item['name']}")
                print(f"Chave (Key):  {item['key_']}")
                print(f"Último Valor: {item['lastvalue']}")
                print("-" * 80)
                
        if not achou_algo:
            print("\n[ALERTA] Nenhuma chave de topologia foi encontrada nesse switch especificamente.")
            print("Isso confirma que o template associado a ele não monitora vizinhos.")

    except Exception as e:
        print(f"Erro no diagnóstico: {e}")

if __name__ == "__main__":
    main()