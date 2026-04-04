import { addEnsContracts } from '@ensdomains/ensjs';
import { createSubname, setRecords, setResolver } from '@ensdomains/ensjs/wallet';
import { createPublicClient, createWalletClient, type Hash, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

const PARENT_DOMAIN = 'twinmarket.eth';
const SEPOLIA_PUBLIC_RESOLVER = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5' as const;
const chain = addEnsContracts(sepolia);

const publicClient = createPublicClient({ chain, transport: http() });

function getWalletClient() {
  const privateKey = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ENS_OWNER_PRIVATE_KEY environment variable is not set');
  }
  return createWalletClient({
    account: privateKeyToAccount(privateKey as `0x${string}`),
    chain,
    transport: http(),
  });
}

type AgentRegistrationMetadata = {
  price: string;
  description: string;
  url: string;
  avatar: string;
  worldVerified: string;
  worldAgentbookId: string;
};

export async function registerAgent(
  slug: string,
  agentAddress: `0x${string}`,
  metadata: AgentRegistrationMetadata,
): Promise<{ ensName: string; txHashes: Hash[] }> {
  const wallet = getWalletClient();
  const ensName = getAgentEnsName(slug);

  const subnameTxHash = await createSubname(wallet, {
    name: ensName,
    owner: wallet.account.address,
    contract: 'registry',
  });

  await setResolver(wallet, {
    name: ensName,
    contract: 'registry',
    resolverAddress: SEPOLIA_PUBLIC_RESOLVER,
  });

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
  });

  return { ensName, txHashes: [subnameTxHash, recordsTxHash] };
}

export async function getTextRecord(slug: string, key: string): Promise<string | null> {
  const ensName = getAgentEnsName(slug);
  return publicClient.getEnsText({ name: normalize(ensName), key });
}

function getAgentEnsName(slug: string): string {
  return `${slug}.${PARENT_DOMAIN}`;
}

export async function getAgentAddress(slug: string): Promise<string | null> {
  const ensName = getAgentEnsName(slug);
  return publicClient.getEnsAddress({ name: normalize(ensName) });
}

export async function getAgentPricing(slug: string): Promise<{ price: string | null; agentAddress: string | null }> {
  const [price, agentAddress] = await Promise.all([getTextRecord(slug, 'price'), getAgentAddress(slug)]);
  return { price, agentAddress };
}
