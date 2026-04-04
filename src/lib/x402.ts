/**
 * x402 Resource Server — standard protocol (Coinbase facilitator)
 *
 * Exports a configured x402ResourceServer instance for use with @x402/next's withX402 wrapper.
 * Uses the public x402.org facilitator for payment verification and settlement.
 * Network: Base Sepolia (eip155:84532) with USDC.
 */

import { HTTPFacilitatorClient, x402ResourceServer } from '@x402/core/server';
import { registerExactEvmScheme } from '@x402/evm/exact/server';

const facilitator = new HTTPFacilitatorClient({
  url: 'https://x402.org/facilitator',
});

export const x402Server = new x402ResourceServer(facilitator);
registerExactEvmScheme(x402Server);

export const X402_NETWORK = 'eip155:84532' as const; // Base Sepolia
