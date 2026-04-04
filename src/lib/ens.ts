import { addEnsContracts } from '@ensdomains/ensjs';
import { createSubname, setRecords } from '@ensdomains/ensjs/wallet';
import { createWalletClient, type Hash, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

const PARENT_DOMAIN = 'twinmarket.eth';
const SEPOLIA_PUBLIC_RESOLVER = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5' as const;

type AgentRecordsParams = {
  ensName: string;
  ownerAddress: `0x${string}`;
  description: string;
  url: string;
  avatar: string;
  worldVerified: string;
  worldAgentbookId: string;
  arcAddress: string;
};

function getEnsOwnerClient() {
  const privateKey = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ENS_OWNER_PRIVATE_KEY environment variable is not set');
  }

  return createWalletClient({
    account: privateKeyToAccount(privateKey as `0x${string}`),
    chain: addEnsContracts(sepolia),
    transport: http(),
  });
}

function getEnsAgentClient(agentPrivateKey: `0x${string}`) {
  return createWalletClient({
    account: privateKeyToAccount(agentPrivateKey),
    chain: addEnsContracts(sepolia),
    transport: http(),
  });
}

export async function registerSubname(slug: string, ownerAddress: `0x${string}`): Promise<Hash> {
  const wallet = getEnsOwnerClient();

  return createSubname(wallet, {
    name: `${slug}.${PARENT_DOMAIN}`,
    owner: ownerAddress,
    contract: 'registry',
  });
}

export async function setAgentRecords(agentPrivateKey: `0x${string}`, params: AgentRecordsParams): Promise<Hash> {
  const wallet = getEnsAgentClient(agentPrivateKey);

  return setRecords(wallet, {
    name: params.ensName,
    resolverAddress: SEPOLIA_PUBLIC_RESOLVER,
    coins: [{ coin: 'ETH', value: params.ownerAddress }],
    texts: [
      { key: 'description', value: params.description },
      { key: 'url', value: params.url },
      { key: 'avatar', value: params.avatar },
      { key: 'world.verified', value: params.worldVerified },
      { key: 'world.agentbook_id', value: params.worldAgentbookId },
      { key: 'arc.address', value: params.arcAddress },
    ],
  });
}

export async function registerEnsName(
  slug: string,
  ownerAddress: `0x${string}`,
  agentPrivateKey: `0x${string}`,
  metadata: Omit<AgentRecordsParams, 'ensName' | 'ownerAddress'>,
): Promise<{ ensName: string; txHashes: Hash[] }> {
  const ensName = `${slug}.${PARENT_DOMAIN}`;

  const subnameTxHash = await registerSubname(slug, ownerAddress);
  const recordsTxHash = await setAgentRecords(agentPrivateKey, {
    ensName,
    ownerAddress,
    ...metadata,
  });

  return {
    ensName,
    txHashes: [subnameTxHash, recordsTxHash],
  };
}
