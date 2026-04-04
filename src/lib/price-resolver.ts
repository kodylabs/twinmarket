/**
 * Resolves agent pricing from ENS text records (on-chain).
 *
 * Reads `price` from {slug}.twinmarket.eth on Sepolia.
 * Returns null for both if the agent is free or records are missing.
 */

import { getAgentPricing } from '@/lib/ens';

export interface AgentPricing {
  price: number | null;
  agentAddress: string | null;
}

export async function resolveAgentPricing(slug: string): Promise<AgentPricing> {
  const { price: priceText, agentAddress } = await getAgentPricing(slug);

  if (!priceText || !agentAddress) {
    return { price: null, agentAddress: null };
  }

  const price = parseFloat(priceText.replace('$', ''));
  if (Number.isNaN(price) || price <= 0) {
    return { price: null, agentAddress: null };
  }

  return { price, agentAddress };
}
