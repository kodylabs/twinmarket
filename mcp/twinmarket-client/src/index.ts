import { GatewayClient } from '@circle-fin/x402-batching/client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';

const baseURL = process.env.TWINMARKET_API_URL || 'http://localhost:3000';
const evmPrivateKey = process.env.EVM_PRIVATE_KEY as `0x${string}`;

async function main() {
  if (!evmPrivateKey) {
    throw new Error('EVM_PRIVATE_KEY environment variable is required');
  }

  // Gateway client for x402 payments on Arc testnet
  const gateway = new GatewayClient({
    chain: 'arcTestnet',
    privateKey: evmPrivateKey,
  });

  // Regular HTTP client for non-paid endpoints
  const http = axios.create({ baseURL });

  const server = new McpServer({
    name: 'twinmarket',
    version: '1.0.0',
  });

  // Tool 1: List available agents on the marketplace (free)
  server.registerTool(
    'list-agents',
    {
      title: 'List available AI agents on the TwinMarket marketplace',
      description: 'Returns name, slug, description, and usage stats.',
    },
    async () => {
      const res = await http.get('/api/trpc/agents.list');
      const agents = res.data?.result?.data?.json ?? res.data;
      return {
        content: [{ type: 'text', text: JSON.stringify(agents, null, 2) }],
      };
    },
  );

  // Tool 2: Call an agent (x402 payment via Circle Gateway — gasless)
  server.registerTool(
    'call-agent',
    {
      title: 'Send a message to a paid AI agent on TwinMarket',
      description: 'Payment in USDC (Arc testnet) is handled automatically via x402 + Circle Gateway. Gasless.',
      inputSchema: {
        slug: z.string().describe('Agent slug (e.g. "solidity-expert"). Use list-agents to discover available agents.'),
        message: z.string().describe('Message to send to the agent'),
      },
    },
    async (args) => {
      const { slug, message } = args;
      const result = await gateway.pay(`${baseURL}/api/agents/${slug}/chat`, {
        method: 'POST',
        body: { message },
        headers: { 'Content-Type': 'application/json' },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
      };
    },
  );

  // Tool 3: Check Gateway balance
  server.registerTool(
    'get-balance',
    {
      title: 'Check your USDC balance',
      description: 'Shows your wallet balance and Gateway balance (available for agent calls).',
    },
    async () => {
      const balances = await gateway.getBalances();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                wallet: balances.wallet.formatted,
                gateway: {
                  available: balances.gateway.formattedAvailable,
                  total: balances.gateway.formattedTotal,
                },
                address: gateway.address,
                network: 'Arc testnet',
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Tool 4: Deposit USDC into Gateway (one-time, requires gas)
  server.registerTool(
    'deposit',
    {
      title: 'Deposit USDC into Gateway for gasless agent payments',
      description:
        'Moves USDC from your wallet into Circle Gateway. This is a one-time on-chain transaction. After deposit, all agent calls are gasless.',
      inputSchema: {
        amount: z.string().describe('Amount of USDC to deposit (e.g. "1.00")'),
      },
    },
    async (args) => {
      const result = await gateway.deposit(args.amount);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                deposited: result.formattedAmount,
                depositTx: result.depositTxHash,
                approvalTx: result.approvalTxHash ?? null,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Tool 5: Withdraw USDC from Gateway back to wallet
  server.registerTool(
    'withdraw',
    {
      title: 'Withdraw USDC from Gateway back to your wallet',
      description: 'Moves USDC from Circle Gateway back to your wallet. Instant on same chain.',
      inputSchema: {
        amount: z.string().describe('Amount of USDC to withdraw (e.g. "0.50")'),
      },
    },
    async (args) => {
      const result = await gateway.withdraw(args.amount);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                withdrawn: result.formattedAmount,
                tx: result.mintTxHash,
              },
              null,
              2,
            ),
          },
        ],
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
