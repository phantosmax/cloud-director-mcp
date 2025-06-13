# VMware Cloud Director MCP Server

A comprehensive Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with VMware Cloud Director APIs. This server provides 32 tools for managing virtual infrastructure, storage, networking, templates, and monitoring through natural language interactions.

## 🚀 Features

### **Core Infrastructure Management**
- **Authentication Management**: Secure login and session management with VMware Cloud Director
- **Organization Management**: List organizations and get comprehensive resource usage statistics
- **Virtual Data Center Operations**: Browse VDCs and get detailed capability information
- **vApp Management**: List, power control, and manage virtual applications
- **Network Management**: Manage organization networks, NAT rules, DHCP pools, and IP allocations

### **Virtual Machine Management**
- **VM Operations**: List, search, and get detailed VM information
- **Power Management**: Complete power control (start, stop, restart, suspend, resume)
- **VM Configuration**: Modify CPU and memory specifications
- **Snapshot Management**: Create, list, and restore VM snapshots
- **VM Cloning**: Clone virtual machines across VDCs
- **Console Access**: Get VM console URLs for direct access

### **Storage Management**
- **Storage Profiles**: List datastores and storage profiles with usage statistics
- **Disk Management**: Add, list, and resize VM disks
- **Storage Monitoring**: Track storage utilization across VDCs

### **Templates & Catalogs**
- **Catalog Management**: Browse organization catalogs and shared resources
- **Template Discovery**: List catalog items including vApp templates and ISO media
- **Template Details**: Get comprehensive information about VM templates

### **Monitoring & Health**
- **Performance Metrics**: Get VM and resource utilization metrics
- **System Events**: List system events and alerts
- **Health Monitoring**: Organization and infrastructure health status
- **Task Tracking**: Monitor recent operations and their status
- **Firewall Management**: List and analyze firewall rules

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/phantosmax/cloud-director-mcp.git
   cd cloud-director-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Set your VMware Cloud Director credentials in `.env`**
   ```env
   VCD_BASE_URL=https://your-vcd-instance.com
   VCD_USERNAME=your-username
   VCD_PASSWORD=your-password
   VCD_ORG=your-organization
   VCD_API_VERSION=39.1
   ```

5. **Build the server**
   ```bash
   npm run build
   ```

