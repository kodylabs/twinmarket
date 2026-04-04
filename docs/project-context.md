# TwinMarket — Project Context

## Project identity

**Name**: TwinMarket

**Pitch**: Monetize your human expertise through an autonomous AI agent, without ever sharing your knowledge.

**30-second vision**: Every professional has know-how worth money. Today, to monetize it, they must either sell their time (consulting) or give away their knowledge (courses, articles). TwinMarket creates a third way: you create a "digital twin" — an AI agent that holds your expertise — and others pay to use it. You earn money while you sleep. Your knowledge never leaves your agent.

**Context**: ETHGlobal Cannes 2026 Hackathon (April 3-5). Deadline Sunday April 5th 09:00 AM CEST. Time budget: 36 hours. Team size: 2-4 people.

---

## The problem

### For experts

Experienced professionals (cybersecurity, legal, finance, senior devs, medicine, design) are trapped in an economic bind:

- **Selling your time** doesn't scale. A cybersec consultant charges €200/h but can only work 8h/day. Revenue is capped by physical time.
- **Giving away your knowledge** devalues it. Writing a course, publishing a book, creating free content = everyone accesses your knowledge, it loses its scarcity and market value.
- **Building a SaaS** requires tech skills and 6-12 months of work. Most experts are not developers.

### For buyers

Startups, freelancers, and SMBs need on-demand expertise:

- Hiring a consultant for a single question is expensive (billing minimums, scheduling delays).
- Generic ChatGPT answers lack specialized domain expertise.
- There is no marketplace for per-call on-demand expertise.

### Why now?

Three technologies converge in 2026 to make this project possible:

1. **x402** (Coinbase/Cloudflare): HTTP-native payments — an agent can pay another agent per API request with no account or credit card.
2. **World ID 4.0**: Cryptographic proof of humanity — we can guarantee an agent is backed by a real, unique human, not a bot.
3. **Circle Nanopayments**: Gas-free USDC transfers down to $0.000001 — per-API-call payments become economically viable.

---

## Target users

### Persona 1 — The Expert (agent creator)

**Concrete example**: Jean, 38, cybersecurity expert for 12 years. He works as an independent pentester. He knows Solidity smart contract vulnerabilities inside out (reentrancy, overflow, access control). He charges €250/h for consulting.

**What he wants**: Generate passive income from his expertise without spending more time consulting.

**What he does on TwinMarket**:
1. Connects his wallet, verifies his humanity via World ID
2. Creates an agent by describing his expertise in a detailed system prompt
3. Configures his skills ("smart-contract-audit", "pentest-report") and his price ($0.05/call)
4. His agent receives an ENS name: `jean-cybersec.twinmarket.eth`
5. He does nothing more. His agent works for him 24/7.

**What he does NOT do**: He doesn't teach, doesn't publish courses, doesn't share his methodologies. His agent executes his expertise — it doesn't transmit it.

**Technical level**: Basic web3 (has a wallet, knows MetaMask). Not a frontend developer.

### Persona 2 — The Buyer (agent consumer)

**Concrete example**: Nicolas, 29, CTO of a 5-person web3 startup. He's launching a new DeFi protocol and needs his smart contracts audited before mainnet deployment. A full audit costs €15-50K and takes 2-4 weeks.

**What he wants**: A quick, cheap first screening of his contracts before investing in a full audit.

**What he does on TwinMarket**:
1. Browses the marketplace, discovers `jean-cybersec.twinmarket.eth`
2. Reads the description, skills, price ($0.05/call)
3. Submits his smart contract to Jean's agent
4. Pays $0.05 in USDC automatically (x402, no payment form)
5. Receives a screening report with detected vulnerabilities
6. Decides whether he needs a full human audit or if the screening is enough

**What he gets**: The result of Jean's expertise (an audit report). NOT Jean's knowledge (his methodologies, his checklists, his detection system).

**Technical level**: Developer, comfortable with wallets and crypto transactions.

---

## Business model

```
Nicolas pays $0.05 in USDC
    │
    ▼
x402 middleware verifies the payment
    │
    ▼
Circle nanopayments aggregates micro-payments (gas-free)
    │
    ▼
Jean's agent executes the request (LLM + knowledge)
    │
    ▼
Nicolas receives the result ← Jean receives $0.05 in USDC (passive)
```

**Revenue model**: Pay-per-call. Each call to an agent costs a fixed amount set by the expert. No subscriptions, no freemium, no ads. Payment is native to the HTTP protocol (x402).

**What is sold**: The agent's output (the result). Never the input (the system prompt, the knowledge, the documents).

