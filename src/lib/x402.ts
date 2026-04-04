/**
 * x402 Resource Server — Circle Gateway facilitator (Arc testnet)
 *
 * Uses Circle Gateway's batched settlement for gas-free USDC nanopayments on Arc.
 * The protocol is standard x402 — withX402 from @x402/next works unchanged.
 */

import { BatchFacilitatorClient, GatewayEvmScheme } from '@circle-fin/x402-batching/server';
import { type FacilitatorClient, x402ResourceServer } from '@x402/core/server';

export const X402_NETWORK = 'eip155:5042002' as const; // Arc testnet
const facilitator = new BatchFacilitatorClient(); // defaults to https://gateway-api-testnet.circle.com

export const x402Server = new x402ResourceServer(facilitator as FacilitatorClient);
x402Server.register(X402_NETWORK, new GatewayEvmScheme());
