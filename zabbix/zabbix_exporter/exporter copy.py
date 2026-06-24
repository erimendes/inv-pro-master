import csv
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ZabbixExporter:
    """Processes Zabbix host data and exports it to CSV format."""
    
    def __init__(self, zabbix_client):
        self.client = zabbix_client

    def parse_hosts_data(self, hosts_raw):
        """Transforms raw Zabbix API response into a flattened list of dictionaries."""
        flattened_data = []
        
        # Mapping for human-readable interface types
        interface_types = {1: "Agent", 2: "SNMP", 3: "IPMI", 4: "JMX"}
        
        for host in hosts_raw:
            # Extract main interface (IP/DNS)
            interfaces = host.get('interfaces', [])
            main_ip = ""
            main_dns = ""
            agent_type = "N/A"
            
            for inter in interfaces:
                if inter.get('main') == '1': # 1 means primary interface
                    main_ip = inter.get('ip', '')
                    main_dns = inter.get('dns', '')
                    agent_type = interface_types.get(int(inter.get('type', 1)), "Unknown")
                    break
            
            # Extract inventory details if available
            inventory = host.get('inventory') or {}
            os_inventory = inventory.get('os', '')
            hardware_inventory = inventory.get('hardware', '')
            serial_number = inventory.get('serialno_a', '')
            
            # Find common important metrics from items list
            # We will extract a few key values if they exist, or provide defaults
            items = host.get('items', [])
            cpu_util = "N/A"
            mem_available = "N/A"
            uptime = "N/A"
            
            for item in items:
                key = item.get('key_', '')
                # Common system keys (supports official templates)
                if 'system.cpu.util' in key or 'cpu.util' in key:
                    cpu_util = f"{item.get('lastvalue', 'N/A')}{item.get('units', '%')}"
                elif 'vm.memory.size[available]' in key or 'memory.available' in key:
                    try:
                        # Convert bytes to GB if possible
                        bytes_val = float(item.get('lastvalue', 0))
                        if bytes_val > 0:
                            mem_available = f"{round(bytes_val / (1024**3), 2)} GB"
                    except ValueError:
                        mem_available = item.get('lastvalue', 'N/A')
                elif 'system.uptime' in key or 'uptime' in key:
                    uptime = item.get('lastvalue', 'N/A')

            # Create standard host row
            row = {
                "Host ID": host.get('hostid'),
                "Technical Name": host.get('host'),
                "Visible Name": host.get('name'),
                "Status": "Monitored" if host.get('status') == '0' else "Disabled",
                "IP Address": main_ip,
                "DNS": main_dns,
                "Interface Type": agent_type,
                "Operating System": os_inventory,
                "Hardware Model": hardware_inventory,
                "Serial Number": serial_number,
                "Latest CPU Util": cpu_util,
                "Latest Mem Available": mem_available,
                "System Uptime": uptime,
                "Description": host.get('description', ''),
                "Exported At": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            flattened_data.append(row)
            
        return flattened_data

    def generate_csv(self, output_filepath):
        """Main method to fetch, process, and write Zabbix data into a CSV."""
        logger.info("Fetching data from Zabbix...")
        hosts_raw = self.client.get_hosts()
        
        logger.info(f"Processing {len(hosts_raw)} hosts...")
        processed_data = self.parse_hosts_data(hosts_raw)
        
        if not processed_data:
            logger.warning("No host data to export.")
            return False
            
        # Define columns based on the dictionary keys
        headers = list(processed_data[0].keys())
        
        try:
            with open(output_filepath, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=headers, delimiter=';') # Semicolon is standard for European/LATAM Excel
                writer.writeheader()
                writer.writerows(processed_data)
                
            logger.info(f"CSV successfully generated at: {output_filepath}")
            return True
        except IOError as e:
            logger.error(f"Failed to write CSV file: {e}")
            raise
