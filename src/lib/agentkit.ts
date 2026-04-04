import 'server-only';

import { createWorldBridgeStore } from '@worldcoin/idkit-core';
import { solidityEncode } from '@worldcoin/idkit-core/hashing';
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

const APP_ID = 'app_a7c3e2b6b83927251a0db5345bd7146a';
const ACTION = 'agentbook-registration';
const RELAY_URL = 'https://x402-worldchain.vercel.app';

export function generateAgentWallet() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { privateKey, address: account.address };
}

function getWorldChainClient() {
  return createPublicClient({ chain: worldchain, transport: http() });
}

async function getNextNonce(agentAddress: `0x${string}`): Promise<bigint> {
  const client = getWorldChainClient();
  return client.readContract({
    address: AGENT_BOOK_CONTRACT,
    abi: AGENT_BOOK_ABI,
    functionName: 'getNextNonce',
    args: [agentAddress],
  });
}

// Active bridge sessions keyed by agent address
const bridgeSessions = new Map<string, ReturnType<typeof createWorldBridgeStore>>();

export async function startAgentBookSession(agentAddress: `0x${string}`) {
  const nonce = await getNextNonce(agentAddress);
  const signal = solidityEncode(['address', 'uint256'], [agentAddress, nonce]);

  const worldID = createWorldBridgeStore();
  await worldID.getState().createClient({
    app_id: APP_ID,
    action: ACTION,
    signal,
  });

  const connectorURI = worldID.getState().connectorURI;
  if (!connectorURI) {
    throw new Error('Failed to create bridge session');
  }

  bridgeSessions.set(agentAddress, worldID);

  return { connectorURI, nonce: nonce.toString() };
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

export type PollResult =
  | { status: 'pending' }
  | { status: 'completed'; txHash?: string }
  | { status: 'error'; message: string };

export async function pollAgentBookSession(agentAddress: `0x${string}`): Promise<PollResult> {
  const worldID = bridgeSessions.get(agentAddress);
  if (!worldID) {
    return { status: 'error', message: 'No active session' };
  }

  await worldID.getState().pollForUpdates();
  const { result, errorCode } = worldID.getState();

  if (errorCode) {
    bridgeSessions.delete(agentAddress);
    return { status: 'error', message: errorCode };
  }

  if (!result) {
    return { status: 'pending' };
  }

  // Verification completed — submit to relay
  bridgeSessions.delete(agentAddress);

  const proof = normalizeProof(result.proof);
  if (!proof) {
    return { status: 'error', message: 'Invalid proof format' };
  }

  const nonce = await getNextNonce(agentAddress);

  const response = await fetch(`${RELAY_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentAddress,
      root: result.merkle_root,
      nonce: nonce.toString(),
      nullifierHash: result.nullifier_hash,
      proof,
      contract: AGENT_BOOK_CONTRACT,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { status: 'error', message: `Relay failed (${response.status}): ${body}` };
  }

  const relayResult = (await response.json()) as { txHash?: string };
  return { status: 'completed', txHash: relayResult.txHash };
}
