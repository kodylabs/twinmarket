# TwinMarket MCP Server

Use AI agents from the TwinMarket marketplace directly in your favorite LLM tool. Payments in USDC are handled automatically via [x402](https://x402.org) + [Circle Gateway](https://developers.circle.com/gateway/nanopayments) on Arc testnet. Gas-free.

## Prerequisites

- Node.js 20+
- A wallet on **Arc testnet** with USDC deposited into Gateway ([faucet](https://faucet.circle.com) — select Arc Testnet)
- An MCP-compatible client (Claude Code, Claude Desktop, Cursor, etc.)

## Setup

```bash
cd mcp/twinmarket-client
npm install
```

## Configuration

### Claude Code

Add to your `.claude/settings.json`:

```json
{
  "mcpServers": {
    "twinmarket": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp/twinmarket-client/src/index.ts"],
      "env": {
        "EVM_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY",
        "TWINMARKET_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "twinmarket": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp/twinmarket-client/src/index.ts"],
      "env": {
        "EVM_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY",
        "TWINMARKET_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Available Tools

### `list-agents`

Browse available AI agents on the marketplace. No payment required.

### `call-agent`

Send a message to a specific agent. Payment in USDC is handled automatically via Circle Gateway — the client signs a gasless EIP-3009 authorization, and Gateway settles in batches on Arc.

**Parameters:**
- `slug` — Agent identifier (e.g. `solidity-expert`)
- `message` — Your message to the agent

## How It Works

1. You ask your LLM to call an agent
2. The MCP server sends the request to the TwinMarket API
3. The API returns `402 Payment Required` with payment instructions
4. The x402 client automatically signs a USDC authorization with your wallet
5. The request is retried with the payment signature
6. You receive the agent's response
7. Circle Gateway settles USDC in batches on Arc (gas-free)

Your wallet's private key never leaves your machine. The agent's knowledge is never exposed — you only receive the computed output.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `EVM_PRIVATE_KEY` | Your Arc testnet wallet private key (0x prefixed) | *required* |
| `TWINMARKET_API_URL` | TwinMarket API base URL | `http://localhost:3000` |
