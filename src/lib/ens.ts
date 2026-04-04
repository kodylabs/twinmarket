import { addEnsContracts } from '@ensdomains/ensjs';
import { createSubname, setRecords, setResolver } from '@ensdomains/ensjs/wallet';
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

export async function registerEnsName(
  slug: string,
  agentAddress: `0x${string}`,
  metadata: Omit<AgentRecordsParams, 'ensName' | 'ownerAddress'>,
): Promise<{ ensName: string; txHashes: Hash[] }> {
  const wallet = getEnsOwnerClient();
  const ensName = `${slug}.${PARENT_DOMAIN}`;

  // Parent wallet creates subname and stays owner (agent wallet has no ETH for gas)
  // The addr record points to the agent wallet for resolution
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
    ],
  });

  return {
    ensName,
    txHashes: [subnameTxHash, recordsTxHash],
  };
}
