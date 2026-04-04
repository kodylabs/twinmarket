/**
 * x402.ts
 *
 * Middleware for HTTP 402 Payment Required — x402 protocol.
 * Handles the full payment gate for agent API calls:
 *
 *   1. requirePayment() → call this at the top of the chat route handler
 *      - Resolves agent price (via price-resolver.ts and ENS)
 *      - If free agent → returns null (pass-through)
 *      - If no payment header → returns 402 with payment instructions
 *      - If payment header present → verifies tx on-chain (Arc testnet)
 *      - If valid → returns null (pass-through)
 *      - If invalid → returns 402 again
 *
 *   2. verifyPayment() → on-chain verification via Arc testnet RPC
 *
 * x402 header format (sent by the MCP x402 client):
 *   X-Payment: <base64-encoded JSON>
 *
 *   Decoded payload:
 *   {
 *     txHash: "0x...",
 *     network: "arc-testnet",
 *     amount: "0.05",       // USDC string
 *     recipient: "0x..."    // must match agent payTo
 *   }
 */

import { resolveAgentPricing } from '@/lib/price-resolver';
import type { TransactionReceipt } from '@/types/rpc';
import type { PaymentProof, X402Instructions } from '@/types/x402';

const ARC_TESTNET_RPC = 'https://rpc.arc-testnet.circle.com'; // update if URL changes
const USDC_CONTRACT_ARC_TESTNET = '0x3600000000000000000000000000000000000000'; // Arc testnet USDC address
const PAYMENT_HEADER = 'x-payment';
const REQUIRED_CONFIRMATIONS = 1; // Arc has fast finality, 1 is enough on testnet

/**
 * Call this at the top of the chat route handler, after loading the agent metadata.
 *
 * @returns Response (402) if payment is required or invalid
 * @returns null if the request should proceed (free agent or valid payment)
 */
export async function requirePayment(
  request: Request,
  agent: { slug: string; name: string },
): Promise<Response | null> {
  // 1. Resolve price from ENS
  // TODO: waiting for the ENS service
  const { price, payTo } = await resolveAgentPricing(agent.slug);

  // 2. Free agent — skip payment entirely
  if (price === null || payTo === null) {
    return null;
  }

  const amountStr = price.toFixed(6); // For USDC, 6 decimals

  // 3. Check for payment proof in header
  const paymentHeader = request.headers.get(PAYMENT_HEADER);

  if (!paymentHeader) {
    // No payment attempt — return 402 with instructions
    return payment402Response(agent, amountStr, payTo);
  }

  // 4. Decode and validate payment proof
  let proof: PaymentProof;
  try {
    const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
    proof = JSON.parse(decoded) as PaymentProof;
  } catch {
    return errorResponse(402, 'Invalid payment header — expected base64-encoded JSON', {
      ...buildInstructions(agent, amountStr, payTo),
    });
  }

  // 5. Sanity checks before hitting the RPC
  if (!isValidTxHash(proof.txHash)) {
    return errorResponse(402, 'Invalid txHash format', {
      ...buildInstructions(agent, amountStr, payTo),
    });
  }

  if (proof.network !== 'arc-testnet') {
    return errorResponse(402, `Wrong network: expected arc-testnet, got ${proof.network}`, {
      ...buildInstructions(agent, amountStr, payTo),
    });
  }

  if (proof.recipient.toLowerCase() !== payTo.toLowerCase()) {
    return errorResponse(402, 'Payment recipient does not match agent wallet', {
      ...buildInstructions(agent, amountStr, payTo),
    });
  }

  if (parseFloat(proof.amount) < price) {
    return errorResponse(402, `Insufficient payment: expected ${amountStr} USDC, got ${proof.amount}`, {
      ...buildInstructions(agent, amountStr, payTo),
    });
  }

  // 6. Verify on-chain
  const isValid = await verifyPayment(proof, price, payTo);

  if (!isValid) {
    return errorResponse(402, 'Payment not confirmed on-chain — tx not found or insufficient amount', {
      ...buildInstructions(agent, amountStr, payTo),
    });
  }

  // 7. Payment valid — let the request through
  return null;
}

