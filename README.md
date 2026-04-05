# TwinMarket

**Monetize your human expertise through an autonomous AI agent, without ever sharing your knowledge.**

## Table of Contents

- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Sponsor Integrations](#sponsor-integrations)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)

Built for [ETHGlobal Cannes 2026](https://ethglobal.com/events/cannes2026).

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PUBLIC                                       │
│   Homepage  →  Marketplace (/twins)  →  Agent Detail (/twins/[slug]) │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                  Connect Wallet (RainbowKit + SIWE)
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│                       PROTECTED                                      │
│              BetterAuth session + World ID Gate                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
              ┌────────────▼─────────────┐
              │   World ID Verification  │
              │   Proof of humanity      │
              │   nullifierHash → DB     │
              └────────────┬─────────────┘
                           │
          ┌────────────────▼──────────────────┐
          │     Agent Creation Wizard         │
          │  1. Identity (name, bio, avatar)  │
          │  2. Persona (system prompt)       │
          │  3. Skills (knowledge blocks)     │
          │  4. Review & submit               │
          └────────────────┬──────────────────┘
                           │
              ┌────────────▼─────────────┐
              │       On Submit          │
              │                          │
              │  ┌─ ENS subname mint     │
              │  │  + text records       │
              │  │                       │
              │  ├─ AgentBook register   │
              │  │  (Worldchain ZK)      │
              │  │                       │
              │  ├─ ZK commitment        │
              │  │  (Poseidon hash)      │
              │  │                       │
              │  └─ DB insert            │
              │     (agent + skills)     │
              └────────────┬─────────────┘
                           │
                           ▼
              Agent live in Marketplace
                           │
                           ▼
          ┌────────────────────────────────────┐
          │  POST /api/agents/[slug]/chat      │
          │                                    │
          │  1. x402 middleware validates      │
          │     USDC payment (from header)     │
          │  2. Price resolved from ENS record │
          │  3. LLM called with system prompt  │
          │     + skills (never exposed)       │
          │  4. Response returned to buyer     │
          │  5. Agent totalCalls incremented   │
          └────────────────────────────────────┘
```

---

## How It Works

### Create: Expert builds a digital twin

1. Connect wallet and sign in (SIWE)
2. Verify humanity with World ID (one agent per human)
3. Fill the 4-step creation wizard: identity, system prompt, skills, pricing
4. On submit: ENS subname minted, agent registered in AgentBook, ZK commitment stored on-chain
5. Agent goes live on the marketplace: works 24/7

### Discover: Buyer browses the marketplace

1. Browse agents by trending or latest
2. Each card shows: name, description, skills, price, call count, World ID badge
3. Agent detail page displays ENS name (`agent.twinmarket.eth`), AgentBook verification status
4. ENS text records make agents discoverable on-chain, even outside TwinMarket

### Pay & Use: x402 payment → agent response

1. Buyer sends a message to an agent
2. Server returns HTTP 402: wallet auto-signs a USDC micro-payment
3. Request retries with payment proof in `X-PAYMENT` header
4. Agent executes (LLM + expert's knowledge) and returns the result
5. Expert receives USDC: buyer gets expert-level output. Knowledge never exposed.

---

## Sponsor Integrations

### World: World ID + AgentBook

- **World ID 4.0**: Every agent creator must verify their humanity via IDKit. The `nullifierHash` enforces **one human = one agent**: no bot spam, no duplicate accounts.
- **AgentBook**: Each agent is registered on Worldchain as "human-backed". The registration uses ZK proofs verified on-chain. Buyer-facing UI shows verification badges.
- **Without World ID, nothing works**: unverified users are blocked at the gate before accessing any protected feature.

### ENS: On-chain Agent Identity

- Each agent gets a **dynamic ENS subname** (e.g., `solidity-expert.twinmarket.eth`) minted at creation time via NameStone API on Sepolia.
- **Text records** store agent metadata on-chain:
  - `description`: what the agent does
  - `avatar`: agent avatar URL
  - `price`: per-call cost (read by x402 middleware)
  - `world.verified`: creator's World ID verification status
  - `prompt.zkcommit`: Poseidon hash of system prompt + skills
- Any client can **resolve the ENS name** to discover the agent and its capabilities: fully interoperable, not locked to TwinMarket.

### Arc / Circle: x402 Nanopayments

- **x402 protocol**: The `/api/agents/[slug]/chat` endpoint is wrapped with x402 middleware. No payment form, no Stripe, no subscription: payment is native to HTTP.
- **Circle nanopayments**: Gas-free USDC transfers on Arc testnet, down to sub-cent amounts. Settlement is batched through Circle's facilitator gateway.
- **Price resolution**: The middleware reads the agent's price from its ENS text record, so pricing is on-chain and verifiable.
- The expert's earnings dashboard shows cumulative income from all micro-payments.

### ZK Commitment: Knowledge Integrity

- On agent creation, a **Poseidon hash** of the system prompt + all skill blocks is computed (via `circomlibjs`).
- This commitment is stored in the ENS `prompt.zkcommit` text record.
- Proves the agent's knowledge hasn't been tampered with: without revealing what the knowledge is.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Database | PostgreSQL + Drizzle ORM |
| API | tRPC + React Query |
| Auth | BetterAuth + SIWE (Sign In With Ethereum) |
| Wallet | wagmi v3 + viem v2 + RainbowKit |
| Identity | World ID (IDKit v4) + Worldchain AgentBook |
| Naming | ENS subnames (ensjs v4 + NameStone API) |
| Payments | x402-next + Circle Nanopayments (Arc testnet) |
| LLM | OpenRouter (Gemini 2.5 Flash) |
| ZK | Poseidon hashing (circomlibjs) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Linting | Biome |
| Package Manager | Bun |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/[slug]/chat/   # x402-protected chat endpoint
│   │   ├── auth/[...all]/        # BetterAuth routes
│   │   └── trpc/[trpc]/          # tRPC handler
│   ├── (protected)/              # Auth + World ID gate
│   │   ├── my-twin/
│   │   │   ├── create/           # 4-step creation wizard
│   │   │   └── dashboard.tsx     # Expert earnings & stats
│   │   └── profile/
│   ├── twins/
│   │   ├── page.tsx              # Marketplace listing
│   │   └── [slug]/page.tsx       # Agent detail page
│   └── page.tsx                  # Landing page
├── components/
│   ├── world-id-gate.tsx         # World ID verification widget
│   ├── zk-commitment-badge.tsx   # ZK proof visualization
│   ├── twins/                    # Marketplace cards & sections
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── auth/                     # BetterAuth + SIWE config
│   ├── db/                       # Drizzle schema & client
│   ├── llm/                      # OpenRouter LLM client
│   ├── agentkit.ts               # Worldchain AgentBook integration
│   ├── ens.ts                    # ENS subname registration
│   ├── x402.ts                   # x402 payment config
│   ├── zk.ts                     # Poseidon ZK commitment
│   └── price-resolver.ts         # ENS-based price lookup
└── trpc/
    └── routers/
        ├── agents.ts             # Agent CRUD & marketplace queries
        └── world-id.ts           # World ID verification
```

---

## Getting Started

```bash
# 1. Clone & install
git clone https://github.com/your-org/twinmarket.git
cd twinmarket
bun install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Configure environment
cp .env.example .env
# Fill in: DATABASE_URL, BETTER_AUTH_SECRET, WLD keys, ENS keys, OPENROUTER_API_KEY

# 4. Push schema & seed
bun run db:push
bun run db:seed

# 5. Run
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).
