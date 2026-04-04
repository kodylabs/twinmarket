# ENS Integration

TwinMarket assigns each agent a subdomain under `twinmarket.eth` (e.g. `my-agent.twinmarket.eth`).
This document covers the on-chain architecture, the data model, and the transaction optimizations.

## Overview

When a user mints a Twin, the server registers an ENS subname and writes metadata records on-chain.
This gives every agent a human-readable identity that can be resolved by any ENS-compatible client.

**Network:** Sepolia testnet (target: mainnet/L2 for production)
**Contracts used:**

| Contract | Address | Purpose |
|---|---|---|
| ENS Registry | `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e` | Owns the name tree, stores owner/resolver/TTL per node |
| Public Resolver | `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5` | Stores text records, coin addresses, content hashes |

**Parent domain:** `twinmarket.eth` — owned by a server-side wallet (`ENS_OWNER_PRIVATE_KEY`).

## Registration Flow

Registration happens inside the `agents.create` tRPC mutation (`src/trpc/routers/agents.ts`).

```
agents.prepareCreate          agents.create
─────────────────          ──────────────────────────────────────────
generate wallet ──┐        ┌─ registerEnsName() ─────────────────┐
get nonce ────────┤        │  TX1: setSubnodeRecord (nonce N)    │
return to client ─┘        │  TX2: setRecords      (nonce N+1)  │
                           ├─ submitAgentBookRegistration() ─────┤
       user scans QR       │        (parallel with ENS)          │
       ───────────>        └─────────────────────────────────────┘
                                         │
                                    DB transaction
                                    (insert agent + skills)
```

### Step 1 — `prepareCreate`

Generates an agent wallet and fetches the AgentBook nonce from WorldChain. Returns both to the client so the World App bridge can produce a proof.

### Step 2 — `registerEnsName` (`src/lib/ens.ts`)

Two on-chain transactions, sent simultaneously to the mempool:

**TX1: `setSubnodeRecord`** on the ENS Registry
- Creates `<slug>.twinmarket.eth` as a subnode
- Sets the owner to the ENS owner wallet
- Sets the resolver to the Sepolia Public Resolver
- Uses the wallet's current nonce (`N`)

**TX2: `setRecords`** on the Public Resolver (via `@ensdomains/ensjs`)
- Writes text records: `description`, `url`, `avatar`, `world.verified`, `world.agentbook_id`
- Writes the ETH address record (the agent's wallet)
- Uses nonce `N+1` and an explicit gas limit (see [Optimizations](#optimizations))

Both transactions are fire-and-forget — the function returns the tx hashes without waiting for block confirmations.

### Step 3 — AgentBook relay

Runs in parallel with ENS registration via `Promise.all`. Submits the World ID proof to the relay server which registers the agent on the WorldChain AgentBook contract.

### Step 4 — DB insert

After both ENS and AgentBook calls return, the agent is persisted to PostgreSQL inside a transaction (agent row + skill rows).

### Records Written

| Record Key | Value | Purpose |
|---|---|---|
| `description` | Agent bio | Human-readable description |
| `url` | `https://twinmarket.app/twins/<slug>` | Agent profile link |
| `avatar` | (empty for now) | Profile image |
| `world.verified` | User's World ID verification level | Proof of personhood tier |
| `world.agentbook_id` | (empty for now) | AgentBook registration ID |
| ETH address | Agent wallet address | On-chain identity |

## Optimizations

The naive sequential approach took ~33s on Sepolia (~12s per block confirmation, 2 confirmations + serial AgentBook call). Three optimizations brought this down to ~2-4s:

### 1. Parallel ENS + AgentBook

ENS registration and the AgentBook relay are independent operations. They now run concurrently via `Promise.all` in `agents.create`.

**Saved:** ~2s (AgentBook relay no longer waits for ENS to finish)

### 2. Fire-and-forget TX receipts

Nothing downstream (DB insert, API response) depends on ENS transactions being confirmed on-chain. The `ensName` is computed locally as `${slug}.twinmarket.eth`. We send the transactions and return immediately without calling `waitForTransactionReceipt`.

**Saved:** ~12s (eliminated the second block confirmation wait)

### 3. Simultaneous mempool submission via nonce management

The second ENS transaction (`setRecords`) depends on the first (`setSubnodeRecord`) being mined — the resolver checks that the caller owns the name in the registry. Normally viem simulates each transaction before sending, and the simulation for TX2 would revert because TX1 isn't confirmed yet.

The solution:

1. Fetch the wallet's current nonce once via `getTransactionCount`
2. Send TX1 with explicit `nonce: N` (gas estimated normally — the state is valid)
3. Send TX2 with `nonce: N+1` and `gas: 1_000_000n` — the explicit gas **skips `eth_estimateGas`**, bypassing the simulation that would fail
4. Both transactions land in the mempool; the miner processes them in nonce order

This technique works because EVM nodes accept transactions with future nonces into the mempool and execute them once the preceding nonce is confirmed.

**Saved:** ~12s (eliminated the first block confirmation wait)

### Performance Summary

| Approach | Time |
|---|---|
| Naive sequential (2 waits + serial AgentBook) | ~33s |
| After Win 1+2 (1 wait + parallel AgentBook) | ~22s |
| After Win 1+2+3 (no waits + parallel) | ~2-4s |

## Environment Variables

| Variable | Purpose |
|---|---|
| `ENS_OWNER_PRIVATE_KEY` | Private key of the wallet that owns `twinmarket.eth`. Signs both ENS transactions. |
| `SEPOLIA_RPC_URL` | Sepolia JSON-RPC endpoint (e.g. Alchemy, Infura). Used for both public reads and wallet broadcasts. |

## Key Files

| File | Role |
|---|---|
| `src/lib/ens.ts` | ENS registration logic (both transactions) |
| `src/trpc/routers/agents.ts` | Orchestrates ENS + AgentBook + DB in the `create` mutation |
| `src/lib/agentkit.ts` | AgentBook nonce, wallet generation, relay submission |

## Trade-offs and Risks

**Fire-and-forget transactions:** If a transaction reverts (e.g. gas spike, contract state conflict), the agent will exist in the DB with an `ensName` that doesn't resolve on-chain. The `create` mutation is idempotent — calling it again returns the existing agent — but there is no automatic retry for failed ENS transactions. For production, consider adding a background job that verifies ENS state and retries failed registrations.

**Hardcoded gas limit on TX2:** The `1_000_000` gas limit for `setRecords` is generous for the current record set (~6 text records + 1 address). If significantly more records are added in the future, this limit may need to be increased.

**Single nonce source:** The nonce is fetched once and both TXs are sent immediately. This is safe because the ENS owner wallet is only used by the server and there are no concurrent callers. If multiple server instances ever share the same wallet, nonce collisions will occur.
