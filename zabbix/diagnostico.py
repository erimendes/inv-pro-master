import logging
from zabbix_exporter import ZabbixClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    # Preencha com os mesmos dados que você usou no run_exporter.py
    ZABBIX_URL = "http://ip/zabbix/" # Replace with your Zabbix server URL
    USERNAME = "Admin"                     # Replace with your Zabbix username
    PASSWORD = ""                     # Replace with your Zabbix password                                   
    
    # 2. COLOQUE O NOME DO SEU HOST WINDOWS AQUI DENTRO DAS ASPAS:
    NOME_DO_HOST_WINDOWS = "sptgenexus 130.1.0.24"
    
    try:
        client = ZabbixClient(url=ZABBIX_URL, username=USERNAME, password=PASSWORD)
        print(f"Conectando ao Zabbix e buscando dados do host: '{NOME_DO_HOST_WINDOWS}'...")
        hosts = client.get_hosts()
        
        host_encontrado = False
        for host in hosts:
            # Compara o nome visível ou o nome técnico do host
            if NOME_DO_HOST_WINDOWS.lower() in host.get('name', '').lower() or NOME_DO_HOST_WINDOWS.lower() in host.get('host', '').lower():
                host_encontrado = True
                print(f"\n==========================================")
                print(f"HOST LOCALIZADO: {host.get('name')} (ID: {host.get('hostid')})")
                print(f"==========================================")
                print("LISTA DE TODAS AS CHAVES DISPONÍVEIS NESTE HOST:\n")
                
                items = host.get('items', [])
                if not items:
                    print("[AVISO] Este host não retornou nenhum item. Verifique se o filtro do client.py bloqueou os itens dele.")
                
                for item in items:
                    key = item.get('key_', '')
                    val = item.get('lastvalue', '')
                    name = item.get('name', '')
                    print(f" -> Nome do Item: {name}")
                    print(f"    Chave (Key):   {key}")
                    print(f"    Último Valor:  {val}\n")
                break 
                
        if not host_encontrado:
            print(f"\n[ERRO] Não foi possível encontrar nenhum host com o nome '{NOME_DO_HOST_WINDOWS}' no Zabbix.")
            print("Verifique se digitou o nome exatamente como aparece na tela do Zabbix.")
                
    except Exception as e:
        print(f"Erro no diagnóstico: {e}")

if __name__ == "__main__":
    main()