/**
 * Verifies a USDC transfer transaction on Arc testnet.
 *
 * Strategy: call eth_getTransactionReceipt via JSON-RPC,
 * then decode the ERC-20 Transfer log to confirm:
 *   - tx is successful (status === 1)
 *   - from the USDC contract
 *   - recipient matches payTo
 *   - amount >= expected
 */
export async function verifyPayment(
  proof: PaymentProof,
  expectedAmountUsdc: number,
  expectedRecipient: string,
): Promise<boolean> {
  try {
    // Fetch receipt
    const receipt = await arcRpcCall<TransactionReceipt>('eth_getTransactionReceipt', [proof.txHash]);

    if (!receipt) {
      console.warn(`[x402] tx not found: ${proof.txHash}`);
      return false;
    }

    // Check tx success
    if (receipt.status !== '0x1') {
      console.warn(`[x402] tx failed on-chain: ${proof.txHash}`);
      return false;
    }

    // Check confirmations (block number delta)
    const currentBlock = await arcRpcCall<string>('eth_blockNumber', []);
    const txBlock = parseInt(receipt.blockNumber, 16);
    const currentBlockNum = parseInt(currentBlock, 16);
    const confirmations = currentBlockNum - txBlock;

    if (confirmations < REQUIRED_CONFIRMATIONS) {
      console.warn(`[x402] tx not enough confirmations: ${confirmations}/${REQUIRED_CONFIRMATIONS}`);
      return false;
    }

    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    const transferLog = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === USDC_CONTRACT_ARC_TESTNET.toLowerCase() &&
        log.topics[0] === TRANSFER_TOPIC &&
        // topics[2] = recipient (padded to 32 bytes)
        log.topics[2]?.toLowerCase() === padAddress(expectedRecipient).toLowerCase(),
    );

    if (!transferLog) {
      console.warn(`[x402] no USDC Transfer log found for recipient ${expectedRecipient}`);
      return false;
    }

    // Decode amount from log data (uint256, 6 decimals for USDC)
    const rawAmount = BigInt(transferLog.data);
    const usdcDecimals = 6;
    const actualAmount = Number(rawAmount) / Number(10 ** usdcDecimals);

    if (actualAmount < expectedAmountUsdc) {
      console.warn(`[x402] insufficient amount: expected ${expectedAmountUsdc}, got ${actualAmount}`);
      return false;
    }

    console.log(`[x402] payment verified ✓ txHash=${proof.txHash} amount=${actualAmount} USDC`);
    return true;
  } catch (error) {
    console.error('[x402] on-chain verification failed:', error);
    return false;
  }
}

/** Minimal JSON-RPC client for Arc testnet */
async function arcRpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(ARC_TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Arc RPC HTTP error: ${response.status}`);
  }

  const json = (await response.json()) as { result: T; error?: { message: string } };

  if (json.error) {
    throw new Error(`Arc RPC error: ${json.error.message}`);
  }

  return json.result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInstructions(agent: { slug: string; name: string }, amount: string, payTo: string): X402Instructions {
  return {
    version: 'x402/1',
    network: 'arc-testnet',
    asset: 'USDC',
    amount,
    payTo,
    description: `Payment for agent: ${agent.name} (${agent.slug})`,
  };
}

function payment402Response(agent: { slug: string; name: string }, amount: string, payTo: string): Response {
  const instructions = buildInstructions(agent, amount, payTo);
  return Response.json(
    {
      error: 'Payment required',
      x402: instructions,
    },
    {
      status: 402,
      headers: {
        'X-Payment-Required': JSON.stringify(instructions),
        'Content-Type': 'application/json',
      },
    },
  );
}

function errorResponse(status: number, message: string, x402?: X402Instructions): Response {
  return Response.json({ error: message, ...(x402 ? { x402 } : {}) }, { status });
}

function isValidTxHash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

/** Pad an EVM address to 32 bytes (for topic matching) */
function padAddress(address: string): string {
  return `0x${address.replace('0x', '').toLowerCase().padStart(64, '0')}`;
}
