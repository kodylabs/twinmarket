import 'server-only';

import { createPublicClient, decodeAbiParameters, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { worldchain } from 'viem/chains';

const AGENT_BOOK_CONTRACT = '0xA23aB2712eA7BBa896930544C7d6636a96b944dA' as const;
const AGENT_BOOK_ABI = [
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'getNextNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const RELAY_URL = 'https://x402-worldchain.vercel.app';

export function generateAgentWallet() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { privateKey, address: account.address };
}

function getWorldChainClient() {
  return createPublicClient({ chain: worldchain, transport: http() });
}

export async function getAgentBookNonce(agentAddress: `0x${string}`): Promise<string> {
  const client = getWorldChainClient();
  const nonce = await client.readContract({
    address: AGENT_BOOK_CONTRACT,
    abi: AGENT_BOOK_ABI,
    functionName: 'getNextNonce',
    args: [agentAddress],
  });
  return nonce.toString();
}

function normalizeProof(rawProof: string): string[] | null {
  if (rawProof.startsWith('[')) {
    try {
      const parsed = JSON.parse(rawProof);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
  }
  try {
    const decoded = decodeAbiParameters([{ type: 'uint256[8]' }], rawProof as `0x${string}`)[0];
    return decoded.map((v) => `0x${v.toString(16).padStart(64, '0')}`);
  } catch {
    return null;
  }
}

interface AgentBookProof {
  merkleRoot: string;
  nullifierHash: string;
  proof: string;
  nonce: string;
}

export async function submitAgentBookRegistration(
  agentAddress: string,
  worldIdProof: AgentBookProof,
): Promise<{ txHash?: string }> {
  const proof = normalizeProof(worldIdProof.proof);
  if (!proof) {
    throw new Error('Invalid proof format');
  }

  const response = await fetch(`${RELAY_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentAddress,
      root: worldIdProof.merkleRoot,
      nonce: worldIdProof.nonce,
      nullifierHash: worldIdProof.nullifierHash,
      proof,
      contract: AGENT_BOOK_CONTRACT,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Relay failed (${response.status}): ${body}`);
  }

  return response.json();
}
