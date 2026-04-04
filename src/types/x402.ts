export interface PaymentProof {
  txHash: string;
  network: string;
  amount: string; // USDC string e.g. "0.05"
  recipient: string; // EVM address
}

export interface X402Instructions {
  version: 'x402/1';
  network: 'arc-testnet';
  asset: 'USDC';
  amount: string;
  payTo: string;
  description: string;
}
