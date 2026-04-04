export interface TransactionReceipt {
  status: string; // "0x1" = success
  blockNumber: string; // hex
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
}
