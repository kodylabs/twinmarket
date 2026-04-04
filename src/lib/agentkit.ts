import 'server-only';

import { createAgentBookVerifier } from '@worldcoin/agentkit';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export function generateAgentWallet() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { privateKey, address: account.address };
}

// The agentkit SDK provides verification but not programmatic registration.
// Registration is done via CLI: npx @worldcoin/agentkit-cli register <address>
export async function registerAgentOnWorldChain(
  walletAddress: string,
): Promise<{ success: boolean; agentBookId?: string }> {
  try {
    const verifier = createAgentBookVerifier();
    const humanId = await verifier.lookupHuman(walletAddress, 'eip155:480');

    if (humanId) {
      return { success: true, agentBookId: humanId };
    }

    console.warn(
      `Agent ${walletAddress} not found in AgentBook. ` +
        `Register via CLI: npx @worldcoin/agentkit-cli register ${walletAddress}`,
    );
    return { success: false };
  } catch (error) {
    console.warn('AgentKit registration check failed:', error);
    return { success: false };
  }
}
