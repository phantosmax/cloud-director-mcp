#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import https from 'https';

interface VcdConfig {
  baseUrl: string;
  username: string;
  password: string;
  org: string;
  apiVersion: string;
}

interface VcdSession {
  token: string;
  expires: Date;
}

class VmwareCloudDirectorMCPServer {
  private server: Server;
  private vcdClient: AxiosInstance;
  private session: VcdSession | null = null;
  private config: VcdConfig;

  constructor() {
    this.server = new Server(
      {
        name: 'vmware-cloud-director',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Load configuration from environment variables
    this.config = {
      baseUrl: process.env.VCD_BASE_URL || '',
      username: process.env.VCD_USERNAME || '',
      password: process.env.VCD_PASSWORD || '',
      org: process.env.VCD_ORG || '',
      apiVersion: process.env.VCD_API_VERSION || '37.2',
    };

    // Create axios instance with SSL configuration
    this.vcdClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Set to true in production with valid certs
      }),
      headers: {
        'Accept': `application/*+json;version=${this.config.apiVersion}`,
        'Content-Type': 'application/json',
      },
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'vcd_login',
            description: 'Authenticate with VMware Cloud Director',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_orgs',
            description: 'List all organizations',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_vdcs',
            description: 'List virtual data centers for the organization',
            inputSchema: {
              type: 'object',
              properties: {
                orgId: {
                  type: 'string',
                  description: 'Organization ID (optional, uses configured org if not provided)',
                },
              },
            },
          },
          {
            name: 'list_vapps',
            description: 'List vApps in a virtual data center',
            inputSchema: {
              type: 'object',
              properties: {
                vdcId: {
                  type: 'string',
                  description: 'Virtual Data Center ID',
                },
              },
              required: ['vdcId'],
            },
          },
          {
            name: 'list_vms',
            description: 'List virtual machines in a vApp',
            inputSchema: {
              type: 'object',
              properties: {
                vappId: {
                  type: 'string',
                  description: 'vApp ID',
                },
              },
              required: ['vappId'],
            },
          },
          {
            name: 'get_vm_details',
            description: 'Get detailed information about a virtual machine',
            inputSchema: {
              type: 'object',
              properties: {
                vmId: {
                  type: 'string',
                  description: 'Virtual Machine ID',
                },
              },
              required: ['vmId'],
            },
          },
          {
            name: 'vm_power_action',
            description: 'Perform power actions on a virtual machine (start, stop, restart, suspend)',
            inputSchema: {
              type: 'object',
              properties: {
                vmId: {
                  type: 'string',
                  description: 'Virtual Machine ID',
                },
                action: {
                  type: 'string',
                  enum: ['powerOn', 'powerOff', 'reset', 'suspend', 'resume'],
                  description: 'Power action to perform',
                },
              },
              required: ['vmId', 'action'],
            },
          },
          {
            name: 'list_networks',
            description: 'List organization networks',
            inputSchema: {
              type: 'object',
              properties: {
                orgId: {
                  type: 'string',
                  description: 'Organization ID (optional, uses configured org if not provided)',
                },
              },
            },
          },
          {
            name: 'get_resource_usage',
            description: 'Get resource usage statistics for the organization',
            inputSchema: {
              type: 'object',
              properties: {
                orgId: {
                  type: 'string',
                  description: 'Organization ID (optional, uses configured org if not provided)',
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'vcd_login':
            return await this.handleLogin();
          
          case 'list_orgs':
            return await this.handleListOrgs();
          
          case 'list_vdcs':
            return await this.handleListVdcs(args?.orgId);
          
          case 'list_vapps':
            return await this.handleListVapps(args?.vdcId);
          
          case 'list_vms':
            return await this.handleListVms(args?.vappId);
          
          case 'get_vm_details':
            return await this.handleGetVmDetails(args?.vmId);
          
          case 'vm_power_action':
            return await this.handleVmPowerAction(args?.vmId, args?.action);
          
          case 'list_networks':
            return await this.handleListNetworks(args?.orgId);
          
          case 'get_resource_usage':
            return await this.handleGetResourceUsage(args?.orgId);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.session || this.session.expires <= new Date()) {
      await this.authenticate();
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await this.vcdClient.post('/api/sessions', {
        username: this.config.username,
        password: this.config.password,
        org: this.config.org,
      });

      this.session = {
        token: response.headers['x-vcloud-authorization'],
        expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };

      // Set the authorization header for future requests
      this.vcdClient.defaults.headers.common['x-vcloud-authorization'] = this.session.token;
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleLogin() {
    await this.authenticate();
    return {
      content: [
        {
          type: 'text',
          text: 'Successfully authenticated with VMware Cloud Director',
        },
      ],
    };
  }

  private async handleListOrgs() {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.vcdClient.get('/api/org');
      const orgs = response.data.org || [];
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${orgs.length} organizations:\n${orgs.map((org: any) => 
              `- ${org.name} (ID: ${org.id})`
            ).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list organizations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleListVdcs(orgId?: string) {
    await this.ensureAuthenticated();
    
    try {
      const targetOrg = orgId || this.config.org;
      const response = await this.vcdClient.get(`/api/org/${targetOrg}/vdcs/query`);
      const vdcs = response.data.record || [];
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${vdcs.length} virtual data centers:\n${vdcs.map((vdc: any) => 
              `- ${vdc.name} (ID: ${vdc.href?.split('/').pop()})`
            ).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list VDCs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleListVapps(vdcId: string) {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.vcdClient.get(`/api/vdc/${vdcId}/vapps/query`);
      const vapps = response.data.record || [];
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${vapps.length} vApps:\n${vapps.map((vapp: any) => 
              `- ${vapp.name} (Status: ${vapp.status}, ID: ${vapp.href?.split('/').pop()})`
            ).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list vApps: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleListVms(vappId: string) {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.vcdClient.get(`/api/vapp/${vappId}/vms/query`);
      const vms = response.data.record || [];
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${vms.length} virtual machines:\n${vms.map((vm: any) => 
              `- ${vm.name} (Status: ${vm.status}, CPU: ${vm.numberOfCpus}, Memory: ${vm.memoryMB}MB)`
            ).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list VMs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleGetVmDetails(vmId: string) {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.vcdClient.get(`/api/vm/${vmId}`);
      const vm = response.data;
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(vm, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get VM details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleVmPowerAction(vmId: string, action: string) {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.vcdClient.post(`/api/vm/${vmId}/action/${action}`);
      
      return {
        content: [
          {
            type: 'text',
            text: `Power action '${action}' initiated for VM ${vmId}. Task ID: ${response.data.id}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to perform power action: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleListNetworks(orgId?: string) {
    await this.ensureAuthenticated();
    
    try {
      const targetOrg = orgId || this.config.org;
      const response = await this.vcdClient.get(`/api/org/${targetOrg}/networks`);
      const networks = response.data.network || [];
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${networks.length} networks:\n${networks.map((network: any) => 
              `- ${network.name} (Type: ${network.type})`
            ).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list networks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleGetResourceUsage(orgId?: string) {
    await this.ensureAuthenticated();
    
    try {
      const targetOrg = orgId || this.config.org;
      const response = await this.vcdClient.get(`/api/org/${targetOrg}`);
      const org = response.data;
      
      return {
        content: [
          {
            type: 'text',
            text: `Resource usage for organization ${org.name}:\n${JSON.stringify(org.quotas || {}, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get resource usage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VMware Cloud Director MCP server running on stdio');
  }
}

// Start the server
const server = new VmwareCloudDirectorMCPServer();
server.run().catch(console.error);