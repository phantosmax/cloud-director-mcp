# VMware Cloud Director MCP Server

A Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with VMware Cloud Director APIs. This server provides tools for managing virtual machines, vApps, organizations, and networks through natural language interactions.

## Features

- **Authentication Management**: Secure login and session management with VMware Cloud Director
- **Organization Management**: List and manage organizations
- **Virtual Data Center Operations**: Browse and manage VDCs
- **vApp Management**: List and control vApps
- **Virtual Machine Control**: 
  - List VMs and get detailed information
  - Power operations (start, stop, restart, suspend, resume)
- **Network Management**: List and manage organization networks
- **Resource Monitoring**: Get resource usage statistics

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure your VMware Cloud Director settings in `.env`:
   ```
   VCD_BASE_URL=https://your-vcd-instance.com
   VCD_USERNAME=your-username
   VCD_PASSWORD=your-password
   VCD_ORG=your-organization
   VCD_API_VERSION=37.2
   ```

5. Build the server:
   ```bash
   npm run build
   ```

## Usage

### Running the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

### Integrating with Claude Desktop

Add this server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vmware-cloud-director": {
      "command": "node",
      "args": ["/path/to/your/vmware-cloud-director-mcp-server/build/index.js"],
      "env": {
        "VCD_BASE_URL": "https://your-vcd-instance.com",
        "VCD_USERNAME": "your-username",
        "VCD_PASSWORD": "your-password",
        "VCD_ORG": "your-organization",
        "VCD_API_VERSION": "37.2"
      }
    }
  }
}
```

## Available Tools

### Authentication
- `vcd_login`: Authenticate with VMware Cloud Director

### Organization Management
- `list_orgs`: List all accessible organizations
- `get_resource_usage`: Get resource usage statistics for an organization

### Infrastructure Management
- `list_vdcs`: List virtual data centers
- `list_networks`: List organization networks

### vApp Management
- `list_vapps`: List vApps in a virtual data center

### Virtual Machine Management
- `list_vms`: List virtual machines in a vApp
- `get_vm_details`: Get detailed information about a virtual machine
- `vm_power_action`: Perform power actions (powerOn, powerOff, reset, suspend, resume)

## Example Interactions

Once configured, you can interact with your VMware Cloud Director through Claude:

- "Show me all the organizations I have access to"
- "List the virtual machines in my production vApp"
- "Start the VM named 'web-server-01'"
- "What's the current resource usage for my organization?"
- "Show me all networks in the organization"

## Security Considerations

- Store credentials securely using environment variables
- Use strong passwords and consider implementing API key authentication
- In production environments, ensure SSL certificates are properly validated
- Consider implementing role-based access controls
- Regularly rotate credentials

## API Version Compatibility

This server is tested with VMware Cloud Director API versions:
- 37.2 (default)
- 36.0+

To use a different API version, update the `VCD_API_VERSION` environment variable.

## Error Handling

The server includes comprehensive error handling for:
- Authentication failures
- Network connectivity issues
- API rate limiting
- Invalid resource IDs
- Permission errors

## Development

### Project Structure
```
src/
  index.ts          # Main MCP server implementation
build/              # Compiled JavaScript output
package.json        # Dependencies and scripts
tsconfig.json       # TypeScript configuration
.env.example        # Environment variable template
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify credentials in `.env` file
   - Check that the user has appropriate permissions
   - Ensure the organization name is correct

2. **SSL Certificate Errors**
   - For development, the server disables SSL verification
   - In production, ensure valid SSL certificates are installed

3. **API Version Mismatches**
   - Check your VMware Cloud Director version
   - Update `VCD_API_VERSION` to match your instance

4. **Network Connectivity**
   - Verify the base URL is accessible
   - Check firewall settings
   - Ensure the API endpoint is enabled

## License

MIT License - see LICENSE file for details
