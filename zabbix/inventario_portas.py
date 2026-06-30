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

def extrair_inventario_portas(client):
    """
    Busca os itens de status de interface (operstatus) de todos os switches monitorados.
    """
    logger.info("Conectando ao Zabbix para extrair a saúde e ocupação das portas...")
    
    # Payload para buscar chaves de status operacional de portas (net.if.status)
    payload_hosts = {
        "jsonrpc": "2.0",
        "method": "host.get",
        "params": {
            "output": ["hostid", "name", "host"],
            "selectInterfaces": ["ip"],
            "selectItems": ["itemid", "name", "key_", "lastvalue"],
            "searchItems": {
                # Procura pela chave padrão de status operacional de redes do Zabbix
                "key_": ["net.if.status"]
            },
            "filter": {"status": "0"} # Apenas hosts ativos
        },
        "auth": client.auth_token,
        "id": client.request_id
    }
    client.request_id += 1
    
    res = requests_manual(client.url, payload_hosts)
    if 'error' in res:
        raise Exception(f"Erro na API Zabbix: {res['error']}")
        
    hosts_brutos = res['result']
    logger.info(f"Processando métricas de {len(hosts_brutos)} ativos encontrados...")
    
    relatorio_switches = []
    
    for host in hosts_brutos:
        switch_name = host.get('name')
        ip_local = host['interfaces'][0].get('ip') if host.get('interfaces') else "N/A"
        items = host.get('items', [])
        
        portas_up = 0
        portas_down = 0
        
        for item in items:
            key = item.get('key_', '').lower()
            val = item.get('lastvalue', '')
            
            # Filtra apenas o Status Operacional da porta (ignora administrative status se houver)
            # O padrão do Zabbix para operstatus retorna: 1 = UP, 2 = DOWN
            if "net.if.status" in key and not "admin" in key:
                if val == "1":
                    portas_up += 1
                elif val == "2":
                    portas_down += 1
                    
        portas_totais = portas_up + portas_down
        
        # Só inclui no relatório se o switch realmente tiver portas mapeadas pelo Zabbix
        if portas_totais > 0:
            pct_ocupacao = (portas_up / portas_totais) * 100
            
            relatorio_switches.append({
                "Switch": switch_name,
                "IP de Gerenciamento": ip_local,
                "Portas Totais Mapeadas": portas_totais,
                "Portas Ativas (UP)": portas_up,
                "Portas Livres (DOWN)": portas_down,
                "Taxa de Ocupacao (%)": f"{round(pct_ocupacao, 1)} %",
                "Data da Extração": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            
    # Ordena o relatório do switch mais lotado para o mais vazio
    relatorio_switches = sorted(relatorio_switches, key=lambda k: float(k['Taxa de Ocupacao (%)'].replace(' %','')), reverse=True)
    return relatorio_switches

def main():
    # --- Configurações de Conexão do seu Zabbix ---
    ZABBIX_URL = "http://130.1.0.225/zabbix" # Altere para sua URL real
    USERNAME = "Admin"                     # Seu Usuário
    PASSWORD = "sptrans"                     # Sua Senha
    OUTPUT_CSV = "inventario_portas_switches.csv"
    
    try:
        client = ZabbixClient(url=ZABBIX_URL, username=USERNAME, password=PASSWORD)
        client.authenticate()
        
        dados_portas = extrair_inventario_portas(client)
        
        if not dados_portas:
            print("\n[AVISO] Nenhuma porta com chave 'net.if.status' foi localizada nos hosts.")
            print("Verifique se os hosts possuem itens coletados na regra 'Network Interfaces Discovery'.")
            return

        # Escreve o CSV
        headers = list(dados_portas[0].keys())
        with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers, delimiter=';')
            writer.writeheader()
            writer.writerows(dados_portas)
            
        print(f"\n[SUCESSO] Inventário concluído! Dados de {len(dados_portas)} switches salvos em '{OUTPUT_CSV}'")
        
    except Exception as e:
        print(f"\n[ERRO] Falha ao gerar inventário de portas: {e}")

if __name__ == "__main__":
    main()