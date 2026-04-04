import { addEnsContracts } from '@ensdomains/ensjs';
import { batch, getAddressRecord, getTextRecord } from '@ensdomains/ensjs/public';
import { setRecords } from '@ensdomains/ensjs/wallet';
import { createPublicClient, createWalletClient, type Hash, http, labelhash, namehash } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

const PARENT_DOMAIN = 'twinmarket.eth';
const SEPOLIA_PUBLIC_RESOLVER = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5' as const;
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as const;

const ensRegistryAbi = [
  {
    name: 'setSubnodeRecord',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'label', type: 'bytes32' },
      { name: 'owner', type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'ttl', type: 'uint64' },
    ],
    outputs: [],
  },
] as const;

type AgentRegistrationMetadata = {
  price: string;
  description: string;
  url: string;
  avatar: string;
  worldVerified: string;
  worldAgentbookId: string;
};

function getRpcUrl() {
  return process.env.SEPOLIA_RPC_URL;
}

function getEnsOwnerClient() {
  const privateKey = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ENS_OWNER_PRIVATE_KEY environment variable is not set');
  }

  return createWalletClient({
    account: privateKeyToAccount(privateKey as `0x${string}`),
    chain: addEnsContracts(sepolia),
    transport: http(getRpcUrl()),
  });
}

function getPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(getRpcUrl()),
  });
}

export async function registerAgent(
  slug: string,
  agentAddress: `0x${string}`,
  metadata: AgentRegistrationMetadata,
): Promise<{ ensName: string; txHashes: Hash[] }> {
  const wallet = getEnsOwnerClient();
  const publicClient = getPublicClient();
  const ensName = getAgentEnsName(slug);

  const parentNode = namehash(PARENT_DOMAIN);
  const label = labelhash(slug);

  // Grab nonce so we can send both TXs to the mempool simultaneously.
  // TX1 gets nonce N, TX2 gets nonce N+1. Miner orders them correctly.
  const nonce = await publicClient.getTransactionCount({ address: wallet.account.address });

  // TX1: Create subname + set resolver
  const createTxHash = await wallet.writeContract({
    address: ENS_REGISTRY,
    abi: ensRegistryAbi,
    functionName: 'setSubnodeRecord',
    args: [parentNode, label, wallet.account.address, SEPOLIA_PUBLIC_RESOLVER, BigInt(0)],
    nonce,
  });

  // TX2: Set text records + address. Explicit gas skips eth_estimateGas
  // (simulation would fail because TX1 isn't mined yet).
  const recordsTxHash = await setRecords(wallet, {
    name: ensName,
    resolverAddress: SEPOLIA_PUBLIC_RESOLVER,
    coins: [{ coin: 'ETH', value: agentAddress }],
    texts: [
      { key: 'description', value: metadata.description },
      { key: 'url', value: metadata.url },
      { key: 'avatar', value: metadata.avatar },
      { key: 'world.verified', value: metadata.worldVerified },
      { key: 'world.agentbook_id', value: metadata.worldAgentbookId },
      { key: 'price', value: metadata.price },
    ],
    nonce: nonce + 1,
    gas: BigInt(1_000_000),
  });

  return { ensName, txHashes: [createTxHash, recordsTxHash] };
}

export async function getAgentTextRecord(slug: string, key: string): Promise<string | null> {
  const ensName = getAgentEnsName(slug);
  return getPublicClient().getEnsText({ name: normalize(ensName), key });
}

function getAgentEnsName(slug: string): string {
  return `${slug}.${PARENT_DOMAIN}`;
}

export async function getAgentAddress(slug: string): Promise<string | null> {
  const ensName = getAgentEnsName(slug);
  return getPublicClient().getEnsAddress({ name: normalize(ensName) });
}

export async function getAgentPricing(slug: string): Promise<{ price: string | null; agentAddress: string | null }> {
  const [price, agentAddress] = await Promise.all([getAgentTextRecord(slug, 'price'), getAgentAddress(slug)]);
  return { price, agentAddress };
}

const ENS_TEXT_KEYS = ['description', 'url', 'avatar', 'world.verified', 'world.agentbook_id'] as const;

export type EnsRecords = {
  description: string | null;
  url: string | null;
  avatar: string | null;
  worldVerified: string | null;
  worldAgentbookId: string | null;
  ethAddress: string | null;
};

export async function getEnsRecords(ensName: string): Promise<EnsRecords> {
  const client = createPublicClient({
    chain: addEnsContracts(sepolia),
    transport: http(getRpcUrl()),
  });

  const results = await batch(
    client,
    ...ENS_TEXT_KEYS.map((key) => getTextRecord.batch({ name: ensName, key })),
    getAddressRecord.batch({ name: ensName, coin: 'ETH' }),
  );

  const textResults = results.slice(0, ENS_TEXT_KEYS.length) as (string | null)[];
  const addressResult = results[ENS_TEXT_KEYS.length] as { value: string } | null;

  return {
    description: textResults[0] ?? null,
    url: textResults[1] ?? null,
    avatar: textResults[2] ?? null,
    worldVerified: textResults[3] ?? null,
    worldAgentbookId: textResults[4] ?? null,
    ethAddress: addressResult?.value ?? null,
  };
}
