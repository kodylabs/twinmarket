export interface TwinCardData {
  slug: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  ensName: string | null;
  walletAddress: string | null;
  totalCalls: number;
  pricePerCall: string;
  verified: boolean;
  verificationLevel: string | null;
}

interface AgentRow {
  slug: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  ensName: string | null;
  walletAddress: string | null;
  totalCalls: number;
  pricePerCall: string;
  creatorNullifierHash?: string | null;
  creatorVerificationLevel?: string | null;
}

export function mapAgentToTwin(agent: AgentRow): TwinCardData {
  return {
    slug: agent.slug,
    name: agent.name,
    description: agent.description,
    avatarUrl: agent.avatarUrl,
    ensName: agent.ensName,
    walletAddress: agent.walletAddress,
    totalCalls: agent.totalCalls,
    pricePerCall: agent.pricePerCall,
    verified: !!agent.creatorNullifierHash,
    verificationLevel: agent.creatorVerificationLevel ?? null,
  };
}
