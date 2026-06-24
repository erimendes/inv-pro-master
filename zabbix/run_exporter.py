import logging
from zabbix_exporter import ZabbixClient, ZabbixExporter

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    # Zabbix configuration parameters
    ZABBIX_URL = "http://130.1.60.225/zabbix/" # Replace with your Zabbix server URL
    USERNAME = "Admin"                     # Replace with your Zabbix username
    PASSWORD = "sptrans"                     # Replace with your Zabbix password
    OUTPUT_FILE = "ativos_zabbix.csv"
    
    try:
        # Initialize client and authenticate
        client = ZabbixClient(url=ZABBIX_URL, username=USERNAME, password=PASSWORD)
        
        # Initialize exporter
        exporter = ZabbixExporter(zabbix_client=client)
        
        # Generate the CSV report
        success = exporter.generate_csv(OUTPUT_FILE)
        
        if success:
            print(f"\n[SUCESSO] Relatório exportado com êxito para '{OUTPUT_FILE}'")
        else:
            print("\n[AVISO] Nenhum dado pôde ser exportado.")
            
    except Exception as e:
        print(f"\n[ERRO] Ocorreu uma falha durante a execução: {e}")

if __name__ == "__main__":
    main()