**Fundamental difference from an online course**: A course transfers knowledge (the student can then apply it alone). TwinMarket executes knowledge (the buyer gets the result but cannot reproduce the reasoning without the agent).

---

## Design principles (must be respected in all code)

### 1. Knowledge is sacred

An agent's `systemPrompt` is NEVER exposed. No API route, no endpoint, no log should ever contain an agent's system prompt. The buyer receives only `response` — never the instructions that produced it.

**Concretely in code**:
- Never include `systemPrompt` in JSON responses
- Never log the system prompt in production
- The `agents` table has a `systemPrompt` field but public queries must never select it

### 2. One human = one agent

World ID guarantees that a human can only create one agent. The `nullifier_hash` returned by World ID is unique per human per action. If an existing nullifier is detected in the DB, creation is refused.

**Why**: Prevent spam of low-quality agents. If you only get one agent, you make it count.

### 3. Payment is invisible

The buyer never fills out a payment form. The flow is:
1. Make an API request
2. Receive HTTP 402 (Payment Required)
3. The wallet automatically signs a USDC transfer
4. Resend the request with the payment proof in the header
5. Receive the response

This flow is handled by the x402 middleware — the developer has nothing to implement on the payment side.

### 4. On-chain identity via ENS

Each agent has a resolvable ENS name (e.g., `jean-cybersec.twinmarket.eth`). This name stores in its text records:
- `ai.skills`: the agent's capabilities
- `ai.price`: the per-call price
- `ai.endpoint`: the API URL
- `ai.description`: what the agent does

Any client can resolve this ENS name to discover the agent, even outside of TwinMarket.

### 5. Human-backed = trusted

Via AgentKit (World), each agent is registered in AgentBook as "human-backed". When a buyer agent calls a seller agent, AgentKit verifies that the buyer is also human-backed. No bots spamming agents.

---

## Detailed user workflows

### Workflow A — Agent creation (Expert)

```
Step 1  │ The expert lands on twinmarket.xyz
        │ → Landing page with CTA "Create your digital twin"
        │
Step 2  │ Click "Connect Wallet"
        │ → RainbowKit opens the connection modal
        │ → The expert signs a SIWE message (Sign In With Ethereum)
        │ → Session created via better-auth
        │
Step 3  │ Click "Verify my humanity"
        │ → IDKit Widget opens (World ID)
        │ → The expert opens World App on their phone
        │ → Scans QR code / deep link
        │ → Zero-Knowledge proof generated on device
        │ → Proof sent to backend → verified via World API
        │ → nullifier_hash saved in DB (unique per human)
        │
Step 4  │ Configuration form
        │ Fields:
        │   - Agent name: "Jean - Cybersec Expert"
        │   - Slug (URL): "jean-cybersec" (validated unique)
        │   - Short description: "Solidity smart contract auditing"
        │   - Skills (tags): ["smart-contract-audit", "pentest", "security-review"]
        │   - Price per call: "$0.05"
        │   - System prompt: [large textarea, this is the core]
        │     Ex: "You are a cybersecurity expert with 12 years of experience.
        │          Here are your smart contract audit methodologies:
        │          1. Check for reentrancy patterns...
        │          2. Analyze access controls...
        │          [all of Jean's expertise here]"
        │
Step 5  │ Click "Create my agent"
        │ → Agent saved in DB
        │ → ENS subname minted: jean-cybersec.twinmarket.eth
        │ → Agent registered in AgentBook (World)
        │ → Redirect to dashboard
        │
Step 6  │ Expert dashboard
        │ → View stats: number of calls, cumulative earnings
        │ → Edit system prompt or price
        │ → View call history (without messages)
```

### Workflow B — Agent usage (Buyer)

```
Step 1  │ The buyer lands on twinmarket.xyz/agents
        │ → Marketplace with list of available agents
        │ → Each card shows: name, description, skills, price, call count
        │
Step 2  │ Click on an agent (e.g., jean-cybersec)
        │ → Agent detail page
        │ → ENS name displayed: jean-cybersec.twinmarket.eth
        │ → Badge "Human-backed ✓" (verified via AgentBook)
        │ → Button "Consult this agent"
        │
Step 3  │ Chat interface
        │ → The buyer types their message:
        │   "Audit this smart contract: [pastes Solidity code]"
        │ → Click "Send"
        │
Step 4  │ Automatic payment (x402)
        │ → POST /api/agents/jean-cybersec/chat request fires
        │ → x402 middleware returns HTTP 402
        │ → The buyer's wallet signs a $0.05 USDC transfer
        │ → The request is resent with the X-PAYMENT header
        │ → The facilitator verifies and settles the payment
        │ → The request reaches the agent runtime
        │
Step 5  │ Agent response
        │ → The LLM executes with Jean's system prompt + the buyer's message
        │ → The output is returned: "Reentrancy vulnerability detected on line 42.
        │   Recommendation: use the checks-effects-interactions pattern..."
        │ → The buyer sees the response in the chat
        │ → Jean sees +$0.05 in his dashboard (async update)
```

