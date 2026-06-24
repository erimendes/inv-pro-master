import requests
import logging

logger = logging.getLogger(__name__)

class ZabbixClient:
    """Handles communication with the Zabbix JSON-RPC API."""
    
    def __init__(self, url, username, password):
        self.url = url.rstrip('/') + '/api_jsonrpc.php'
        self.username = username
        self.password = password
        self.auth_token = None
        self.request_id = 1

    def authenticate(self):
        """Authenticates with the Zabbix API and stores the auth token."""
        payload = {
            "jsonrpc": "2.0",
            "method": "user.login",
            "params": {
                "user": self.username,  # <--- CORRIGIDO AQUI: chave "user", valor self.username
                "password": self.password
            },
            "id": self.request_id
        }
        self.request_id += 1
        
        try:
            response = requests.post(self.url, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()
            result = response.json()
            
            if 'error' in result:
                raise Exception(f"Zabbix Auth Error: {result['error'].get('data', result['error']['message'])}")
                
            self.auth_token = result['result']
            logger.info("Successfully authenticated with Zabbix API.")
            return True
        except requests.RequestException as e:
            logger.error(f"HTTP Connection error during authentication: {e}")
            raise

    def get_hosts(self):
        """Retrieves all hosts with their interfaces, inventory, and latest items."""
        if not self.auth_token:
            self.authenticate()
            
        payload = {
            "jsonrpc": "2.0",
            "method": "host.get",
            "params": {
                "output": ["hostid", "host", "name", "status", "description"],
                "selectInterfaces": ["ip", "dns", "port", "main", "type"],
                "selectInventory": "extend",
                "selectItems": ["itemid", "name", "key_", "lastvalue", "units", "lastclock"],
                # Optional: filter only for active monitored hosts (status 0 = monitored, 1 = unmonitored)
                "filter": {
                    "status": "0"
                }
            },
            "auth": self.auth_token,
            "id": self.request_id
        }
        self.request_id += 1
        
        try:
            response = requests.post(self.url, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()
            result = response.json()
            
            if 'error' in result:
                raise Exception(f"Zabbix API Error: {result['error'].get('data', result['error']['message'])}")
                
            return result['result']
        except requests.RequestException as e:
            logger.error(f"HTTP Connection error during host retrieval: {e}")
            raise