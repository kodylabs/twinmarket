import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { wrapAxiosWithPayment, x402Client } from '@x402/axios';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import axios from 'axios';
import { privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';

const baseURL = process.env.TWINMARKET_API_URL || 'http://localhost:3000';
const evmPrivateKey = process.env.EVM_PRIVATE_KEY as `0x${string}`;

async function createHttpClient() {
  const client = new x402Client();
  const signer = privateKeyToAccount(evmPrivateKey);
  registerExactEvmScheme(client, { signer });
  return wrapAxiosWithPayment(axios.create({ baseURL }), client);
}

async function main() {
  if (!evmPrivateKey) {
    throw new Error('EVM_PRIVATE_KEY environment variable is required');
  }

  const api = await createHttpClient();

  const server = new McpServer({
    name: 'twinmarket',
    version: '1.0.0',
  });

  // Tool 1: List available agents on the marketplace
  server.registerTool(
    'list-agents',
    {
      title: 'List available AI agents on the TwinMarket marketplace',
      description: 'Returns name, slug, description, and usage stats.',
    },
    async () => {
      const res = await api.get('/api/trpc/agents.list');
      const agents = res.data?.result?.data?.json ?? res.data;
      return {
        content: [{ type: 'text', text: JSON.stringify(agents, null, 2) }],
      };
    },
  );

  // Tool 2: Call an agent (x402 payment handled automatically)
  server.registerTool(
    'call-agent',
    {
      title: 'Send a message to a paid AI agent on TwinMarket',
      description: 'Payment in USDC (Base Sepolia) is handled automatically via x402.',
      inputSchema: {
        slug: z.string().describe('Agent slug (e.g. "solidity-expert"). Use list-agents to discover available agents.'),
        message: z.string().describe('Message to send to the agent'),
      },
    },
    async (args) => {
      const { slug, message } = args;
      const res = await api.post(`/api/agents/${slug}/chat`, { message });
      return {
        content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Failed to start TwinMarket MCP server:', error);
  process.exit(1);
});
