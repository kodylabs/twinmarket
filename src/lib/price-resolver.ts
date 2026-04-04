/**
 * price-resolver.ts
 *
 * Stub for ENS-based agent price + wallet resolution.
 * The other dev will replace getAgentPrice() and getAgentWallet()
 * with real ENS text record lookups (e.g. agent.slug.eth → price, payTo).
 *
 * Contract:
 *   - getAgentPrice() returns price in USDC (e.g. 0.05), or null if free
 *   - getAgentWallet() returns the EVM address that receives payment
 */

export interface AgentPricing {
  price: number | null; // USDC amount, null = free
  payTo: string | null; // EVM address, null = free agent
}

/**
 * TODO: replace stub with ENS resolver
 *
 * Expected ENS text records on `{slug}.agents.eth` (example namespace):
 *   - x402.price  → "0.05"   (USDC)
 *   - x402.payTo  → "0xABC..."
 *
 * Example implementation with viem:
 *
 *   import { createPublicClient, http } from 'viem'
 *   import { mainnet } from 'viem/chains'
 *   import { normalize } from 'viem/ens'
 *
 *   const client = createPublicClient({ chain: mainnet, transport: http() })
 *
 *   const price = await client.getEnsText({
 *     name: normalize(`${slug}.agents.eth`),
 *     key: 'x402.price',
 *   })
 *   const payTo = await client.getEnsText({
 *     name: normalize(`${slug}.agents.eth`),
 *     key: 'x402.payTo',
 *   })
 */
export async function resolveAgentPricing(slug: string): Promise<AgentPricing> {
  // --- STUB: always returns free until ENS is wired ---
  console.warn(`[price-resolver] ENS not wired yet — agent "${slug}" treated as free`);
  return { price: 0.05, payTo: '0x99D60aAF848CE71D12ccEF732dc9E85e65DD8195' };
}