## 🔧 Usage

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Claude Desktop Integration

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vmware-cloud-director": {
      "command": "node",
      "args": ["/path/to/cloud-director-mcp/build/index.js"],
      "env": {
        "VCD_BASE_URL": "https://your-vcd-instance.com",
        "VCD_USERNAME": "your-username",
        "VCD_PASSWORD": "your-password",
        "VCD_ORG": "your-organization",
        "VCD_API_VERSION": "39.1"
      }
    }
  }
}
```

## 🛠️ Available Tools (32 Total)

### **Authentication & Core (5 tools)**
- `vcd_login` - Authenticate with VMware Cloud Director
- `list_orgs` - List all accessible organizations
- `list_vdcs` - List virtual data centers
- `get_vdc_details` - Get detailed VDC information and capabilities
- `get_resource_usage` - Get comprehensive resource usage statistics

### **vApp Management (2 tools)**
- `list_vapps` - List vApps in a virtual data center
- `vapp_power_action` - Power control for vApps (start, stop, restart, suspend, resume)

### **Virtual Machine Management (6 tools)**
- `list_vms` - List virtual machines with comprehensive search
- `search_vms` - Search VMs by name or VDC
- `get_vm_details` - Get detailed VM information
- `vm_power_action` - VM power operations
- `vm_configure` - Modify VM CPU and memory specifications
- `vm_get_console` - Get VM console access URLs

### **VM Advanced Operations (4 tools)**
- `vm_create_snapshot` - Create VM snapshots
- `vm_list_snapshots` - List VM snapshots
- `vm_restore_snapshot` - Restore VM from snapshot
- `vm_clone` - Clone virtual machines

### **Storage Management (4 tools)**
- `list_datastores` - List storage profiles and datastores
- `vm_add_disk` - Add new disks to VMs
- `vm_list_disks` - List VM disks
- `vm_resize_disk` - Resize VM disks

### **Networking (5 tools)**
- `list_networks` - List organization VDC networks
- `list_firewall_rules` - List firewall rules for edge gateways
- `create_org_network` - Create organization networks
- `list_nat_rules` - List NAT rules for edge gateways
- `list_dhcp_pools` - List DHCP pools for edge gateways
- `list_ip_allocations` - List IP address allocations

### **Templates & Catalogs (3 tools)**
- `list_catalogs` - List organization catalogs
- `list_catalog_items` - List items in catalogs
- `get_template_details` - Get VM template details

### **Monitoring & Health (4 tools)**
- `list_tasks` - List recent tasks and operations
- `get_vm_metrics` - Get VM performance metrics
- `list_events` - List system events and alerts
- `get_org_health` - Get organization health status
- `get_resource_metrics` - Get detailed resource utilization metrics

## 💬 Example Interactions

### **Infrastructure Management**
- "Show me all organizations and their resource usage"
- "List all VDCs and their capabilities"
- "What's the health status of my organization?"
- "Show me storage utilization across all VDCs"

### **Virtual Machine Operations**
- "List all VMs and their current status"
- "Start the VM named 'web-server-01'"
- "Create a snapshot of the database VM called 'pre-upgrade'"
- "Clone the template VM to create a new development server"
- "Add a 50GB disk to the application server"

### **Network Management**
- "Show me all organization networks and their IP usage"
- "List firewall rules for the production VDC"
- "What NAT rules are configured on the edge gateway?"
- "Show me DHCP pool configurations"

### **Monitoring & Troubleshooting**
- "Show me all tasks from the last 24 hours"
- "What events occurred in the last week?"
- "Get performance metrics for the database VM"
- "Show me the status of all running vApps"

### **Template & Catalog Management**
- "List all available catalogs and their contents"
- "Show me Ubuntu templates in the catalog"
- "What ISO media is available for deployment?"

## 🔒 Security & Best Practices

### **Credential Management**
- Store credentials securely using environment variables
- Use dedicated service accounts with minimal required permissions
- Regularly rotate credentials and API keys
- Never commit credentials to version control

### **Network Security**
- Ensure SSL/TLS encryption for all API communications
- Implement IP allowlisting for production environments
- Use VPN connections for accessing private cloud instances
- Validate SSL certificates in production (disabled in development)

### **Access Control**
- Implement role-based access controls
- Use principle of least privilege
- Monitor and audit API access logs
- Implement session timeouts and re-authentication

## 🔧 Technical Details

### **API Compatibility**
- **CloudAPI 1.0.0**: Primary API for modern operations
- **Legacy XML API**: Fallback for comprehensive resource access
- **Supported VCD Versions**: 37.0+ (tested with 39.1)
- **Authentication**: Bearer token with automatic session management

### **Architecture**
```
src/
├── server.ts          # Main MCP server with all 32 tools
├── index.ts           # Entry point and environment setup
build/                 # Compiled TypeScript output
├── server.js          # Compiled server
├── index.js           # Compiled entry point
```

### **Error Handling**
- Comprehensive error handling for all API operations
- Automatic fallback between CloudAPI and Legacy API
- Graceful handling of permission errors and resource limitations
- Detailed error messages for troubleshooting

## 🐛 Troubleshooting

### **Authentication Issues**
```bash
# Test authentication
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "vcd_login", "arguments": {}}}' | node build/index.js
```

### **Common Problems**
1. **404 Errors**: Check API version compatibility and endpoint availability
2. **Permission Errors**: Verify user has required roles and permissions
3. **SSL Errors**: Ensure proper certificate validation in production
4. **VM Visibility**: Some VMs may require admin permissions to view

### **Debug Commands**
```bash
# List all available tools
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node build/index.js

# Test organization health
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_org_health", "arguments": {}}}' | node build/index.js
```

## 📊 Supported VMware Cloud Director Features

### **✅ Fully Supported**
- Organization and VDC management
- vApp lifecycle operations
- Network configuration and monitoring
- Storage management and monitoring
- Catalog and template management
- Task and event monitoring
- Firewall rule management

### **⚠️ Limited Support**
- VM-level operations (depends on user permissions)
- Advanced networking features (requires NSX-T)
- Snapshot operations (VM must be powered off)

### **❌ Not Supported**
- User and role management
- Provider-level operations
- Advanced security features
- Cross-site operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- VMware for the Cloud Director API
- Anthropic for the Model Context Protocol
- zettagrid.com team for the test environment
- The open-source community for tools and libraries

---

**⭐ Star this repository if you find it useful!**