---

## What to build (MVP scope)

### Required (must be finished for the demo)

- Landing page with pitch + CTA
- Connect wallet (RainbowKit + SIWE)
- World ID verification (IDKit)
- Agent creation form
- Marketplace page (agent listing)
- Agent detail page
- Simple chat with an agent (one question → one answer)
- x402 paywall on the chat endpoint
- Expert dashboard with stats (earnings, calls)
- At least one working ENS subname

### Out of scope (do not build during hackathon)

- Multi-turn conversation (chat with history) — a single question/answer is enough
- File uploads into the knowledge vault — text system prompt is enough
- Agent rating/review system
- Content moderation
- Multi-language support
- Mobile responsive (desktop is enough for the demo)
- Unit tests (no time during hackathon)
- CI/CD (manual Vercel deploy)

---

## Prize strategy

### Targeted sponsors (3 sponsors = 4 tracks)

| Sponsor | Track | Prize pool | Why we qualify |
|---------|-------|------------|----------------|
| World | Agent Kit | $8K | Every agent is registered in AgentBook. AgentKit distinguishes human-backed agents from bots. |
| World | World ID 4.0 | $8K | The product doesn't work without World ID — proof of humanity guarantees uniqueness (1 human = 1 agent). Backend validation required ✓ |
| ENS | Best ENS Integration for AI Agents | $5K | ENS subnames to name agents. Text records to store metadata (skills, price, endpoint). On-chain discovery. |
| Arc (Circle) | Best Agentic Economy with Nanopayments | $6K | Gas-free agent-to-agent USDC payments. Pay-per-call API via x402. Machine-to-machine commerce. |

**Total potential**: $27K (if top 1 in each track)

### What each sponsor wants to see in the demo

**World**: The moment when the expert scans World ID, and the moment when the buyer agent is verified as human-backed before accessing the service. Show that WITHOUT World ID, nothing works.

**ENS**: Type `jean-cybersec.twinmarket.eth` and show that it resolves to the agent with its metadata. Show that the subname is not hard-coded but dynamically minted.

**Arc/Circle**: Show the HTTP 402 → USDC payment → response moment. Show that the payment is gas-free and sub-cent. Show the earnings dashboard.

---

## Tech stack

```
Framework    : Next.js 16 (App Router)
Language     : TypeScript (strict)
Styling      : Tailwind CSS 4 + shadcn/ui
Auth         : better-auth + SIWE (RainbowKit)
Database     : PostgreSQL + Drizzle ORM
Blockchain   : viem + wagmi
Identity     : @worldcoin/idkit + @worldcoin/agentkit
Payments     : x402-next + @coinbase/x402 (USDC sur Arc)
Agent ID     : ERC-8004 on Arc (IdentityRegistry + ReputationRegistry)
Bridge       : @circle-fin/app-kit (CCTP bridge USDC → Arc)
Naming       : ENS (viem/ens + NameStone API)
AI           : OpenAI API (gpt-4o) or Anthropic (claude-sonnet)
Deploy       : Vercel
Linting      : Biome
```

**Code conventions**: Follow the existing Biome config — single quotes, semicolons, 2 spaces, trailing commas.

---

## Glossary for AI agents

| Term | Meaning in this project |
|------|------------------------|
| Digital twin | AI agent that reproduces a human's expertise |
| Knowledge vault | An agent's system prompt + documents — NEVER exposed |
| Human-backed | An agent whose creator proved their humanity via World ID |
| Nullifier hash | Unique anonymous identifier returned by World ID — one per human per action |
| x402 | HTTP payment protocol — returns 402 if no payment, client pays and retries |
| Nanopayment | Gas-free USDC micro-payment via Circle (down to $0.000001) |
| AgentBook | On-chain World registry that links an agent wallet to a verified human |
| ENS subname | .eth subdomain (e.g., `jean-cybersec.twinmarket.eth`) — resolvable on-chain |
| Text records | Metadata stored in an ENS name (key-value, e.g., `ai.skills` → `"audit,pentest"`) |
| Facilitator | Third-party service (Coinbase) that verifies and settles x402 payments |
| System prompt | Instructions given to the LLM that define the agent's behavior — contains all expertise |
| SIWE | Sign In With Ethereum — authentication by signing a wallet message |
| Pay-per-call | Model where each API call costs a fixed amount — no subscriptions |